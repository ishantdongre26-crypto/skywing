const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Save a new booking
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { bookingRef, flight, passenger, totalAmount } = req.body;
        
        // Input validation
        if (!bookingRef || !flight || !passenger || !totalAmount) {
            return res.status(400).json({ error: "All booking details are required" });
        }

        // Find user and add booking
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newBooking = {
            bookingRef,
            flight,
            passenger,
            totalAmount,
            status: "Confirmed",
            createdAt: new Date()
        };

        user.bookings.push(newBooking);
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: "Booking saved successfully",
            booking: newBooking
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all bookings for current user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Sort bookings by date (newest first)
        const bookings = user.bookings.sort((a, b) => b.createdAt - a.createdAt);

        res.json({ 
            success: true, 
            bookings: bookings,
            totalBookings: bookings.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all bookings from all users (Admin only)
router.get("/all", adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("name email bookings");
        
        // Flatten all bookings with user info
        let allBookings = [];
        users.forEach(user => {
            user.bookings.forEach(booking => {
                allBookings.push({
                    ...booking.toObject(),
                    userName: user.name,
                    userEmail: user.email,
                    userId: user._id
                });
            });
        });

        // Sort by date (newest first)
        allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ 
            success: true, 
            bookings: allBookings,
            totalBookings: allBookings.length,
            totalUsers: users.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get total booking value for current user
router.get("/total-value", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Calculate total value of all bookings
        const totalValue = user.bookings.reduce((sum, booking) => {
            return sum + (booking.totalAmount || 0);
        }, 0);

        res.json({ 
            success: true, 
            totalValue: totalValue,
            currency: "USD"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific booking by reference
router.get("/:bookingRef", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const booking = user.bookings.find(b => b.bookingRef === req.params.bookingRef);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel a booking (Admin can cancel any user's booking)
router.put("/cancel/:bookingId", adminAuth, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // Find user who has this booking
        const user = await User.findOne({ "bookings._id": bookingId });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Find and update the booking status
        const booking = user.bookings.id(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Update status to Cancelled
        booking.status = "Cancelled";
        await user.save();

        res.json({ 
            success: true, 
            message: `Booking ${booking.bookingRef} has been cancelled successfully`,
            bookingRef: booking.bookingRef
        });
    } catch (err) {
        console.error("Cancel booking error:", err);
        res.status(500).json({ success: false, message: "Error cancelling booking" });
    }
});

module.exports = router;
