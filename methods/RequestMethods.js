const {ValidationError} = require("../classes/ErrorClasses");
const errors = require('../config/error');

function callbackResponse(code, res, message, data) {
    let success = false;
    let innerMessage = message;
    switch (code) {
        case 201:
            success = true;
            if (!message && !data) message = 'Successfully created';
            break;
        case 200:
            success = true;
            break;
        case 400:
            if (!innerMessage && !data) innerMessage = 'bad request';
            break;
        case 401:
            if (!message && !data) message = 'incorrect auth token';
            break;
        case 403:
            if (!message && !data) message = 'forbidden';
            break;
        case 405:
            if (!message && !data) message = 'Method Not Allowed: The resource doesn\'t support the specified HTTP verb.';
            break;
        case 412:
            if (!innerMessage && !data) innerMessage = 'one or more Headers missing';
            break;
        case 500:
            if (!innerMessage && !data) innerMessage = 'Internal Server Error';
            break;
        case 501:
            if (!innerMessage && !data) innerMessage = 'deleted method';
            break;
    }
    res.status(code)
        .send(innerMessage ?
            {
                'success': success,
                'message': innerMessage
            } :
            {'success': success, 'data': data}
        );
}

function handleError(res, err) {
    let message;
    let code;
    let responseCode;
    if (typeof err === "string") {
        message = err;
        code = 400;
    } else if (err instanceof ValidationError) {
        message = err.message + ' not received';
        code = 400;
    } else if (errors[err.message.toLowerCase()]) {
        let errorMessage = err.message.toLowerCase();
        const errorObject = errors[errorMessage];
        if (errorObject) {
            message = errorObject['message'];
            code = errorObject['code'];
            responseCode = errorMessage;
        }
    }
    message = message || 'internal server error';
    code = code || 500;
    console.error(err);
    callbackResponse(code, res, message, responseCode);
}

function validateInput(input, conditions) {
    let error = '';
    conditions.forEach(condition => {
        const results = condition.validate(input[condition.label]);
        if (!results[0]) error += results[1] + ',';
    });
    return error ? ('missing inputs: ' + error):  null;
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    callbackResponse: callbackResponse,
    handleError: handleError,
    validateInput: validateInput
}
