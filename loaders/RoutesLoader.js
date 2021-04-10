const finance = require('../routes/finance');
const index = require('../routes/index');
const auth = require('../routes/auth');
const product = require('../routes/product');

// noinspection JSUndefinedPropertyAssignment
module.exports = (app) => {
    app.use('/', index);
    app.use('/auth', auth);
    app.use('/finance', finance);
    app.use('/product', product);
}
