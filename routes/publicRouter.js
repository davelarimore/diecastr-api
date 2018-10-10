const express = require('express');
const router = express.Router();

const collectionsController = require('../controllers/collectionsController');
const modelsController = require('../controllers/modelsController');

//GET: public collections
router.get('/collections', collectionsController.collectionsGetAllPublic);

//GET: get all models belonging to a collection
router.get('/models/collection/:collectionId', modelsController.modelsGetCollection);

module.exports = router;