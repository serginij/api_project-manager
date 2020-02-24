const express = require('express');
const queries = require('../queries');
const { withAuth } = require('../helpers');

const router = express.Router();

router.use((req, res, next) => next());

router.post('/login', queries.login);
router.post('/signup', queries.signup);
router.put('/password', withAuth(queries.updatePassword));

module.exports = router;
