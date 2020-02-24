const db = require('./db');
require('dotenv').config();

const passport = require('passport');
const passportJWT = require('passport-jwt');

const pool = db.pool;

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

module.exports = { passport };
