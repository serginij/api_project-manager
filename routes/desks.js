const express = require('express');
const queries = require('../queries');
const { withAuth } = require('../helpers');

const router = express.Router();

router.use((req, res, next) => next());

router.post('/', queries.createDesk);
router.get('/:deskId', queries.getDesk);
router.put('/:deskId', withAuth(queries.updateDesk));
router.delete('/:deskId', withAuth(queries.deleteDesk));

router.delete('/:deskId/users/:userId', withAuth(queries.deleteDeskUser));
router.get('/:deskId/users', queries.getDeskUsers);
router.post('/:deskId/users', withAuth(queries.createDeskUser));

router.post('/columns', queries.createColumn);
router.delete('/columns/:id', queries.deleteColumn);
router.put('/columns/:id', withAuth(queries.updateColumn));

router.post('/cards', queries.createCard);
router.delete('/cards/:id', queries.deleteCard);
router.put('/cards/:id', queries.updateCard);

router.get('/:deskId/user/find/:usern', queries.findDeskUser);
router.post('/:deskId/labels', queries.createLabel);

module.exports = router;
