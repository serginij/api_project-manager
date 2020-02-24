const userQueries = require('./user');
const teamQueries = require('./team');
const deskQueries = require('./desk');
const columnQueries = require('./column');
const cardQueries = require('./card');
const commentQueries = require('./comment');
const checklistQueries = require('./checklist');
const labelQueries = require('./label');
const mindmapQueries = require('./mindmap');
const authQueries = require('./auth');

module.exports = {
  ...userQueries,
  ...teamQueries,
  ...deskQueries,
  ...columnQueries,
  ...cardQueries,
  ...commentQueries,
  ...checklistQueries,
  ...labelQueries,
  ...mindmapQueries,
  ...authQueries
};
