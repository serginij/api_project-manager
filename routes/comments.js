const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.delete('/:id', queries.deleteComment);
router.put('/:id', queries.updateComment);

module.exports = router;
