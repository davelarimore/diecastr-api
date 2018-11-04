const express = require('express');
const router = express.Router();

const modelsController = require('../controllers/modelsController');

//GET: get a model belonging to current user
router.get('/models/:id', modelsController.modelsGet);

//GET: get all models beloning to a collection
router.get('/models/collection/:collectionId', modelsController.modelsGetCollection);

//GET: get all models belonging to current user
router.get('/models', modelsController.modelsGetAll);

//POST: add a model to user
router.post('/models', modelsController.modelsPost);

//PUT: update model belonging to user
router.put('/models/:id', modelsController.modelsUpdate);

// DELETE: delete model belonging to user
router.delete('/models/:id', modelsController.modelsDelete);

module.exports = router;