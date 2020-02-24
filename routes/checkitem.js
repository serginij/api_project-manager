const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.put('/:itemId', queries.updateItem);
router.delete('/:id', queries.deleteItem);

module.exports = router;
