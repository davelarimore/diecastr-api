const express = require('express');
const router = express.Router();

const modelsController = require('../controllers/modelsController');

//POST: add a model to user
router.post('/models', modelsController.modelsPost);

//PUT: update model belonging to user
router.put('/models/:id', modelsController.modelsUpdate);

// DELETE: delete model belonging to user
router.delete('/models/:id', modelsController.modelsDelete);

module.exports = router;