const express = require('express');
const router = express.Router();

const photosController = require('../controllers/photosController');

//POST: add a photo to S3
router.post('/photos', photosController.photosPost);

//DELETE: delete a photo from S3
router.delete('/photos', photosController.photosDelete);

module.exports = router;