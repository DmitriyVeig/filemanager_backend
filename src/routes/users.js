const express = require('express');
const router = express.Router();
const controller = require('../controller');

router.post('/users/:id/logged', controller.logged);
router.get('/users', controller.users);
router.get('/users/:id', controller.checkUserActivity, controller.user);

module.exports = router;