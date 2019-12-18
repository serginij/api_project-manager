const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

// const getUsers = (request, response) => {
//   pool.query('select * from public.user order by id asc', (err, results) => {
//     if (err) {
//       throw err;
//     }
//     console.log(results.rows);
//     response.status(200).json(results.rows);
//   });
// };

// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id);

//   pool.query('select username, email from public.user where id = $1', [id], (err, results) => {
//     if (err) {
//       throw err;
//     }
//     response.status(200).json(results.rows);
//   });
// };

const createColumn = async (request, response) => {
  const { name, deskId } = request.body;
  console.log('createColumn', request.params, request.body);

  try {
    if (name && deskId) {
      const results = await pool.query(
        'insert into public.column (name, desk_id) values ($1, $2) returning id',
        [name, deskId]
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

// const updateUser = (request, response) => {
//   const id = parseInt(request.params.id);
//   const { username, email } = request.body;

//   if (username && id) {
//     pool.query(
//       'update public.user set username = $1, email = $2 where id = $3',
//       [username, email, id],
//       (err, results) => {
//         if (err) {
//           throw err;
//         }
//         response.status(200).send(`User modified with id: ${id}`);
//       }
//     );
//   } else {
//     response.status(400).send('Incorrect data');
//   }
// };

const deleteColumn = (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteColumn', request.params, request.body);

  try {
    pool.query('delete from public.column where id = $1', [id], (err, results) => {
      if (err) {
        throw err;
      }
      response.status(200).send({ message: `Column deleted with id: ${id}`, ok: true });
    });
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

module.exports = { createColumn, deleteColumn, updateColumn };
