const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');

router.post('/users/:id/logging', UserController.userLogging);
router.get('/users/:id/logged', UserController.checkUserActivity, UserController.userLogged);
router.get('/users', UserController.users);
router.post('/users/create/:username/:password', UserController.createUser);

module.exports = router;