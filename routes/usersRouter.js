const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const usersController = require('../controllers/usersController');

//GET: get my user object
router.get('/users', usersController.usersGetMe);

//PUT: update a user object
router.put('/users', usersController.usersPut);

//DELETE: delete a user object
router.delete('/users/:id', usersController.usersDelete);

module.exports = router;