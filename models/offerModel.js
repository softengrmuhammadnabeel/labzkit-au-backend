const mongoose = require("mongoose");

// Review schema definition
const offerSchema = new mongoose.Schema({
  
  
  offerText: {
    type: String,
    required: false,
    maxLength: 500,
  },
  
});

// Review model creation
const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
