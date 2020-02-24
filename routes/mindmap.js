const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.post('/parseDesk', queries.parseDesk);
router.post('/parse', queries.parseMindmap);

module.exports = router;
