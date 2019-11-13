const db = require("../db");
const desk = require("./desk");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const helpers = require("../helpers");

const pool = db.pool;

const secretKey = process.env.SECRET_OR_KEY;

const getTeams = async (request, response) => {
  console.log(request.headers);

  const { id, username } = helpers.checkToken(request, response);

  try {
    const results = await pool.query(
      "select * from team where id in (select team_id from team_user where user_id = $1) order by id asc",
      [id]
    );

    let deskRes = {};

    let promises = results.rows.map(async (t, index) => {
      const team = await pool.query("select * from team where id = $1", [t.id]);
      // select public.user.id, username, team_user.is_admin from public.user join team_user on public.user.id=team_user.user_id where public.user.id in (select user_id from team_user where team_id=3);

      const users = await pool.query(
        "select public.user.id, username, team_user.is_admin from public.user join team_user on public.user.id=team_user.user_id where public.user.id in (select user_id from team_user where team_id=$1)",
        [t.id]
      );

      const isAdmin = await pool.query(
        "select is_admin, id from team_user where user_id = $1 and team_id = $2",
        [id, t.id]
      );

      console.log(isAdmin);

      const desks = isAdmin.rows[0].is_admin
        ? await pool.query(
            "select * from desk where team_id = $1 order by id asc",
            [t.id]
          )
        : await pool.query(
            "select * from desk where team_id = $1 and id in (select desk_id from desk_user where team_user_id = $2)",
            [t.id, isAdmin.rows[0].id]
          );

      results.rows[index].users = users.rows.length ? [...users.rows] : [];
      results.rows[index].isAdmin = isAdmin.rows.length
        ? isAdmin.rows[0].is_admin
        : null;

      results.rows[index].desks = [];
      desks.rows.forEach(row => {
        deskRes[row.id] = row;
        return results.rows[index].desks.push(row.id);
      });

      console.log(`Team ${t.id}`, team.rows[0], deskRes);
    });

    await Promise.all(promises);

    console.log("response", results.rows);
    response.status(200).send({ teams: results.rows, desks: deskRes });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong" });
    console.log(err);
  }
};

const getTeamById = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const results = await pool.query("select * from team where id = $1", [id]);

    const users = await pool.query(
      "select id, username from public.user where id in (select user_id from team_user where team_id = $1)",
      [id]
    );
    const desks = await pool.query(
      "select * from desk where team_id = $1 order by id asc",
      [id]
    );

    results.rows[0].users = users.rows[0] ? [users.rows[0]] : [];
    let deskRes = {};
    results.rows[0].desks = [];
    desks.rows.forEach(row => {
      deskRes[row.id] = row;
      results.rows[0].desks.push(row.id);
    });

    response.status(200).send({ team: results.rows[0], desks: deskRes });
  } catch (err) {
    response.status(500).send(`Something went wrong`);
    console.log(err);
  }
};

const createTeam = async (request, response) => {
  const { name, desc } = request.body;

  const { id, username } = helpers.checkToken(request, response);

  try {
    if (name) {
      const results = await pool.query(
        'insert into team (name, "desc") values ($1, $2) returning id',
        [name, desc]
      );

      const team_user = await pool.query(
        "insert into team_user (team_id, user_id, is_admin) values ($1, $2, true)",
        [results.rows[0].id, id]
      );

      response
        .status(201)
        .send(`Team added successfully with id ${results.rows[0].id}`);
    } else {
      response.status(400).send("Incorrect data");
    }
  } catch (err) {
    response.status(500).send({ message: "Something went wrong" });
    console.log(err);
  }
};

const updateTeam = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, desc } = request.body;

  if (name && id) {
    pool.query(
      "update team set name = $1, desc = $2 where id = $3",
      [name, desc, id],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`Team modified with id: ${id}`);
      }
    );
  } else {
    response.status(400).send("Incorrect data");
  }
};

const deleteTeam = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("delete from team where id = $1", [id], (err, results) => {
    if (err) {
      throw err;
    }
    response.status(200).send(`Team deleted with id: ${id}`);
  });
};

const createTeamUser = (request, response) => {
  const { userId, teamId, isAdmin } = request.body;

  if (userId && teamId && isAdmin !== undefined) {
    pool.query(
      "insert into team_user (user_id, team_id, is_admin) values ($1, $2, $3)",
      [userId, teamId, isAdmin],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`User (${userId}) added successfully`);
      }
    );
  } else {
    response.status(400).send("Incorrect data");
  }
};

const updateTeamUser = (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const userId = parseInt(request.params.userId);
  const { isAdmin } = request.body;

  if (teamId && userId && isAdmin !== undefined) {
    pool.query(
      "update team_user set is_admin = $1 where team_id = $2 and user_id = $3",
      [isAdmin, teamId, userId],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`Team modified with id: ${id}`);
      }
    );
  } else {
    response.status(400).send("Incorrect data");
  }
};

const deleteTeamUser = (request, response) => {
  const teamId = parseInt(request.params.teamId);
  const userId = parseInt(request.params.userId);

  if (teamId && userId) {
    pool.query(
      "delete from team_user where team_id = $1 and user_id = $2",
      [teamId, userId],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`Team user deleted successfully`);
      }
    );
  } else {
    response.status(400).send("Incorrect data");
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
  deleteTeamUser
};
