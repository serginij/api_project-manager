const userQueries = require('./queries/user');
const teamQueries = require('./queries/team');
const deskQueries = require('./queries/desk');
const columnQueries = require('./queries/column');
const cardQueries = require('./queries/card');
const commentQueries = require('./queries/comment');
const checklistQueries = require('./queries/checklist');
const labelQueries = require('./queries/label');
const mindmapQueries = require('./queries/mindmap');

module.exports = {
  ...userQueries,
  ...teamQueries,
  ...deskQueries,
  ...columnQueries,
  ...cardQueries,
  ...commentQueries,
  ...checklistQueries,
  ...labelQueries,
  ...mindmapQueries
};
