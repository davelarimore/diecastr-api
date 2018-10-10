const express = require('express');
const router = express.Router();

const photosController = require('../controllers/photosController');

//GET: get a photo belonging to current user
router.get('/photos/:id', photosController.photosGet);

//GET: get all photos belonging to current user
router.get('/photos', photosController.photosGetAll);

//POST: add a photo to model
router.post('/photos', photosController.photosPost);

//PUT: update photo belonging to model
router.put('/photos/:id', photosController.photosUpdate);

// DELETE: delete photo belonging to model
router.delete('/photos/:id', photosController.photosDelete);

module.exports = router;