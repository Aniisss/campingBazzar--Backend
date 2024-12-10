const express = require('express');
const router = express.Router();
const {signIn} = require('../controllers/userController');
const authenticate = require('../middlewares/auth');



// Route for signing in a user
router.post('/signin', authenticate, signIn);

module.exports = router;