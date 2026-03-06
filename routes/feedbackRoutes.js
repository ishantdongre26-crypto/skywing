const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const User = require("../models/user");

// Submit feedback (authenticated users)
router.post("/submit", async (req, res) => {
    try {
        const { rating, category, subject, message } = req.body;
        
        // Check if user is logged in
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Please login to submit feedback" });
        }

        // Get user details
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create new feedback
        const feedback = new Feedback({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            rating,
            category,
            subject,
            message
        });

        await feedback.save();

        res.json({ 
            success: true, 
            message: "Feedback submitted successfully! Thank you for your valuable input.",
            feedback 
        });
    } catch (error) {
        console.error("Feedback submission error:", error);
        res.status(500).json({ success: false, message: "Error submitting feedback" });
    }
});

// Get all feedback (admin only)
router.get("/all", async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        const user = await User.findById(req.session.userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admin only." });
        }

        const feedback = await Feedback.find().sort({ createdAt: -1 });
        
        res.json({ success: true, feedback });
    } catch (error) {
        console.error("Get all feedback error:", error);
        res.status(500).json({ success: false, message: "Error fetching feedback" });
    }
});

// Delete feedback (admin only)
router.delete("/delete/:id", async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        const user = await User.findById(req.session.userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admin only." });
        }

        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        res.json({ success: true, message: "Feedback deleted successfully" });
    } catch (error) {
        console.error("Delete feedback error:", error);
        res.status(500).json({ success: false, message: "Error deleting feedback" });
    }
});

// Get feedback by ID (admin only)
router.get("/:id", async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        const user = await User.findById(req.session.userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admin only." });
        }

        const feedback = await Feedback.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        res.json({ success: true, feedback });
    } catch (error) {
        console.error("Get feedback error:", error);
        res.status(500).json({ success: false, message: "Error fetching feedback" });
    }
});

// Get public feedback (for forum view - without private info)
router.get("/public/all", async (req, res) => {
    try {
        // Return feedback without user email and ID - just for public display
        const feedback = await Feedback.find()
            .select('userName rating category subject message createdAt adminResponse')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, feedback });
    } catch (error) {
        console.error("Get public feedback error:", error);
        res.status(500).json({ success: false, message: "Error fetching feedback" });
    }
});

module.exports = router;

