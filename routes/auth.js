const express = require('express');
const router = express();
const controller = require('../controllers/AuthController');

router.route('/login').post(controller.login);

router.route('/reset-password').post(controller.resetPassword)


// noinspection JSUndefinedPropertyAssignment
module.exports = router;
