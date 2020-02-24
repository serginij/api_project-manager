const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.put('/:id', queries.updateLabel);
router.delete('/:id', queries.deleteLabel);

module.exports = router;
