const db = require('./db');
require('dotenv').config();

const pool = db.pool;

const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJWT = require('passport-jwt');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET_OR_KEY;

const strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  try {
    console.log('payload received', jwt_payload);
    let result = await pool.query('select * from public.user where id = $1', [jwt_payload.id]);

    let user = { ...result.rows[0] };

    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  } catch (err) {
    next(null, false);
    console.log('STRATEGY ERROR', err);
  }
});

passport.use(strategy);

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
      let payload = { id: user.id, username: user.username };
      let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: 60 * 30 });

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
  const { username, password } = req.body;
  let hash = bcrypt.hashSync(password, saltRounds);
  try {
    let result = await pool.query(
      'insert into public.user (username, password) values ($1, $2) returning id, username',
      [username, hash]
    );
    let user = { ...result.rows[0] };
    console.log('user', user);

    let payload = { id: user.id, username: user.username };
    let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: 60 * 30 });
    res.json({ message: 'ok', token: token });
  } catch (err) {
    res.status(500).json({ message: 'something went wrong', ok: false });
    console.log('LOGIN ERR', err);
  }
};

module.exports = { login, passport, signup };
