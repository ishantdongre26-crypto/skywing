// Simple session-based authentication middleware
const authMiddleware = (req, res, next) => {
    // Check if user is logged in (session exists)
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Unauthorized. Please login first." });
    }
    next();
};

// Export for use in routes
module.exports = authMiddleware;
