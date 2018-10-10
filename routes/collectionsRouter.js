const express = require('express');
const router = express.Router();

const collectionsController = require('../controllers/collectionsController');

//Get: get a user's collection
router.get('/collections/:id', collectionsController.collectionsGet);

//Get: get all user's collections
router.get('/collections', collectionsController.collectionsGetAll);

//POST: add a collection to user
router.post('/collections', collectionsController.collectionsPost);

//PUT: update collection belonging to user
router.put('/collections/:id', collectionsController.collectionsUpdate);

// DELETE: delete collection belonging to user
router.delete('/collections/:id', collectionsController.collectionsDelete);

module.exports = router;