const express = require('express');
const router = express.Router();

const collectionsController = require('../controllers/collectionsController');
const modelsController = require('../controllers/modelsController');

//GET: get all models belonging to a collection
router.get('/collections/models', collectionsController.collectionsGetPublicModelList);

//GET: public collections
router.get('/collections', collectionsController.collectionsGetAllPublic);

//GET: get a model belonging to a public collection
router.get('/models/:id', modelsController.modelsGetPublic);

module.exports = router;