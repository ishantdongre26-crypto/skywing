// Admin authorization middleware
const adminAuth = (req, res, next) => {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Unauthorized. Please login first." });
    }
    
    // Check if user is an admin
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    
    next();
};

// Export for use in routes
module.exports = adminAuth;
