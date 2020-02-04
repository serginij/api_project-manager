const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const createList = async (request, response) => {
  const cardId = parseInt(request.params.cardId);
  const { name } = request.body;
  console.log('createList', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id, id from desk where id = (select desk_id from public.column where id=(select column_id from card where id = $1))',
      [cardId]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    let deskUser;

    if (name && cardId) {
      const results = await pool.query(
        'insert into checklist (name, card_id) values ($1, $2) returning id',
        [name, cardId]
      );

      response.status(201).send({
        message: `Checklist added successfully`,
        ok: true,
        id: results.rows[0].id
      });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('createList', err);
  }
};

const updateList = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name } = request.body;
  console.log('updateList', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id, id from desk where id = (select desk_id from public.column where id=(select column_id from card where id = (select card_id from checklist where id = $1)))',
      [id]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );

    if (name && id) {
      const results = await pool.query('update checklist set name = $1 where id = $2', [name, id]);

      response.status(201).send({
        message: `Checklist updated successfully`,
        ok: true
      });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('updateList', err);
  }
};

const deleteList = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteList', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    if (id) {
      let results = await pool.query('delete from checklist where id = $1', [id]);
      response.status(200).send({ message: `Checklist deleted with id: ${id}`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log('deleteList', err);
  }
};

const createItem = async (request, response) => {
  const listId = parseInt(request.params.listId);
  const { text } = request.body;
  console.log('createItem', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id, id from desk where id = (select desk_id from public.column where id=(select column_id from card where id = (select card_id from checklist where id = $1)))',
      [listId]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );

    if (text && listId) {
      const results = await pool.query(
        'insert into checkitem (text, checklist_id, checked) values ($1, $2, false) returning id',
        [text, listId]
      );

      response.status(201).send({
        message: `Checkitem added successfully`,
        ok: true,
        id: results.rows[0].id
      });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('createItem', err);
  }
};

const updateItem = async (request, response) => {
  const itemId = parseInt(request.params.itemId);
  const { text, checked } = request.body;
  console.log('updateItem', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id, id from desk where id = (select desk_id from public.column where id=(select column_id from card where id = (select card_id from checklist where id = (select checklist_id from checkitem where id = $1))))',
      [itemId]
    );
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );

    if (text && itemId) {
      const results = await pool.query(
        'update checkitem set text = $1, checked = $2 where id = $3',
        [text, checked, itemId]
      );

      response.status(201).send({
        message: `Checkitem updated successfully`,
        ok: true
      });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('updateItem', err);
  }
};

const deleteItem = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteItem', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    if (id) {
      let results = await pool.query('delete from checkitem where id = $1', [id]);
      response.status(200).send({ message: `Checkitem deleted with id: ${id}`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log('deleteItem', err);
  }
};

module.exports = { deleteList, createList, updateList, createItem, updateItem, deleteItem };
