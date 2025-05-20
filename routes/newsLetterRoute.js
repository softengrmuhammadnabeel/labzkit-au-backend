const express = require("express");

const router = express.Router();
const {
  createEmail,

  deleteEmail,
  getEmailById,
  getEmails,
  updateEmail,
} = require("../controllers/newsLetterController");

// POST a new email subscription
router.post("/", createEmail);

// GET all email subscriptions
router.get("/", getEmails);

// GET a specific email by ID
router.get("/:id", getEmailById);

// DELETE an email by ID
router.delete("/:id", deleteEmail);

module.exports = router;
