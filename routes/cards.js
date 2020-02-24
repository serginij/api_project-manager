const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.post('/:id/users', queries.addCardUser);
router.delete('/:id/users/:userId', queries.deleteCardUser);
router.post('/:cardId/labels', queries.addCardLabel);
router.delete('/:cardId/labels/:labelId', queries.deleteCardLabel);
router.post('/:cardId/comments', queries.createComment);
router.post('/:cardId/checklists', queries.createList);

module.exports = router;
