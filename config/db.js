let {Pool, Client} = require('pg');
const config = require('../loaders/ConfigLoader');

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    getPool: () => {
        return new Pool(config.config().database)
    }
}
