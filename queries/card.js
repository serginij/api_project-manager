const db = require('../db');

const pool = db.pool;

const createCard = async (request, response) => {
  const { name, columnId } = request.body;

  try {
    if (name && columnId) {
      const results = await pool.query('insert into card (name) values ($1) returning id', [name]);

      const card_user = await pool.query(
        'insert into card_user (card_id, column_id) values ($1, $2)',
        [results.rows[0].id, columnId]
      );

      console.log(results, card_user);
      response
        .status(201)
        .send({ message: `Card added successfully`, success: true, id: results.rows[0].id });
    } else {
      response.status(400).send({ message: 'Incorrect data' });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong` });
    console.log(err);
  }
};

const deleteCard = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('delete from card where id = $1', [id], (err, results) => {
    if (err) {
      throw err;
    }
    response.status(200).send({ message: `Card deleted with id: ${id}` });
  });
};

const updateCard = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name, columnId } = request.body;

  console.log(request.body, request.params);

  try {
    if (id && name && columnId) {
      const results = await pool.query('update card set name = $1 where id = $2', [name, id]);

      const card_user = await pool.query('update card_user set column_id = $1 where card_id = $2', [
        columnId,
        id
      ]);

      response.status(201).send({ message: `Card updated successfully`, success: true, id: id });
    } else {
      throw 400;
    }
  } catch (err) {
    err == 400
      ? response.status(400).send({ message: 'Incorrect data' })
      : response.status(500).send({ message: `Something went wrong` });
    console.log(err);
  }
};

module.exports = { createCard, deleteCard, updateCard };