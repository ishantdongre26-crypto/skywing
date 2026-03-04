const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();

// CORS configuration - allows both local and production
const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER_EXTERNAL_URL;

const corsOptions = {
    origin: function(origin, callback) {
        // In production, allow any origin (for cross-origin cookies)
        if (isProduction) {
            callback(null, true);
            return;
        }
        
        // For development, use the allowed list
        const allowedOrigins = [
            'http://localhost:5000',
            'http://localhost:3000',
            process.env.RENDER_EXTERNAL_URL
        ].filter(Boolean);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

// Session configuration
// Connect to MongoDB first
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI environment variable is not set!");
    console.log("Please set your MongoDB Atlas connection string in .env file");
} else {
    mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));
}

// Configure session with MongoStore for production scaling
const sessionConfig = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: isProduction, // true in production (HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Works well for same-domain apps
    }
};

// Use MongoStore in production for session persistence across multiple instances
if (isProduction && MONGO_URI) {
    sessionConfig.store = MongoStore.create({
        mongoUrl: MONGO_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 24 hours
    });
    console.log("✅ Using MongoDB for session storage (production mode)");
}

app.use(session(sessionConfig));

// Routes
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const flightRoutes = require("./routes/flightRoutes");
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/flights", flightRoutes);

// Health check endpoint for Render
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server is running successfully!`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  if (process.env.RENDER_EXTERNAL_URL) {
      console.log(`🌐 Production URL: ${process.env.RENDER_EXTERNAL_URL}`);
  }
  console.log("=================================");
});

