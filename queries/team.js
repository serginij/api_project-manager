const db = require('../db');
const desk = require('./desk');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const helpers = require('../helpers');

const pool = db.pool;

const secretKey = process.env.SECRET_OR_KEY;

const getTeams = async (request, response) => {
  console.log(request.headers);

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
        'select public.user.id, username, team_user.is_admin from public.user join team_user on public.user.id=team_user.user_id where public.user.id in (select user_id from team_user where team_id=$1)',
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

    console.log('response', teams);
    response.status(200).send({ teams: teams, desks: deskRes, ok: true });
  } catch (err) {
    switch (err) {
      case 400:
        response.status(400).send({ message: 'Incorrect data', ok: false });
        break;
      case 403:
        response.status(403).send({ message: 'Access denied', ok: false });
        break;
      case 500:
        response.status(500).json({ message: 'Something went wrong', ok: false });
        break;
      case 401:
        response.status(401).json({ message: 'Invalid token', ok: false });
      default:
        response.status(500).json({ message: 'Something went wrong', ok: false });
        break;
    }
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log(err);
  }
};

const getTeamById = async (request, response) => {
  const id = parseInt(request.params.id);

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

  const { user_id, username } = helpers.checkToken(request, response);

  console.log('update team', request.body, id);
  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, id]
    );
    if (!user.rows[0].is_admin) {
      response.status(403).send({ message: 'Access denied', ok: false });
    }
    if (name && id) {
      let results = await pool.query('update team set name = $1, "desc" = $2 where id = $3', [
        name,
        desc,
        id
      ]);

      response.status(200).send({ message: `Team modified with id: ${id}`, ok: true });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log(err);
  }
};

const deleteTeam = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('delete from team where id = $1', [id], (err, results) => {
    if (err) {
      throw err;
    }
    response.status(200).send({ message: `Team deleted with id: ${id}`, ok: true });
  });
};

const createTeamUser = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const { userId } = request.body;

  const { user_id, username } = helpers.checkToken(request, response);

  console.log('creteTeamUser', userId, teamId);
  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId]
    );
    if (!user.rows[0].is_admin) {
      response.status(403).send({ message: 'Access denied', ok: false });
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
        response.status(400).send({ message: 'User already exists', ok: false });
      }
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).json({ message: 'Something went wrong', ok: false });
    console.log(err);
  }
};

const updateTeamUser = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const userId = parseInt(request.params.userId);
  const { isAdmin } = request.body;

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId]
    );
    if (!user.rows[0].is_admin) {
      response.status(403).send({ message: 'Access denied', ok: false });
    }
    if (teamId && userId && isAdmin !== undefined) {
      let results = await pool.query(
        'update team_user set is_admin = $1 where team_id = $2 and user_id = $3',
        [isAdmin, teamId, userId]
      );
      response.status(200).send({ message: `Team user ${userId} modified with`, ok: true });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
  }
};

const deleteTeamUser = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const userId = parseInt(request.params.userId);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId]
    );
    if (!user.rows[0].is_admin) {
      response.status(403).send({ message: 'Access denied', ok: false });
    }
    if (teamId && userId) {
      let results = await pool.query('delete from team_user where team_id = $1 and user_id = $2', [
        teamId,
        userId
      ]);

      response.status(200).send({ message: `Team user deleted successfully`, ok: true });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
  }
};

const findTeamUser = async (request, response) => {
  const { username, teamId } = request.params;
  console.log('findUser', username);
  try {
    if (!username) {
      response.status(400).json({ message: 'No username passed' });
    }

    let result = await pool.query(
      `select id, username from public.user where id in (select user_id from team_user where team_id = ${teamId} and user_id in (select id from public.user where username like '%${username}%'))`
      // `select id, username from team_user where team_id = ${teamId} and user_id in (select id from public.user where username like '%${username}%')`
    );
    console.log(result);

    response.status(200).json({ users: result.rows, ok: true });
  } catch (err) {
    response.status(500).json({ message: 'something went wrong', ok: false });
    console.log('LOGIN ERR', err);
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
