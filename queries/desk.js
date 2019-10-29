const db = require('../db');

const pool = db.pool;

const getTeamDesks = async (request, response) => {
  const teamId = parseInt(request.params.teamId);

  try {
    const results = await pool.query('select * from desk where team_id = $1 order by id asc', [
      teamId
    ]);

    results.rows.map(async row => {
      const users = await pool.query(
        'select id, username from public.user where id in (select user_id from team_user where id in (select team_user_id from desk_user where desk_id = $1))',
        [row.id]
      );

      console.log(row);
    });

    response.status(200).json(results.rows);
  } catch (err) {
    response.status(500).send(`Something went wrong`);
    console.log(err);
  }
};

const getDeskUsers = (request, response) => {
  const deskId = parseInt(request.params.id);

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
};

const getDesk = async (request, response) => {
  const deskId = parseInt(request.params.deskId);
  try {
    const results = await pool.query('select * from desk where id = $1', [deskId]);

    const columns = await pool.query('select id, name from column where desk_id = $1', [deskId]);

    columns.rows.map(async column => {
      const cards = await pool.query(
        'select * from card where id in (select card_id from card_user where column_id = $1)',
        [column.id]
      );
      column.cards = cards.rows;
    });
    results.rows.columns = columns.rows;

    response.status(200).json(results.rows);
  } catch (err) {
    response.status(500).send(`Something went wrong`);
  }
};

const createDesk = (request, response) => {
  const { name, teamId } = request.body;

  console.log(request.body);
  if (name && teamId) {
    pool.query(
      'insert into desk (name, team_id) values ($1, $2)',
      [name, teamId],
      (err, results) => {
        if (err) {
          response.status(500).send(`Something went wrong`);
          console.log(err.stack);
          throw err;
        }
        // console.log(results);
        response.status(201).send(`Team added successfully`);
      }
    );
  } else {
    response.status(400).send('Incorrect data');
  }
};

const createDeskUser = (request, response) => {
  const { userId, teamId, deskId } = request.body;
  // change to only userId and deskId

  if (userId && teamId && deskId) {
    pool.query(
      'insert into desk_user (team_user_id, desk_id) values (select id from team_user where user_id = $1 and team_id = $2, $3)',
      [userId, teamId, deskId],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`User (${id}) added to board successfully`);
      }
    );
  } else {
    response.status(400).send('Incorrect data');
  }
};

const deleteDeskUser = (request, response) => {
  const deskId = parseInt(request.params.deskId);
  const userId = parseInt(request.params.userId);

  if (deskId && userId) {
    pool.query(
      'delete from desk_user where id in (select id from team_user where user_id = $1 ) and desk_id = $2',
      [userId, deskId],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`Desk user deleted successfully`);
      }
    );
  } else {
    response.status(400).send('Incorrect data');
  }
};

module.exports = {
  getTeamDesks,
  getDeskUsers,
  createDesk,
  createDeskUser,
  deleteDeskUser,
  getDesk
};
