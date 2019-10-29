const db = require('../db');

const pool = db.pool;

const getUsers = (request, response) => {
  pool.query('select * from public.user order by id asc', (err, results) => {
    if (err) {
      throw err;
    }
    console.log(results.rows);
    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('select username, email from public.user where id = $1', [id], (err, results) => {
    if (err) {
      throw err;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const { username, email, password } = request.body;

  console.log(request.body);
  if (username && password) {
    pool.query(
      'insert into public.user (username, email, password) values ($1, $2, $3)',
      [username, email, password],
      (err, results) => {
        if (err) {
          response.status(500).send(`Something went wrong`);
          console.log(err.stack);
          throw err;
        }
        // console.log(results);
        response.status(201).send(`User added successfully`);
      }
    );
  } else {
    response.status(400).send('Incorrect data');
  }
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { username, email } = request.body;

  if (username && id) {
    pool.query(
      'update public.user set username = $1, email = $2 where id = $3',
      [username, email, id],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`User modified with id: ${id}`);
      }
    );
  } else {
    response.status(400).send('Incorrect data');
  }
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('delete from public.user where id = $1', [id], (err, results) => {
    if (err) {
      throw err;
    }
    response.status(200).send(`User deleted with id: ${id}`);
  });
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
