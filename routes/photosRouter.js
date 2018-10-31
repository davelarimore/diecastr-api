const express = require('express');
const router = express.Router();

const photosController = require('../controllers/photosController');

//POST: add a photo to model
router.post('/photos', photosController.photosPost);

module.exports = router;