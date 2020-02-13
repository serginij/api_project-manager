const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const createLabel = async (request, response) => {
  const deskId = parseInt(request.params.deskId);
  const { name, color } = request.body;
  console.log('createLabel', request.params, request.body);

  try {
    if ((name && deskId, color)) {
      const results = await pool.query(
        'insert into label (name, color, desk_id) values ($1, $2, $3) returning id',
        [name, color, deskId]
      );

      response
        .status(201)
        .send({ message: `Label added successfully`, ok: true, id: results.rows[0].id });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('createLabel', err);
  }
};

const deleteLabel = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteLabel', request.params, request.body);

  try {
    let results = await pool.query('delete from label where id = $1', [id]);
    response.status(200).send({ message: `Label deleted with id: ${id}`, ok: true });
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log('deleteLabel', err);
  }
};

const updateLabel = async (request, response) => {
  const id = parseInt(request.params.id);
  const { label } = request.body;
  console.log('updateLabel', request.body, request.params);

  try {
    let { name, color } = label;
    if (id && name && color) {
      let results = await pool.query('update label set name = $1, color = $2 where id = $3', [
        name,
        color,
        id
      ]);

      response.status(201).send({ message: `Label updated successfully`, ok: true, id: id });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log('editLabel', err);
  }
};

const addCardLabel = async (request, response) => {
  const cardId = parseInt(request.params.cardId);
  const { labelId } = request.body;

  console.log('addCardLabel', request.body, request.params);

  try {
    if (cardId && labelId) {
      let results = await pool.query('insert into card_label (card_id, label_id) values ($1, $2)', [
        cardId,
        labelId
      ]);

      response.status(201).send({
        message: `Card label added successfully`,
        ok: true
      });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

const deleteCardLabel = async (request, response) => {
  const cardId = parseInt(request.params.cardId);
  const labelId = parseInt(request.params.labelId);

  try {
    if (cardId && labelId) {
      let results = await pool.query(
        'delete from card_label where card_id = $1 and label_id = $2',
        [cardId, labelId]
      );

      response.status(200).send({
        message: `Card label deleted successfully`,
        ok: true
      });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
  }
};

module.exports = { createLabel, updateLabel, deleteLabel, addCardLabel, deleteCardLabel };
