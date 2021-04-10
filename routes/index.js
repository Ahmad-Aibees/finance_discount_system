const express = require('express');
const router = express();

/* GET home page. */
router.route('/').get((req, res, next) => {
  res.render('index', { title: 'Discount Service' });
});

// noinspection JSUndefinedPropertyAssignment
module.exports = router;
