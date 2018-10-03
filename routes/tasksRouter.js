const express = require('express');
const router = express.Router();

const tasksController = require('../controllers/tasksController');

//GET handled by getMe()

//POST: add task to client or client of provider
router.post('/tasks', tasksController.tasksPost);

// DELETE: delete task to client or client of provider
router.delete('/tasks/:id', tasksController.tasksDelete);

module.exports = router;