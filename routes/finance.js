const express = require('express');
const router = express();
const bearerToken = require('express-bearer-token');
const controller = require('../controllers/FinanceController');
const authController = require('../controllers/AuthController');

router.use(bearerToken({
    bodyKey: 'token',
    queryKey: 'token',
    headerKey: 'Bearer',
    reqKey: 'token',
    cookie: false, // by default is disabled
}));

router.route('/discount')
    .post([authController.authorizeCompany], controller.checkDiscountCode);

// noinspection JSUndefinedPropertyAssignment
module.exports = router;
