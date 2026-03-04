const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    bookingRef: { type: String, required: true },
    flight: {
        from: String,
        to: String,
        airline: String,
        flightNumber: String,
        date: String,
        departureTime: String,
        arrivalTime: String,
        duration: String,
        stops: String,
        price: Number
    },
    passenger: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        dob: String,
        passport: String
    },
    totalAmount: Number,
    status: { type: String, default: "Confirmed" },
    createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    bookings: [bookingSchema]
});

module.exports = mongoose.model("User", userSchema);
