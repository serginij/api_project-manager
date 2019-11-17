const db = require('../db');

const pool = db.pool;

const getTeamDesks = async (request, response) => {
  const teamId = parseInt(request.params.teamId);

  try {
    const results = await pool.query('select * from desk where team_id = $1 order by id asc', [
      teamId
    ]);

    response.status(200).json(results.rows);
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
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
        response.status(500).send({ message: `Something went wrong`, ok: false });
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

    const columns = await pool.query('select id, name from public.column where desk_id = $1', [
      deskId
    ]);
    console.log('getDesk columns', columns.rows);

    let colRes = {};
    let cardRes = {};

    let promises = columns.rows.map(async column => {
      const cards = await pool.query(
        'select * from card where id in (select card_id from card_user where column_id = $1)',
        [column.id]
      );

      console.log('getDesk column & cards', column, cards.rows);

      colRes[column.id] = column;
      colRes[column.id].cards = [];
      cards.rows.forEach(card => {
        cardRes[card.id] = card;
        colRes[column.id].cards.push(card.id);
      });
      return column.id;
    });

    results.rows[0].columns = await Promise.all(promises);
    console.log('getDesk response', results.rows[0], colRes, cardRes);

    response.status(200).send({ desk: results.rows[0], columns: colRes, cards: cardRes, ok: true });
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log(err);
  }
};

const createDesk = (request, response) => {
  const { name, teamId } = request.body;

  console.log(request.body);
  if (name && teamId) {
    pool.query(
      'insert into desk (name, team_id) values ($1, $2) returning id',
      [name, teamId],
      (err, results) => {
        if (err) {
          response.status(500).send({ message: `Something went wrong`, ok: false });
          console.log(err.stack);
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
        response
          .status(200)
          .send({ message: `User (${id}) added to board successfully`, ok: true });
      }
    );
  } else {
    response.status(400).send({ message: 'Incorrect data', ok: false });
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
        response.status(200).send({ message: `Desk user deleted successfully`, ok: true });
      }
    );
  } else {
    response.status(400).send({ message: 'Incorrect data', ok: false });
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
