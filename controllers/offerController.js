const Offer = require("../models/offerModel");

const createOffer = async (req, res) => {
    try {
        const { offerText } = req.body;
        const newOffer = new Offer({ offerText });
        const result = await newOffer.save();
        res.status(201).json(newOffer);
    } catch (error) {
        res.status(500).json({ error: "Failed to create offer." });
    }
};

const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find();
        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve offers." });
    }
};

const getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: "Offer not found." });
        }
        res.status(200).json(offer);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve offer." });
    }
};

const updateOffer = async (req, res) => {
    try {
        const { offerText } = req.body;
        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.id,
            { offerText },
            { new: true }
        );
        if (!updatedOffer) {
            return res.status(404).json({ error: "Offer not found." });
        }
        res.status(200).json(updatedOffer);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update offer." });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
        if (!deletedOffer) {
            return res.status(404).json({ error: "Offer not found." });
        }
        res.status(200).json({ message: "Offer deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete offer." });
    }
};

// ✅ Export all controller functions
module.exports = {
    createOffer,
    getOffers,
    getOfferById,
    updateOffer,
    deleteOffer,
};
