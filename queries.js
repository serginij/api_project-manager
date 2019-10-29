const userQueries = require('./queries/user');
const teamQueries = require('./queries/team');
const deskQueries = require('./queries/desk');

module.exports = { ...userQueries, ...teamQueries, ...deskQueries };
