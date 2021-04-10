const express = require('express');
const routesLoader = require('./loaders/RoutesLoader');
const configLoader = require('./loaders/ConfigLoader');
const dot_env = require('dotenv');
dot_env.config({path: __dirname + '/config/config.env'});

const app = express();

global.throwError = (err) => { throw err; }
global.__basedir = __dirname;

configLoader.configLog(app);
configLoader.configServer(app);
configLoader.runServer(app);
configLoader.preConfig(app, __dirname);
routesLoader(app);
configLoader.configListeners(app);

// noinspection JSUndefinedPropertyAssignment
module.exports = app;

