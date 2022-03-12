const express = require('express');
const router = express.Router();
const test = require('../Controllers/Auth');

//test api
router.post('/login', test.loginStudent);

//signup student 
router.post('/signupTest', test.signupStudent);


module.exports = router;