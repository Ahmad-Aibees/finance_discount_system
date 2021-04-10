const connect = require('../config/db');
const crypt = require('bcryptjs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const {callbackResponse, handleError} = require('../methods/RequestMethods');
const companyModel = require('../models/CompanyModel');
const auth = require('basic-auth');
const config = require('../loaders/ConfigLoader');
const {Condition} = require("../classes/InputConditions");
const {validateInput} = require("../methods/RequestMethods");

/**
 * generates and sends jwt token
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function login(req, res) {
    let db;
    try {
        db = connect.getPool();

        const authObject = auth(req);

        if (!authObject) throwError(new Error('missing_authorization_header'));

        const {name: username, pass: password} = auth(req);

        const company = await companyModel.findCompanyByUserName(username, db);

        // noinspection JSUnresolvedFunction
        const passwordResult = crypt.compareSync(password, company.password);

        if (!passwordResult) throwError(new Error('wrong_password'));

        const privateKey = fs.readFileSync(__basedir + config.config().application.privateKeyLocation);

        const token = jwt.sign({
            token: company.username,
            role: 'company'
        }, privateKey, {
            expiresIn: '2d'
        })

        callbackResponse(200, res, null, token);

    } catch (e) {
        if (e.message === 'not_found') handleError(res, new Error('wrong_username'));
        else handleError(res, e);
    } finally {
        if (db) await db.end();
    }
}

/**
 * checks the authorization token, if valid adds company to req, otherwise throws error
 * in case of a not valid token the next function will not be called and the code will not proceed
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function authorizeCompany(req, res, next) {
    let db;
    try {
        db = connect.getPool();

        const {token} = req;
        if (!token) throwError(new Error('wrong_token'));

        let {token: companyName} = jwt.decode(token);

        req.company = await companyModel.findCompanyByUserName(companyName, db);

        next();
    } catch (e) {
        if (e.message === 'not_found' || e instanceof SyntaxError) handleError(res, new Error('wrong_token'));
        else handleError(res, e);
    } finally {
        if (db) db.end();
    }
}

async function resetPassword(req, res) {
    let db;
    try {
        db = connect.getPool();

        let inputError = validateInput(req.body, [
            new Condition({
                label: 'password', required: true, type: 'string'
            }),
            new Condition({
                label: 'username', type: 'string', required: true
            })
        ]);
        if (inputError) throwError(inputError);

        const {username, password} = req.body;

        const company = await companyModel.findCompanyByUserName(username, db);

        const salt = crypt.genSaltSync(10);
        const hash = crypt.hashSync(password, salt);

        await companyModel.setPassword(company.id, hash, db);

        callbackResponse(200, res);

    } catch (e) {
        if (e.message === 'not_found' || e instanceof SyntaxError) handleError(res, new Error('wrong_token'));
        else handleError(res, e);
    } finally {
        if (db) db.end();
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    login: login,
    authorizeCompany: authorizeCompany,
    resetPassword: resetPassword
}
