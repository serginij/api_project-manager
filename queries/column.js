const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const createColumn = async (request, response) => {
  const { name, deskId } = request.body;
  console.log('createColumn', request.params, request.body);

  try {
    if (name && deskId) {
      const results = await pool.query(
        'insert into public.column (name, desk_id) values ($1, $2) returning id',
        [name, deskId]
      );

      const desk = await pool.query(
        `update desk set columns = array_append((select columns from desk where id = ${deskId}), ${results.rows[0].id}) where id = ${deskId}`
      );

      response
        .status(201)
        .send({ message: `Column added successfully`, ok: true, id: results.rows[0].id });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const deleteColumn = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteColumn', request.params, request.body);

  try {
    let results = await pool.query('delete from public.column where id = $1 returning desk_id', [
      id
    ]);
    let desk = await pool.query(
      `update desk set columns = array_remove((select columns from desk where id = ${results.rows[0].desk_id}), ${id}) where id = ${results.rows[0].desk_id}`
    );
    response.status(200).send({ message: `Column deleted with id: ${id}`, ok: true });
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('deleteColumn', err);
  }
};

const updateColumn = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name } = request.body;

  const { user_id, username } = helpers.checkToken(request, response);
  console.log('updateColumn', request.params, request.body);

  try {
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = (select team_id from desk where id = (select desk_id from public.column where id = $2))',
      [user_id, id]
    );
    if (!user.rows[0].is_admin) {
      throw 403;
    }

    if (id && name) {
      let results = await pool.query('update public.column set name = $1 where id = $2', [
        name,
        id
      ]);

      response.status(200).send({ message: 'Column updated successfully', ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log(err);
  }
};

const moveColumn = async (request, response) => {
  const deskId = parseInt(request.params.deskId);
  const { columns } = request.body;

  const { user_id, username } = helpers.checkToken(request, response);
  console.log('moveColumn', request.params, request.body);

  try {
    let user = await pool.query(
      'select id from team_user where user_id = $1 and team_id = (select team_id from desk where id = $2)',
      [user_id, deskId]
    );
    if (!user.rows.length) {
      throw 403;
    }

    if (deskId && Array.isArray(columns) && columns.length) {
      let results = await pool.query(
        `update desk set columns = ARRAY [${columns}]::integer[] where id = ${deskId}`
      );

      response.status(200).send({ message: 'Column moved successfully', ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log(err);
  }
};

module.exports = { createColumn, deleteColumn, updateColumn, moveColumn };
