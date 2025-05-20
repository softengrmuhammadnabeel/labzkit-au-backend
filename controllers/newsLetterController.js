const NewsLetter = require("../models/NewsLetterModel");

const createEmail = async (req, res) => {
    try {
        const { emails, subscribedAt } = req.body;

        const newEmail = new NewsLetter({ emails, subscribedAt });
        const result = await newEmail.save();

        res.status(201).json(newEmail);
    } catch (error) {
        console.error("Create error:", error);
        res.status(500).json({ error: "Failed to create newsletter email." });
    }
};

const getEmails = async (req, res) => {
    try {
        const emails = await NewsLetter.find();
        res.status(200).json(emails);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve newsletter emails." });
    }
};

const getEmailById = async (req, res) => {
    try {
        const email = await NewsLetter.findById(req.params.id);
        if (!email) {
            return res.status(404).json({ error: "Email not found." });
        }
        res.status(200).json(email);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve email." });
    }
};

const updateEmail = async (req, res) => {
    try {
        const { emails, subscribedAt } = req.body;

        const updatedEmail = await NewsLetter.findByIdAndUpdate(
            req.params.id,
            { emails, subscribedAt },
            { new: true }
        );

        if (!updatedEmail) {
            return res.status(404).json({ error: "Email not found." });
        }

        res.status(200).json(updatedEmail);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update email." });
    }
};

const deleteEmail = async (req, res) => {
    try {
        const deletedEmail = await NewsLetter.findByIdAndDelete(req.params.id);
        if (!deletedEmail) {
            return res.status(404).json({ error: "Email not found." });
        }
        res.status(200).json({ message: "Email deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete email." });
    }
};

// Export all controller functions
module.exports = {
    createEmail,
    getEmails,
    getEmailById,
    updateEmail,
    deleteEmail,
};
