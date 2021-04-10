const express = require('express');
const router = express();
const bearerToken = require('express-bearer-token');
const authController = require("../controllers/AuthController");
const productController = require('../controllers/ProductController');

router.use(bearerToken({
    bodyKey: 'token',
    queryKey: 'token',
    headerKey: 'Bearer',
    reqKey: 'token',
    cookie: false, // by default is disabled
}));

router.route('/tree')
    .get([authController.authorizeCompany], productController.getProductTree);

// noinspection JSUndefinedPropertyAssignment
module.exports = router;
