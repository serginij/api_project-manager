const db = require('../db');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = db.pool;
const secretKey = process.env.SECRET_OR_KEY;
const saltRounds = 10;

const getUsers = (request, response) => {
  pool.query('select id, username from public.user order by id asc', (err, results) => {
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
    let hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
    pool.query(
      'insert into public.user (username, email, password) values ($1, $2, $3)',
      [username, email, hash],
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

const updatePassword_old = (request, response) => {
  const { username, password, newPassword } = request.body;
  let hash = bcrypt.hashSync(newPassword, saltRounds);
  if (newPassword) {
    pool.query(
      'update public.user set password = $1 where username = $2 returning id',
      [hash, username],
      (err, results) => {
        if (err) {
          throw err;
        }
        response.status(200).send(`User's password modified with id: ${results.rows[0].id}`);
      }
    );
  } else {
    response.status(400).send('Incorrect data');
  }
};

const updatePassword = async (request, response) => {
  const { password, newPassword } = request.body;
  const { id, username } = jwt.verify(request.headers.authorization.split(' ')[1], secretKey);

  try {
    let result = await pool.query('select * from public.user where id = $1', [id]);

    let user = { ...result.rows[0] };

    if (!user) {
      response.status(401).json({ message: 'no such user found' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      let payload = { id: user.id, username: user.username };
      let token = jwt.sign(payload, secretKey, { expiresIn: 60 * 30 });
      let hash = bcrypt.hashSync(password, saltRounds);

      let passwordRes = await pool.query('update public.user set password = $1 where id = $2', [
        hash,
        id
      ]);

      response.json({ message: 'Password was successfully updated', token: token });
    } else {
      response.status(401).json({ message: 'passwords did not match' });
    }
  } catch (err) {
    response.status(500).json({ message: 'something went wrong' });
    console.log('LOGIN ERR', err);
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

const findUser = async (request, response) => {
  const username = request.params.username;
  console.log('findUser', username);
  try {
    if (!username) {
      response.status(400).json({ message: 'No username passed' });
    }

    let result = await pool.query(
      `select id, username from public.user where username like '%${username}%'`
    );
    console.log(result);

    response.status(200).json({ users: result.rows });
  } catch (err) {
    response.status(500).json({ message: 'something went wrong' });
    console.log('LOGIN ERR', err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  updatePassword_old,
  findUser
};
