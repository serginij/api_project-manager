const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const queries = require('./queries');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8000'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/users', queries.getUsers);
app.get('/users/:id', queries.getUserById);
app.post('/users', queries.createUser);
app.put('/users/:id', queries.updateUser);
app.delete('/users/:id', queries.deleteUser);

app.get('/teams', queries.getTeams);
app.get('/teams/:id', queries.getTeamById);
app.post('/teams', queries.createTeam);
app.put('/teams/:id', queries.updateTeam);
app.delete('/teams/:id', queries.deleteTeam);

app.post('/teams/:teamId/users', queries.createTeamUser);
app.put('/teams/:teamId/users/:userId', queries.updateTeamUser);
app.delete('/teams/:teamId/users/:userId', queries.deleteTeamUser);

app.get('/teams/:teamId/desks', queries.getTeamDesks);

app.post('/desks', queries.createDesk);
app.get('/desks/:deskId', queries.getDesk);
// app.put('/desks/:deskId');
app.delete('/desks/:deskId/users/:userId', queries.deleteDeskUser);
app.get('/desks/:deskId/users', queries.getDeskUsers);
app.post('/desks/:deskId/users', queries.createDeskUser);

app.post('/desks/columns', queries.createColumn);
app.delete('/desks/columns/:id', queries.deleteColumn);
app.post('/desks/cards', queries.createCard);
app.delete('/desks/cards/:id', queries.deleteCard);
app.put('/desks/cards/:id', queries.updateCard);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
