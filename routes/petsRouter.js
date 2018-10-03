const express = require('express');
const router = express.Router();

const petsController = require('../controllers/petsController');

//POST: add a pet to client or client of provider
router.post('/pets', petsController.petsPost);

//PUT: update pet belonging to client or client of provider
router.put('/pets/:id', petsController.petsUpdate);

// DELETE: delete pet belonging to client or client of provider
router.delete('/pets/:id', petsController.petsDelete);

module.exports = router;