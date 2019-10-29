const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'pm',
  host: 'localhost',
  database: 'manager',
  password: 'qwerty',
  port: 5432
});

module.exports = { pool };
