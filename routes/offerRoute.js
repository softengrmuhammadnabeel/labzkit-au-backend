const {createOffer,deleteOffer,getOffers, getOfferById,updateOffer} = require('../controllers/offerController');
const express = require("express");

const router = express.Router();

router.post('/', createOffer);
router.get('/', getOffers);
router.get('/:id',getOfferById);
router.put('/:id',updateOffer);
router.delete('/:id',deleteOffer);

module.exports = router;
