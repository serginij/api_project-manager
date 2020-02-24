const db = require('../db');
const helpers = require('../helpers');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const pool = db.pool;

const saltRounds = 10;
const tokenLifeTime = 60 * 60 * 12;

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET_OR_KEY;

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    let result = await pool.query('select * from public.user where username = $1', [username]);
    let user = { ...result.rows[0] };
    console.log('user', user);

    if (!user) {
      res.status(401).send({ message: 'no such user found', ok: false });
    }

    console.log('comparing', bcrypt.compareSync(password, user.password));

    if (bcrypt.compareSync(password, user.password)) {
      let payload = {
        id: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email
      };
      let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: tokenLifeTime });

      res.status(200).json({ ok: true, token: token });
    } else {
      res.status(401).send({ message: 'passwords did not match', ok: false });
    }
  } catch (err) {
    res.status(500).send({ message: 'something went wrong', ok: false });
    console.log('LOGIN ERR', err);
  }
};

const signup = async (req, res) => {
  const { data } = req.body;

  console.log('signup', req.params, req.body);

  try {
    const { name, surname, username, password, email } = data;

    if (name && surname && username && password && email) {
      let hash = bcrypt.hashSync(password, saltRounds);
      let user = await pool.query(
        'select username, email from public.user where email = $2 or username = $1',
        [username, email]
      );

      user.rows.forEach(user => {
        if (user.username === username) {
          res.status(400).send({
            message: 'user with that username already exists',
            ok: false,
            reason: 'username'
          });
        }
        if (user.email === email) {
          res
            .status(400)
            .send({ message: 'user with that email already exists', ok: false, reason: 'email' });
        }
      });

      let result = await pool.query(
        'insert into public.user (username, password, name, surname, email) values ($1, $2, $3, $4, $5)',
        [username, hash, name, surname, email]
      );

      res.status(201).send({ message: 'User signed up successfully', ok: true });
    } else {
      throw 400;
    }
  } catch (err) {
    helpers.handleErrors(res, err);
    console.log('SIGNUP ERR', err);
  }
};

module.exports = { login, signup };
