const db = require('../db');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = db.pool;
const secretKey = process.env.SECRET_OR_KEY;
const saltRounds = 10;
const tokenLifeTime = 60 * 60 * 12;

const getUsers = (request, response) => {
  console.log('getUsers', request.params, request.body);
  pool.query('select id, username from public.user order by id asc', (err, results) => {
    if (err) {
      response.status(500).send({ message: `Something went wrong`, ok: false });
    }
    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);
  console.log('getUserById', request.params, request.body);

  pool.query('select username, email from public.user where id = $1', [id], (err, results) => {
    if (err) {
      response.status(500).send({ message: `Something went wrong`, ok: false });
      throw err;
    }
    response.status(200).json(results.rows);
  });
};

const updateUser = async (request, response) => {
  const { username: uname, name, surname } = request.body;
  console.log('updateUser', request.params, request.body);

  const { user_id, username, email } = helpers.checkToken(request, response);

  try {
    if (uname && name && surname) {
      let user = await pool.query('select from public.user where username = $1 and id != $2', [
        uname,
        user_id,
      ]);
      // console.log(user.rows);
      if (user.rows.length) {
        response.status(400).send({
          message: 'user with that username already exists',
          ok: false,
          reason: 'username',
        });
      }

      let results = await pool.query(
        'update public.user set username = $1, name = $2, surname = $3 where id = $4',
        [uname, name, surname, user_id]
      );

      let payload = {
        id: user_id,
        username: uname,
        name: name,
        surname: surname,
        email: email,
      };
      let token = jwt.sign(payload, secretKey, { expiresIn: tokenLifeTime });

      response
        .status(200)
        .send({ message: `User updated with id: ${user_id}`, ok: true, token: token });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log('update user err', err);
  }
};

const updateEmail = async (request, response) => {
  const { email } = request.body;
  console.log('updateEmail', request.params, request.body);

  const { user_id, username, name, surname } = helpers.checkToken(request, response);

  try {
    if (username && name && surname) {
      // console.log(user.rows);
      // if (user.rows.length) {

      // }

      if (!email) {
        response.status(400).send({
          message: 'incorrect data',
          ok: false,
          reason: 'email',
        });
      }

      let results = await pool.query('update public.user set email = $1 where id = $2', [
        email,
        user_id,
      ]);

      let payload = {
        id: user_id,
        username: username,
        name: name,
        surname: surname,
        email: email,
      };
      let token = jwt.sign(payload, secretKey, { expiresIn: tokenLifeTime });

      response
        .status(200)
        .send({ message: `Email updated with user_id: ${user_id}`, ok: true, token: token });
    } else {
      response.status(400).send({
        message: 'unkown error',
        ok: false,
        reason: 'email',
      });
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log('update user err', err);
  }
};

const updatePassword = async (request, response) => {
  const { password, newPassword } = request.body;
  console.log('updatePassword', request.params, request.body);

  const { user_id, username, email, name, surname } = helpers.checkToken(request, response);

  try {
    let result = await pool.query('select * from public.user where id = $1', [user_id]);

    let user = { ...result.rows[0] };

    if (!user) {
      response.status(401).json({ message: 'no such user found', ok: false });
    }

    if (bcrypt.compareSync(password, user.password)) {
      let payload = {
        id: user_id,
        username: username,
        name: name,
        surname: surname,
        email: email,
      };
      let token = jwt.sign(payload, secretKey, { expiresIn: tokenLifeTime });
      let hash = bcrypt.hashSync(newPassword, saltRounds);

      let passwordRes = await pool.query('update public.user set password = $1 where id = $2', [
        hash,
        user_id,
      ]);

      response
        .status(200)
        .send({ message: 'Password was successfully updated', token: token, ok: true });
    } else {
      response.status(400).send({ message: 'Incorrect password', ok: false, reason: 'password' });
      console.log('updatePassword incorrect password');
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log('updatePassword err', err);
  }
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);
  console.log('deleteUser', request.params, request.body);

  pool.query('delete from public.user where id = $1', [id], (err, results) => {
    if (err) {
      throw err;
    }
    response.status(200).send({ message: `User deleted with id: ${id}`, ok: true });
  });
};

const findUser = async (request, response) => {
  const username = request.params.username;
  console.log('findUser', request.params, request.body);

  try {
    if (!username) {
      response.status(400).json({ message: 'No username passed' });
    }

    let result = await pool.query(
      `select id, username from public.user where username like '%${username}%'`
    );

    response.status(200).json({ users: result.rows, ok: true });
  } catch (err) {
    response.status(500).json({ message: 'something went wrong', ok: false });
    console.log('LOGIN ERR', err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
  findUser,
  updateEmail,
};
