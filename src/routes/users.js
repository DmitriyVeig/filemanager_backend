const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');

router.post('/users/authentication/:username/:password', UserController.authentication);
router.get('/users/status/:username/:password', UserController.checkUserActivity, UserController.status);
router.get('/users', UserController.users);
router.post('/users/registration/:username/:password', UserController.registration);

module.exports = router;