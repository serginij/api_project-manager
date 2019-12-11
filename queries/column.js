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

module.exports = { createColumn, deleteColumn };
