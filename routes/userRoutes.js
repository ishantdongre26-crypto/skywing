const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Create User
router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        
        // Don't return the password in the response
        res.status(201).json({ 
            id: user._id, 
            name: user.name, 
            email: user.email 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create Admin User (with secret code)
router.post("/admin", async (req, res) => {
    try {
        const { name, email, password, secretCode } = req.body;
        
        // Secret code to prevent unauthorized admin creation
        const ADMIN_SECRET_CODE = "skywing-2007";
        
        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }
        
        // Verify secret code
        if (!secretCode || secretCode !== ADMIN_SECRET_CODE) {
            return res.status(403).json({ error: "Invalid secret code" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });
        await user.save();
        
        // Don't return the password in the response
        res.status(201).json({ 
            success: true,
            message: "Admin user created successfully",
            id: user._id, 
            name: user.name, 
            email: user.email,
            role: user.role
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Users (Admin only)
router.get("/", adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password from response
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Set session with role
        req.session.userId = user._id;
        req.session.user = { 
            id: user._id, 
            name: user.name, 
            email: user.email,
            role: user.role 
        };
        
        res.json({ 
            success: true, 
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout User
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ success: true, message: "Logout successful" });
    });
});

// Check session (for protected routes)
router.get("/session", authMiddleware, (req, res) => {
    res.json({ 
        authenticated: true, 
        user: req.session.user 
    });
});

module.exports = router;
