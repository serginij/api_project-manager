const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const queries = require("./queries");
const passportConf = require("./passport");

app.use(passportConf.passport.initialize());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

const withAuth = func => (
  passportConf.passport.authenticate("jwt", { session: false }), func
);

app.post("/login", passportConf.login);
app.post("/signup", passportConf.signup);
app.put("/password", withAuth(queries.updatePassword));

app.get(
  "/secret",
  withAuth(function(req, res) {
    res.json({ message: "Success! You can not see this without a token" });
  })
);

app.get("/users", queries.getUsers);
app.get("/users/:id", queries.getUserById);
app.post("/users", queries.createUser);
app.put("/users/:id", queries.updateUser);
app.delete("/users/:id", queries.deleteUser);

app.get("/teams", withAuth(queries.getTeams));
app.get("/teams/:id", queries.getTeamById);
app.post("/teams", withAuth(queries.createTeam));
app.put("/teams/:id", queries.updateTeam);
app.delete("/teams/:id", queries.deleteTeam);

app.post("/teams/:teamId/users", queries.createTeamUser);
app.put("/teams/:teamId/users/:userId", queries.updateTeamUser);
app.delete("/teams/:teamId/users/:userId", queries.deleteTeamUser);

app.get("/teams/:teamId/desks", queries.getTeamDesks);

app.post("/desks", queries.createDesk);
app.get("/desks/:deskId", queries.getDesk);
// app.put('/desks/:deskId');
app.delete("/desks/:deskId/users/:userId", queries.deleteDeskUser);
app.get("/desks/:deskId/users", queries.getDeskUsers);
app.post("/desks/:deskId/users", queries.createDeskUser);

app.post("/desks/columns", queries.createColumn);
app.delete("/desks/columns/:id", queries.deleteColumn);
app.post("/desks/cards", queries.createCard);
app.delete("/desks/cards/:id", queries.deleteCard);
app.put("/desks/cards/:id", queries.updateCard);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
