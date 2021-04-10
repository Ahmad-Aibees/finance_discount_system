const morgan = require('morgan');
const express = require('express');
const colors = require('colors');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const persianCoding = require('persianjs');

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function convertNumbers(objects) {
    objects.forEach(object => {
        for (let key in object) {
            if (!object.hasOwnProperty(key)) continue;
            if (Object.hasOwnProperty.bind(object)(key) && object[key]) {
                switch (typeof object[key]) {
                    case "string":
                        object[key] = persianCoding(object[key]).persianNumber()._str;
                        break;
                    case "number":
                        object[key] = persianCoding(object[key] + '').persianNumber()._str;
                        if (object[key].indexOf('.') !== -1)
                            object[key] = parseFloat(object[key]);
                        else
                            object[key] = parseInt(object[key], 10);
                        break;
                    case "object":
                        convertNumbers([objects[key]]);
                        break;
                }
            }
        }
    });
}

function config() {
    return Object.freeze({
        application: {
            mode: process.env.MODE,
            PORT: process.env.PORT,
            privateKeyLocation: process.env.privateKeyLocation
        },
        database: {
            user: process.env.USER || undefined,
            host: process.env.HOST,
            database: process.env.DB_NAME,
            password: process.env.PASSWORD,
            port: process.env.DB_PORT
        }
    })
}

module.exports = {
    configLog: (app) => {
        app.use(morgan(function (tokens, req, res) {
            const duration = tokens['response-time'](req, res);
            if (req.method === 'POST') {
                console.log('body', req.body);
            }
            const status = tokens.status(req, res);
            return [
                colors.yellow(req['companyName'] || 'no company'),
                colors.cyan(tokens.method(req, res)),
                colors.blue(tokens.url(req, res)),
                (status && status.charAt(0) !== 4) ? colors.green(tokens.status(req, res)) : colors.red(tokens.status(req, res)),
                colors.brightMagenta(new Date().toLocaleDateString() + ' ' +  new Date().toLocaleTimeString()),
                tokens.res(req, res, 'content-length'), '-',
                duration ? parseInt(duration) > 600 ? duration.red + 'ms' : colors.green(duration + 'ms') : colors.red('request was canceled'),
            ].join(' ')
        }));
    },
    config: config,
    configServer: (app) => {
        app.use(session({
            secret: '#/25633%??||/',
            resave: false,
            saveUninitialized: true,
            cookie: {secure: true}
        }));
    },
    runServer: (app) => {
        const port = normalizePort(config().application.PORT);
        app.listen(port, () => {
            console.log(colors.bold.blue(`server process ${process.pid} running in ${config().application.mode} mode on port ${config().application.PORT}`));
        });
    },
    preConfig: (app, __basedir) => {

        //Require static assets from public folder
        app.use(express.static(path.join(__basedir, 'public')));

        // Set 'views' directory for any views
        // being rendered res.render()
        app.set('views', path.join(__basedir, 'views'));

        // Set view engine as EJS
        app.set('view engine', 'ejs');

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        app.use((req, res, next) => {
            let params = req.params;
            let body = req.body;
            let query = req.query;
            convertNumbers([params, body, query]);
            next();
        });

        app.use(cookieParser());
        app.use(cors({
            origin: '*',
            allowedHeaders: [
                'Accept-Version',
                'Authorization',
                'Credentials',
                'Content-Type',
                'token'
            ]
        }));
    },
    configListeners: (app) => {
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // error handler
        app.use(function (err, req, res) {
            // set locals, only providing error in development
            res.message = err.message;
            res.error = req.app.get('env') === process.env.NODE_ENV ? err : {};
            // render the error page
            res.status(err.status || 500);
            res.send();
        });

        /**
         * Event listener for HTTP server "error" event.
         */
        function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof config().application.PORT === 'string'
                ? 'Pipe ' + config().application.PORT
                : 'Port ' + config().application.PORT;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        /**
         * Event listener for HTTP server "listening" event.
         */

        function onListening() {
            const addr = app.address();
            const bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            // debug('Listening on ' + bind);
        }


        app.on('error', onError);
        app.on('listening', onListening);
        app.on('clientError', function (err) {
            console.error('on clientError handler');
            console.error(err);
        });

    }
}
