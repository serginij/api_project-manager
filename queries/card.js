const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const createCard = async (request, response) => {
  const { name, columnId } = request.body;
  console.log('createCard', request.params, request.body);

  try {
    if (name && columnId) {
      const results = await pool.query(
        'insert into card (name, column_id) values ($1, $2) returning id',
        [name, columnId]
      );

      const column = await pool.query(
        `update public.column set cards = array_append((select cards from public.column where id = ${columnId}), ${results.rows[0].id}) where id = ${columnId}`
      );

      response
        .status(201)
        .send({ message: `Card added successfully`, ok: true, id: results.rows[0].id });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('createCard', err);
  }
};

const deleteCard = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteCard', request.params, request.body);

  try {
    let results = await pool.query('delete from card where id = $1 returning column_id', [id]);
    let column = await pool.query(
      `update public.column set cards = array_remove((select cards from public.column where id = ${results.rows[0].column_id}), ${id}) where id = ${results.rows[0].column_id}`
    );
    response.status(200).send({ message: `Card deleted with id: ${id}`, ok: true });
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log('deleteCard', err);
  }
};

const updateCard = async (request, response) => {
  const id = parseInt(request.params.id);
  const { card } = request.body;
  console.log('updateCard', request.body, request.params);

  try {
    let { name, desc, deadline, checked, stage } = card;
    if (
      id &&
      name &&
      desc !== undefined &&
      deadline !== undefined &&
      checked !== undefined &&
      stage !== undefined
    ) {
      let results = await pool.query(
        'update card set name = $1, "desc" = $2, deadline = $3, checked = $4, stage = $5 where id = $6',
        [name, desc, deadline, checked, stage, id]
      );

      response.status(200).send({ message: `Card updated successfully`, ok: true, id: id });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const addCardUser = async (request, response) => {
  const id = parseInt(request.params.id);
  const { userId } = request.body;

  console.log('addCardUser', request.body, request.params);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id, id from desk where id = (select desk_id from public.column where id = (select column_id from card where id = $1))',
      [id]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }

    let cardUser = await pool.query(
      'select id from card_user where card_id = $1 and desk_user_id = (select id from desk_user where team_user_id = (select id from team_user where team_id = $2 and user_id = $3) and desk_id = $4)',
      [id, teamId.rows[0].team_id, userId, teamId.rows[0].id]
    );

    if (id && userId && cardUser.rows.length == 0) {
      let results = await pool.query(
        'insert into card_user (card_id, desk_user_id) values ($1, (select id from desk_user where desk_id = (select desk_id from public.column where id = (select column_id from card where id = $1)) and team_user_id = (select id from team_user where team_id = $2 and user_id = $3)))',
        [id, teamId.rows[0].team_id, userId]
      );

      let username = await pool.query('select username from public.user where id = $1', [userId]);

      response.status(201).send({
        message: `User added successfully`,
        ok: true,
        username: username.rows[0].username
      });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const deleteCardUser = async (request, response) => {
  const id = parseInt(request.params.id);
  const userId = parseInt(request.params.userId);

  console.log('deleteCardUser', request.body, request.params);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id from desk where id = (select desk_id from public.column where id = (select column_id from card where id = $1))',
      [id]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    console.log('teamId', teamId.rows);
    console.log('user', user.rows);
    if (!user.rows[0].is_admin) {
      throw 403;
    }

    if (id && userId) {
      let results = await pool.query(
        'delete from card_user where card_id = $1 and desk_user_id = (select id from desk_user where team_user_id = (select id from team_user where team_id = $2 and user_id = $3) and desk_id = (select desk_id from public.column where id = (select column_id from card where id = $1)))',
        [id, teamId.rows[0].team_id, userId]
      );
      console.log('results', results);

      let username = await pool.query('select username from public.user where id = $1', [user_id]);

      response.status(201).send({
        message: `User deleted successfully`,
        ok: true,
        username: username.rows[0].username
      });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const moveCard = async (request, response) => {
  const id = parseInt(request.params.id);
  const { fromCol, toCol, cards, index } = request.body;

  console.log('moveCard', request.body, request.params);
  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id from desk where id = (select desk_id from public.column where id = (select column_id from card where id = $1))',
      [id]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    if (!user.rows.length) {
      throw 403;
    }

    if (id && fromCol && toCol) {
      let results;
      if (fromCol === toCol && Array.isArray(cards) && cards.length) {
        console.log(cards);
        results = await pool.query(
          `update public.column set cards = '{${cards}}' where id = ${fromCol}`
        );
      } else if (fromCol !== toCol && index !== undefined) {
        let from = await pool.query('select cards from public.column where id = $1', [fromCol]);
        let to = await pool.query('select cards from public.column where id = $1', [toCol]);
        console.log(from.rows, to.rows);

        let fromCards = from.rows[0].cards.filter(el => el !== id);
        let toCards = to.rows[0].cards;
        toCards.splice(index, 0, id);

        console.log(`${fromCards}`, toCards);

        results = await pool.query(
          `update public.column set cards = case when id = ${fromCol} then ARRAY [${fromCards}]::integer[] when id = ${toCol} then ARRAY [${toCards}]::integer[] end where id in (${fromCol}, ${toCol})`
        );
      } else {
        throw 400;
      }

      response.status(200).send({
        message: `Card moved successfully`,
        ok: true
      });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

module.exports = { createCard, deleteCard, updateCard, addCardUser, deleteCardUser, moveCard };
