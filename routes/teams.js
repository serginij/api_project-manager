const express = require('express');
const queries = require('../queries');
const { withAuth } = require('../helpers');

const router = express.Router();

router.use((req, res, next) => next());

router.get('/', withAuth(queries.getTeams));
router.get('/:id', queries.getTeamById);
router.post('/', withAuth(queries.createTeam));
router.put('/:id', withAuth(queries.updateTeam));
router.delete('/:id', withAuth(queries.deleteTeam));

router.get('/:teamId/user/find/:username', queries.findTeamUser);

router.post('/:teamId/users', withAuth(queries.createTeamUser));
router.put('/:teamId/users/:userId', withAuth(queries.updateTeamUser));
router.delete('/:teamId/users/:userId', withAuth(queries.deleteTeamUser));

router.get('/:teamId/desks', queries.getTeamDesks);

module.exports = router;
