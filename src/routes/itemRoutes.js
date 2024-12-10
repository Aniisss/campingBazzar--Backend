const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const createItem = require('../controllers/itemController');



// Route for signing in a user
router.post('/createItem', authenticate, createItem);

module.exports = router;