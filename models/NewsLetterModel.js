const mongoose = require("mongoose");

// Review schema definition
const newsLetterSchema = new mongoose.Schema({


  emails: {
    type: String,
    required: false,
    maxLength: 500,
  },
  subscribedAt: {
    type: String,
    required: false,
    maxLength: 500,
  },

});

// Review model creation
const NewsLetter = mongoose.model("newsLetter", newsLetterSchema);

module.exports = NewsLetter;
