const express = require('express');
const bodyParser = require('body-parser');
const app = express();
let port = process.env.PORT || 3001;

const passportConf = require('./passport');

const teams = require('./routes/teams');
const users = require('./routes/users');
const mindmap = require('./routes/mindmap');
const labels = require('./routes/labels');
const desks = require('./routes/desks');
const comments = require('./routes/comments');
const checklist = require('./routes/checklist');
const checkitem = require('./routes/checkitem');
const cards = require('./routes/cards');
const auth = require('./routes/auth');

app.use(passportConf.passport.initialize());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.use('/', auth);
app.use('/teams', teams);
app.use('/users', users);
app.use('/mindmap', mindmap);
app.use('/labels', labels);
app.use('/desks', desks);
app.use('/comments', comments);
app.use('/checklist', checklist);
app.use('/checkitem', checkitem);
app.use('/cards', cards);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
