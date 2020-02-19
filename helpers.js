const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_OR_KEY;

const checkToken = (request, response) =>
  jwt.verify(request.headers.authorization.split(' ')[1], secretKey, (err, decoded) => {
    if (err) {
      console.log(err);
      response.status(401).send({ message: 'Invalid token passed', ok: false });
    } else {
      console.log('success');

      return {
        user_id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        name: decoded.name,
        surname: decoded.surname
      };
    }
  });

const handleErrors = (
  response,
  err,
  messages = {
    400: 'Incorrect data',
    403: 'Access denied',
    500: 'Something went wrong',
    401: 'Invalid token'
  }
) => {
  switch (err) {
    case 400:
      response.status(400).send({ message: messages[400], ok: false });
      break;
    case 403:
      response.status(403).send({ message: messages[403], ok: false });
      break;
    case 500:
      response.status(500).send({ message: messages[500], ok: false });
      break;
    case 401:
      response.status(401).send({ message: messages[401], ok: false });
    default:
      response.status(500).send({ message: messages[500], ok: false });
      break;
  }
  console.log(err);
};

const checkAdmin = async (request, response) => {
  const { user_id, username } = checkToken(request, response);
  try {
    let teamId = await pool.query('select team_id from desk where id = $1', [deskId]);

    let user = await pool.query(
      'select is_admin from team_user where user_id = $1 and team_id = $2',
      [user_id, teamId.rows[0].team_id]
    );

    if (!user.rows[0].is_admin) {
      throw 403;
    }
  } catch (err) {
    handleErrors(response, err);
    console.log(err);
  }
};

module.exports = { checkToken, handleErrors, checkAdmin };
