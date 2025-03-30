const express = require('express');
const router = express.Router();
const controller = require('../controller');

router.post('/users/:id/logging', controller.userLogging);
router.get('/users/:id/logged', controller.checkUserActivity, controller.userLogged);
router.get('/users', controller.users);
router.post('/users/create/:username/:password', controller.createUser);

module.exports = router;