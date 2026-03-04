// Admin Dashboard JavaScript

// Check if user is logged in and is admin on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadDashboardData();
});

// Check authentication and admin role
async function checkAuth() {
    try {
        const response = await fetch("/api/users/session", {
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = "login.html";
            return;
        }
        
        // Check if user is admin
        if (!data.user || data.user.role !== 'admin') {
            alert("Access denied. Admin privileges required.");
            window.location.href = "home.html";
            return;
        }
        
        // Display admin name
        document.getElementById('adminName').textContent = `👤 ${data.user.name}`;
        
    } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = "login.html";
    }
}

// Load all dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadUsers(),
        loadAllFlights(),
        loadAllBookings()
    ]);
}

// Load all users (admin endpoint)
async function loadUsers() {
    try {
        const response = await fetch("/api/users", {
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update total users count
            document.getElementById('totalUsers').textContent = data.length;
            
            // Render users table
            renderUsersTable(data);
        } else {
            document.getElementById('usersTable').innerHTML = `
                <div class="error-message">Error loading users: ${data.error}</div>
            `;
        }
    } catch (err) {
        console.error("Error loading users:", err);
        document.getElementById('usersTable').innerHTML = `
            <div class="error-message">Error loading users. Please try again.</div>
        `;
    }
}

// Render users table
function renderUsersTable(users) {
    if (users.length === 0) {
        document.getElementById('usersTable').innerHTML = '<p>No users found.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Bookings</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.role === 'admin' ? 'status-confirmed' : ''}">${user.role}</span></td>
                <td>${user.bookings ? user.bookings.length : 0}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('usersTable').innerHTML = html;
}

// Load all flights (admin endpoint)
async function loadAllFlights() {
    try {
        const response = await fetch("/api/flights/all", {
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update total flights count
            document.getElementById('totalFlights').textContent = data.flights.length;
            
            // Render flights table
            renderFlightsTable(data.flights);
        } else {
            document.getElementById('flightsTable').innerHTML = `
                <div class="error-message">Error loading flights: ${data.error}</div>
            `;
        }
    } catch (err) {
        console.error("Error loading flights:", err);
        document.getElementById('flightsTable').innerHTML = `
            <div class="error-message">Error loading flights. Please try again.</div>
        `;
    }
}

// Render flights table
function renderFlightsTable(flights) {
    if (!flights || flights.length === 0) {
        document.getElementById('flightsTable').innerHTML = '<p>No flights available. Click "Add Sample Flights" to add some flights.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Flight</th>
                    <th>Airline</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Stops</th>
                    <th>Price</th>
                    <th>Seats</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    flights.forEach(flight => {
        const route = flight.from && flight.to ? `${flight.from} → ${flight.to}` : 'N/A';
        const time = flight.departureTime && flight.arrivalTime ? `${flight.departureTime} - ${flight.arrivalTime}` : 'N/A';
        
        html += `
            <tr>
                <td><strong>${flight.flightNumber}</strong></td>
                <td>${flight.airline}</td>
                <td>${route}</td>
                <td>${flight.date}</td>
                <td>${time}</td>
                <td>${flight.duration}</td>
                <td>${flight.stops}</td>
                <td>₹${flight.price.toLocaleString('en-IN')}</td>
                <td>${flight.availableSeats}</td>
                <td><span class="status-badge ${flight.status === 'Active' ? 'status-confirmed' : ''}">${flight.status}</span></td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('flightsTable').innerHTML = html;
}

// Seed sample flights (admin endpoint)
async function seedFlights() {
    try {
        const response = await fetch("/api/flights/seed", {
            method: "POST",
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`${data.count} sample flights added successfully!`);
            await loadAllFlights(); // Reload flights
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (err) {
        console.error("Error seeding flights:", err);
        alert("Error seeding flights. Please try again.");
    }
}

// Load all bookings from all users (admin endpoint)
async function loadAllBookings() {
    try {
        const response = await fetch("/api/bookings/all", {
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update total bookings count
            document.getElementById('totalBookings').textContent = data.totalBookings;
            
            // Calculate total revenue
            const totalRevenue = data.bookings.reduce((sum, booking) => {
                return sum + (booking.totalAmount || 0);
            }, 0);
            document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
            
            // Render bookings table
            renderBookingsTable(data.bookings);
        } else {
            document.getElementById('bookingsTable').innerHTML = `
                <div class="error-message">Error loading bookings: ${data.error}</div>
            `;
        }
    } catch (err) {
        console.error("Error loading bookings:", err);
        document.getElementById('bookingsTable').innerHTML = `
            <div class="error-message">Error loading bookings. Please try again.</div>
        `;
    }
}

// Render bookings table
function renderBookingsTable(bookings) {
    if (bookings.length === 0) {
        document.getElementById('bookingsTable').innerHTML = '<p>No bookings found.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Booking Ref</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    bookings.forEach(booking => {
        const flight = booking.flight || {};
        const route = flight.from && flight.to ? `${flight.from} → ${flight.to}` : 'N/A';
        
        html += `
            <tr>
                <td><strong>${booking.bookingRef}</strong></td>
                <td>${booking.userName || 'N/A'}</td>
                <td>${booking.userEmail || 'N/A'}</td>
                <td>${route}</td>
                <td>${flight.date || 'N/A'}</td>
                <td>₹${(booking.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td><span class="status-badge status-confirmed">${booking.status || 'Confirmed'}</span></td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('bookingsTable').innerHTML = html;
}

// Logout function
async function logout() {
    try {
        await fetch("/api/users/logout", {
            method: "POST",
            credentials: "include"
        });
        
        sessionStorage.clear();
        window.location.href = "login.html";
    } catch (err) {
        console.error("Logout error:", err);
        window.location.href = "login.html";
    }
}
