const express = require('express');
const bodyParser = require('body-parser');
const app = express();
let port = process.env.PORT || 3001;

const queries = require('./queries');
const passportConf = require('./passport');

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

const withAuth = func => (passportConf.passport.authenticate('jwt', { session: false }), func);

app.post('/login', passportConf.login);
app.post('/signup', passportConf.signup);
app.put('/password', withAuth(queries.updatePassword));

app.get('/users', queries.getUsers);
app.get('/users/:id', queries.getUserById);
app.put('/users/update', queries.updateUser);
app.delete('/users/:id', queries.deleteUser);
app.get('/user/find/:username', queries.findUser);

app.get('/teams', withAuth(queries.getTeams));
app.get('/teams/:id', queries.getTeamById);
app.post('/teams', withAuth(queries.createTeam));
app.put('/teams/:id', withAuth(queries.updateTeam));
app.delete('/teams/:id', withAuth(queries.deleteTeam));

app.get('/teams/:teamId/user/find/:username', queries.findTeamUser);

app.post('/teams/:teamId/users', withAuth(queries.createTeamUser));
app.put('/teams/:teamId/users/:userId', withAuth(queries.updateTeamUser));
app.delete('/teams/:teamId/users/:userId', withAuth(queries.deleteTeamUser));

app.get('/teams/:teamId/desks', queries.getTeamDesks);

app.post('/desks', queries.createDesk);
app.get('/desks/:deskId', queries.getDesk);
app.put('/desks/:deskId', withAuth(queries.updateDesk));
app.delete('/desks/:deskId', withAuth(queries.deleteDesk));

app.delete('/desks/:deskId/users/:userId', withAuth(queries.deleteDeskUser));
app.get('/desks/:deskId/users', queries.getDeskUsers);
app.post('/desks/:deskId/users', withAuth(queries.createDeskUser));

app.post('/desks/columns', queries.createColumn);
app.delete('/desks/columns/:id', queries.deleteColumn);
app.put('/desks/columns/:id', withAuth(queries.updateColumn));

app.post('/desks/cards', queries.createCard);
app.delete('/desks/cards/:id', queries.deleteCard);
app.put('/desks/cards/:id', queries.updateCard);

app.get('/desks/:deskId/user/find/:usern', queries.findDeskUser);
app.post('/desks/:deskId/labels', queries.createLabel);

app.put('/labels/:id', queries.updateLabel);
app.delete('/labels/:id', queries.deleteLabel);

app.post('/cards/:id/users', queries.addCardUser);
app.delete('/cards/:id/users/:userId', queries.deleteCardUser);

app.post('/cards/:cardId/labels', queries.addCardLabel);
app.delete('/cards/:cardId/labels/:labelId', queries.deleteCardLabel);

app.post('/cards/:cardId/comments', queries.createComment);
app.delete('/comments/:id', queries.deleteComment);
app.put('/comments/:id', queries.updateComment);

app.post('/cards/:cardId/checklists', queries.createList);
app.put('/checklist/:id', queries.updateList);
app.delete('/checklist/:id', queries.deleteList);

app.post('/checklist/:listId/items', queries.createItem);
app.put('/checkitem/:itemId', queries.updateItem);
app.delete('/checkitem/:id', queries.deleteItem);

app.post('/mindmap/parse', queries.parseMindmap);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
