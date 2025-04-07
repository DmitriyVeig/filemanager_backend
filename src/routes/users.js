const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');

router.post('/users/authentication/', UserController.authentication);

// router.get('/users/status/', userController.verifyToken, UserController.status);
// router.get('/users', UserController.users);
// router.post('/users/registration/:username/:password', UserController.registration);

module.exports = router;