var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    console.log('test console log message aga');
  res.send('hello world! :-)'); 
});

module.exports = router;