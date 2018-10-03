const express = require('express');
const router = express.Router();

const visitsController = require('../controllers/visitsController');

////////////////////////////////
//AUTHENTICATED PROVIDERS ONLY
////////////////////////////////

//GET upcoming visit (one) for my client
// router.get('/clients/:id/visits', visitsController.visitsGetClientUpcoming);

//POST: add a visit for the client of an authenticated provider (client's can't add visits)
router.post('/clients/visits', visitsController.visitsPost);

// DELETE: delete a visit for the client of an authenticated provider (client's can't delete visits)
router.delete('/clients/visits/:id', visitsController.visitsDelete);

// DELETE: delete all visits for the client of an authenticated provider, prep for deleting client
router.delete('/clients/:id/visits', visitsController.visitsDeleteAll);

module.exports = router;