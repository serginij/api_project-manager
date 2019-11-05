const userQueries = require('./queries/user');
const teamQueries = require('./queries/team');
const deskQueries = require('./queries/desk');
const columnQueries = require('./queries/column');
const cardQueries = require('./queries/card');

module.exports = {
  ...userQueries,
  ...teamQueries,
  ...deskQueries,
  ...columnQueries,
  ...cardQueries
};
