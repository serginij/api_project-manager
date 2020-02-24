const express = require('express');
const queries = require('../queries');

const router = express.Router();

router.use((req, res, next) => next());

router.get('/', queries.getUsers);
router.get('/:id', queries.getUserById);
router.put('/update', queries.updateUser);
router.delete('/:id', queries.deleteUser);
router.get('/find/:username', queries.findUser);

module.exports = router;
