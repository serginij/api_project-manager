const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.post('/:listId/items', queries.createItem);
router.put('/:id', queries.updateList);
router.delete('/:id', queries.deleteList);

module.exports = router;
