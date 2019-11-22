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

      return { user_id: decoded.id, username: decoded.username };
    }
  });

module.exports = { checkToken };
