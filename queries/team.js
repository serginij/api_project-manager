const db = require('../db');
const desk = require('./desk');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const helpers = require('../helpers');

const pool = db.pool;

const secretKey = process.env.SECRET_OR_KEY;

const getTeams = async (request, response) => {
  console.log('getTeams', request.params, request.body);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    const results = await pool.query(
      'select * from team where id in (select team_id from team_user where user_id = $1) order by id asc',
      [user_id]
    );

    let deskRes = {},
      teams = {};

    let promises = results.rows.map(async (t, index) => {
      const team = await pool.query('select * from team where id = $1', [t.id]);

      const users = await pool.query(
        'select public.user.id, username, team_user.is_admin from public.user join team_user on public.user.id=team_user.user_id where public.user.id in (select user_id from team_user where team_id=$1) and team_user.team_id = $1',
        [t.id]
      );

      const isAdmin = await pool.query(
        'select is_admin, id from team_user where user_id = $1 and team_id = $2',
        [user_id, t.id]
      );

      const desks = isAdmin.rows[0].is_admin
        ? await pool.query('select * from desk where team_id = $1 order by id asc', [t.id])
        : await pool.query(
            'select * from desk where team_id = $1 and id in (select desk_id from desk_user where team_user_id = $2)',
            [t.id, isAdmin.rows[0].id]
          );

      teams[t.id] = t;
      teams[t.id].users = users.rows.length ? [...users.rows] : [];
      teams[t.id].isAdmin = isAdmin.rows.length ? isAdmin.rows[0].is_admin : null;
      teams[t.id].desks = [];

      desks.rows.forEach(row => {
        deskRes[row.id] = row;
        return teams[t.id].desks.push(row.id);
      });
    });

    await Promise.all(promises);

    response.status(200).send({ teams: teams, desks: deskRes, ok: true });
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const getTeamById = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('getTeamById', request.params, request.body);

  try {
    const results = await pool.query('select * from team where id = $1', [id]);

    const users = await pool.query(
      'select id, username from public.user where id in (select user_id from team_user where team_id = $1)',
      [id]
    );
    const desks = await pool.query('select * from desk where team_id = $1 order by id asc', [id]);

    results.rows[0].users = users.rows[0] ? [users.rows[0]] : [];
    let deskRes = {};
    results.rows[0].desks = [];
    desks.rows.forEach(row => {
      deskRes[row.id] = row;
      results.rows[0].desks.push(row.id);
    });

    response.status(200).send({ team: results.rows[0], desks: deskRes, ok: true });
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log(err);
  }
};

const createTeam = async (request, response) => {
  const { name, desc } = request.body;

  console.log('createTeam', request.params, request.body);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    if (name) {
      const results = await pool.query(
        'insert into team (name, "desc") values ($1, $2) returning id',
        [name, desc]
      );

      const team_user = await pool.query(
        'insert into team_user (team_id, user_id, is_admin) values ($1, $2, true)',
        [results.rows[0].id, user_id]
      );

      response
        .status(201)
        .send({ message: `Team added successfully with id ${results.rows[0].id}`, ok: true });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log(err);
  }
};

const updateTeam = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name, desc } = request.body;
  console.log('updateTeam', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (name && id) {
      let results = await pool.query('update team set name = $1, "desc" = $2 where id = $3', [
        name,
        desc,
        id
      ]);

      response.status(200).send({ message: `Team modified with id: ${id}`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const deleteTeam = async (request, response) => {
  const { id } = parseInt(request.params);

  console.log('deleteTeam', request.params, request.body);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (teamId) {
      let results = await pool.query('delete from team where id = $1', [id]);

      response.status(200).send({ message: `Team (id ${id}) deleted successfully`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const createTeamUser = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const { userId } = request.body;
  console.log('createTeamUser', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (userId && teamId) {
      let user = await pool.query('select id from team_user where user_id = $1 and team_id = $2', [
        userId,
        teamId
      ]);

      if (!user.rows.length) {
        let results = await pool.query(
          'insert into team_user (user_id, team_id, is_admin) values ($1, $2, $3) returning is_admin',
          [userId, teamId, false]
        );

        Promise.all(results);

        response.status(200).json({
          message: `User (${userId}) added successfully to team ${teamId}`,
          is_admin: results.rows[0].is_admin,
          ok: true
        });
      } else {
        throw 400;
      }
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const updateTeamUser = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const userId = parseInt(request.params.userId);
  const { isAdmin } = request.body;
  console.log('updateTeamUser', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (teamId && userId && isAdmin !== undefined && userId !== user_id) {
      let results = await pool.query(
        'update team_user set is_admin = $1 where team_id = $2 and user_id = $3',
        [isAdmin, teamId, userId]
      );
      response.status(200).send({ message: `Team user ${userId} modified with`, ok: true });
    } else {
      throw 500;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const deleteTeamUser = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const userId = parseInt(request.params.userId);
  console.log('deleteTeamUser', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (teamId && userId) {
      let results = await pool.query('delete from team_user where team_id = $1 and user_id = $2', [
        teamId,
        userId
      ]);

      response.status(200).send({ message: `Team user deleted successfully`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const findTeamUser = async (request, response) => {
  const { username, teamId } = request.params;
  console.log('findTeamUser', request.params, request.body);

  try {
    if (!username) {
      throw 400;
    }

    let result = await pool.query(
      `select id, username from public.user where id in (select user_id from team_user where team_id = ${teamId} and user_id in (select id from public.user where username like '%${username}%'))`
    );
    console.log(result);

    response.status(200).json({ users: result.rows, ok: true });
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  createTeamUser,
  updateTeamUser,
  deleteTeamUser,
  findTeamUser
};
