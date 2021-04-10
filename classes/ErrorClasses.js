class Error {
    constructor(message) {
        this.message = message;
        this.name = "Error";
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    ValidationError: ValidationError
};
