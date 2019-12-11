const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const getTeamDesks = async (request, response) => {
  const teamId = parseInt(request.params.teamId);
  console.log('getTeamDesks', request.params, request.body);

  try {
    const results = await pool.query('select * from desk where team_id = $1 order by id asc', [
      teamId
    ]);

    response.status(200).json(results.rows);
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('getTeamDesks', err);
  }
};

const getDeskUsers = (request, response) => {
  const deskId = parseInt(request.params.id);
  console.log('getDeskUsers', request.params, request.body);

  try {
    pool.query(
      'select id, username from public.user where id in (select user_id from team_user where id in (select team_user_id from desk_user where desk_id = $1 ))',
      [deskId],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).json(results.rows);
      }
    );
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('getDeskUsers', err);
  }
};

const getDesk = async (request, response) => {
  const deskId = parseInt(request.params.deskId);
  console.log('getDesk', request.params, request.body);

  try {
    const results = await pool.query('select * from desk where id = $1', [deskId]);

    const columns = await pool.query('select id, name from public.column where desk_id = $1', [
      deskId
    ]);
    const users = await pool.query(
      'select id, username from public.user where id in (select user_id from team_user where id in (select team_user_id from desk_user where desk_id = $1))',
      [deskId]
    );

    let colRes = {};
    let cardRes = {};

    let promises = columns.rows.map(async column => {
      const cards = await pool.query(
        'select * from card where id in (select card_id from card_user where column_id = $1)',
        [column.id]
      );

      colRes[column.id] = column;
      colRes[column.id].cards = [];
      cards.rows.forEach(card => {
        cardRes[card.id] = card;
        colRes[column.id].cards.push(card.id);
      });
      return column.id;
    });

    results.rows[0].users = users.rows[0] ? [users.rows[0]] : [];
    results.rows[0].columns = await Promise.all(promises);

    response.status(200).send({ desk: results.rows[0], columns: colRes, cards: cardRes, ok: true });
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('getDesk', err);
  }
};

const createDesk = (request, response) => {
  const { name, teamId } = request.body;
  console.log('createDesk', request.params, request.body);

  try {
    if (name && teamId) {
      pool.query(
        'insert into desk (name, team_id) values ($1, $2) returning id',
        [name, teamId],
        (err, results) => {
          if (err) {
            response.status(500).send({ message: `Something went wrong`, ok: false });
            throw err;
          }
          console.log(results);
          response
            .status(201)
            .send({ message: `Desk added successfully`, ok: true, id: results.rows[0].id });
        }
      );
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    console.log('createDesk', err);
  }
};

const updateDesk = async (request, response) => {
  const deskId = parseInt(request.params.deskId);
  const { name } = request.body;

  console.log('updateDesk', deskId, name);
  const { user_id, username } = helpers.checkToken(request, response);

  console.log('update desk', request.params, request.body);
  try {
    let teamId = await pool.query('select team_id from desk where id = $1', [deskId]);
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (name && deskId && user.rows[0].is_admin) {
      let results = await pool.query('update desk set name = $1 where id = $2', [name, deskId]);

      response.status(200).send({ message: `Desk modified with id: ${deskId}`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const createDeskUser = async (request, response) => {
  const deskId = parseInt(request.params.deskId);
  const { userId } = request.body;

  console.log('createDeskUser', request.params, request.body);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query('select team_id from desk where id = $1', [deskId]);
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (userId && deskId) {
      let user = await pool.query('select id from team_user where user_id = $1 and team_id = $2', [
        userId,
        teamId.rows[0].team_id
      ]);

      if (user.rows.length) {
        let results = await pool.query(
          'insert into desk_user (team_user_id, desk_id) values ((select id from team_user where team_id = $1 and user_id = $2), $3)',
          [teamId.rows[0].team_id, userId, deskId]
        );

        Promise.all(results);

        response.status(200).json({
          message: `User (${userId}) added successfully to desk ${deskId}`,
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

const deleteDeskUser = async (request, response) => {
  const { deskId, userId } = parseInt(request.params);

  console.log('deleteDeskUser', request.params, request.body);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query('select team_id from desk where id = $1', [deskId]);
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (deskId && userId) {
      let results = await pool.query(
        'delete from desk_user where desk_id = $1 and team_user_id = (select id from team_user where team_id = $2 and user_id = $3)',
        [deskId, teamId.rows[0].team_id, userId]
      );

      response.status(200).send({ message: `Desk user deleted successfully`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const deleteDesk = async (request, response) => {
  const deskId = parseInt(request.params.deskId);

  console.log('deleteDesk', request.params, request.body);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query('select team_id from desk where id = $1', [deskId]);
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }
    if (deskId) {
      let results = await pool.query('delete from desk where id = $1', [deskId]);

      response.status(200).send({ message: `Desk deleted successfully`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

module.exports = {
  getTeamDesks,
  getDeskUsers,
  createDesk,
  createDeskUser,
  deleteDeskUser,
  getDesk,
  updateDesk,
  deleteDesk
};
