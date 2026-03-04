const express = require("express");
const router = express.Router();
const Flight = require("../models/flight");
const adminAuth = require("../middleware/adminAuth");

// Get all flights (public - for search)
router.get("/", async (req, res) => {
    try {
        const { from, to, date } = req.query;
        
        let query = {};
        
        if (from) {
            query.from = new RegExp(from, 'i');
        }
        if (to) {
            query.to = new RegExp(to, 'i');
        }
        if (date) {
            query.date = date;
        }
        
        const flights = await Flight.find(query).sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            flights: flights,
            count: flights.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all flights for admin
router.get("/all", adminAuth, async (req, res) => {
    try {
        const flights = await Flight.find().sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            flights: flights,
            count: flights.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new flight (admin only)
router.post("/", adminAuth, async (req, res) => {
    try {
        const { airline, flightNumber, from, to, departureTime, arrivalTime, duration, stops, price, availableSeats, date, status } = req.body;
        
        // Input validation
        if (!airline || !flightNumber || !from || !to || !departureTime || !arrivalTime || !duration || !price || !date) {
            return res.status(400).json({ error: "All required flight details must be provided" });
        }
        
        // Check if flight number already exists
        const existingFlight = await Flight.findOne({ flightNumber });
        if (existingFlight) {
            return res.status(400).json({ error: "Flight with this flight number already exists" });
        }
        
        const newFlight = new Flight({
            airline,
            flightNumber,
            from,
            to,
            departureTime,
            arrivalTime,
            duration,
            stops: stops || "Non-stop",
            price,
            availableSeats: availableSeats || 50,
            date,
            status: status || "Active"
        });
        
        await newFlight.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Flight added successfully",
            flight: newFlight
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a flight (admin only)
router.put("/:id", adminAuth, async (req, res) => {
    try {
        const { airline, flightNumber, from, to, departureTime, arrivalTime, duration, stops, price, availableSeats, date, status } = req.body;
        
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ error: "Flight not found" });
        }
        
        // Update fields
        if (airline) flight.airline = airline;
        if (flightNumber) flight.flightNumber = flightNumber;
        if (from) flight.from = from;
        if (to) flight.to = to;
        if (departureTime) flight.departureTime = departureTime;
        if (arrivalTime) flight.arrivalTime = arrivalTime;
        if (duration) flight.duration = duration;
        if (stops) flight.stops = stops;
        if (price) flight.price = price;
        if (availableSeats) flight.availableSeats = availableSeats;
        if (date) flight.date = date;
        if (status) flight.status = status;
        
        await flight.save();
        
        res.json({ 
            success: true, 
            message: "Flight updated successfully",
            flight: flight
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a flight (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        
        if (!flight) {
            return res.status(404).json({ error: "Flight not found" });
        }
        
        res.json({ 
            success: true, 
            message: "Flight deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed initial flights (for demo purposes)
router.post("/seed", adminAuth, async (req, res) => {
    try {
        const sampleFlights = [
            {
                airline: "Emirates",
                flightNumber: "EK001",
                from: "New York (JFK)",
                to: "London (LHR)",
                departureTime: "08:00",
                arrivalTime: "20:00",
                duration: "7h 00m",
                stops: "Non-stop",
                price: 70550,
                availableSeats: 45,
                date: "2024-12-20"
            },
            {
                airline: "Qatar Airways",
                flightNumber: "QR002",
                from: "New York (JFK)",
                to: "Dubai (DXB)",
                departureTime: "22:00",
                arrivalTime: "18:30",
                duration: "12h 30m",
                stops: "Non-stop",
                price: 99600,
                availableSeats: 30,
                date: "2024-12-21"
            },
            {
                airline: "Singapore Airlines",
                flightNumber: "SQ003",
                from: "Los Angeles (LAX)",
                to: "Singapore (SIN)",
                departureTime: "00:15",
                arrivalTime: "06:45",
                duration: "17h 30m",
                stops: "Non-stop",
                price: 124500,
                availableSeats: 25,
                date: "2024-12-22"
            },
            {
                airline: "Delta Air Lines",
                flightNumber: "DL004",
                from: "Atlanta (ATL)",
                to: "Paris (CDG)",
                departureTime: "17:30",
                arrivalTime: "07:45",
                duration: "8h 15m",
                stops: "Non-stop",
                price: 62250,
                availableSeats: 50,
                date: "2024-12-23"
            },
            {
                airline: "United Airlines",
                flightNumber: "UA005",
                from: "San Francisco (SFO)",
                to: "Tokyo (NRT)",
                departureTime: "11:30",
                arrivalTime: "15:00",
                duration: "11h 30m",
                stops: "Non-stop",
                price: 78850,
                availableSeats: 40,
                date: "2024-12-24"
            },
            {
                airline: "British Airways",
                flightNumber: "BA006",
                from: "New York (JFK)",
                to: "Madrid (MAD)",
                departureTime: "19:00",
                arrivalTime: "08:30",
                duration: "7h 30m",
                stops: "Non-stop",
                price: 58100,
                availableSeats: 55,
                date: "2024-12-25"
            },
            {
                airline: "Emirates",
                flightNumber: "EK007",
                from: "Dubai (DXB)",
                to: "Sydney (SYD)",
                departureTime: "10:00",
                arrivalTime: "08:00",
                duration: "14h 00m",
                stops: "Non-stop",
                price: 149400,
                availableSeats: 20,
                date: "2024-12-26"
            },
            {
                airline: "Air India",
                flightNumber: "AI008",
                from: "Delhi (DEL)",
                to: "Mumbai (BOM)",
                departureTime: "02:30",
                arrivalTime: "04:45",
                duration: "2h 15m",
                stops: "Non-stop",
                price: 8500,
                availableSeats: 60,
                date: "2024-12-27"
            }
        ];
        
        // Clear existing flights and add new ones
        await Flight.deleteMany({});
        await Flight.insertMany(sampleFlights);
        
        res.json({ 
            success: true, 
            message: "Flights seeded successfully",
            count: sampleFlights.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
