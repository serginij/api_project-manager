const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const createComment = async (request, response) => {
  const cardId = parseInt(request.params.cardId);
  const { text, date } = request.body;
  console.log('createComment', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let teamId = await pool.query(
      'select team_id, id from desk where id = (select desk_id from public.column where id=(select column_id from card_user where card_id = $1))',
      [cardId]
    );
    // console.log('createComment teamId', teamId.rows, cardId);
    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );
    let deskUser;

    if (text && cardId) {
      if (user.rows[0].is_admin) {
        deskUser = await pool.query(
          'insert into desk_user (desk_id, team_user_id) values($1, (select id from team_user where team_id=$2 and user_id=$3)) returning id',
          [teamId.rows[0].id, teamId.rows[0].team_id, user_id]
        );

        const results = await pool.query(
          'insert into comment (text, card_id, desk_user_id, date) values ($1, $2, $3, $4) returning id',
          [text, cardId, deskUser.rows[0].id, date]
        );

        response.status(201).send({
          message: 'Comment added successfully',
          ok: true,
          id: results.rows[0].id,
          user_id: user_id,
          username: username
        });
      } else {
        const results = await pool.query(
          'insert into comment (text, card_id, desk_user_id, date) values ($1, $2, (select id from desk_user where desk_id=$3 and team_user_id=(select id from team_user where team_id=$4 and user_id=$5)), $6) returning id',
          [text, cardId, teamId.rows[0].id, teamId.rows[0].team_id, user_id, date]
        );

        response.status(201).send({
          message: `Comment added successfully`,
          ok: true,
          id: results.rows[0].id,
          user_id: user_id,
          username: username
        });
      }
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('createComment', err);
  }
};

const deleteComment = async (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteComment', request.params, request.body);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select query.username, query.id, query.is_admin from desk_user join (select public.user.id as id, public.user.username, team_user.id as team_user_id, team_user.is_admin from public.user join team_user on team_user.user_id = public.user.id) as query on query.team_user_id = desk_user.team_user_id where desk_user.id = (select desk_user_id from comment where id=$1);',
      [id]
    );
    if (user.rows[0].is_admin || user.rows[0].id === user_id) {
      let results = await pool.query('delete from comment where id = $1', [id]);
      response.status(200).send({ message: `Comment deleted with id: ${id}`, ok: true });
    } else {
      throw 403;
    }
  } catch (err) {
    response.status(500).send({ message: 'Something went wrong', ok: false });
    console.log('deleteCard', err);
  }
};

const updateComment = async (request, response) => {
  const id = parseInt(request.params.id);
  const { text } = request.body;
  console.log('updateCard', request.body, request.params);

  const { user_id, username } = helpers.checkToken(request, response);

  try {
    let user = await pool.query(
      'select query.username, query.id from desk_user join (select public.user.id as id, public.user.username, team_user.id as team_user_id from public.user join team_user on team_user.user_id = public.user.id) as query on query.team_user_id = desk_user.team_user_id where desk_user.id = (select desk_user_id from comment where id=$1);',
      [id]
    );
    if (user.rows[0].id !== user_id) {
      throw 403;
    }
    if (id && text) {
      const results = await pool.query('update comment set text = $1 where id = $2', [text, id]);

      response.status(201).send({ message: `Comment updated successfully`, ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log('deleteComment', err);
  }
};

module.exports = { createComment, deleteComment, updateComment };
