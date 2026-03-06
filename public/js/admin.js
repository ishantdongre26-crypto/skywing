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
        loadAllBookings(),
        loadAllFeedback()
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
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    bookings.forEach(booking => {
        const flight = booking.flight || {};
        const route = flight.from && flight.to ? `${flight.from} → ${flight.to}` : 'N/A';
        const isCancelled = booking.status === 'Cancelled';
        
        html += `
            <tr>
                <td><strong>${booking.bookingRef}</strong></td>
                <td>${booking.userName || 'N/A'}</td>
                <td>${booking.userEmail || 'N/A'}</td>
                <td>${route}</td>
                <td>${flight.date || 'N/A'}</td>
                <td>₹${(booking.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td><span class="status-badge ${isCancelled ? 'status-cancelled' : 'status-confirmed'}">${booking.status || 'Confirmed'}</span></td>
                <td>
                    ${!isCancelled ? `
                    <button class="action-btn cancel" onclick="cancelBooking('${booking._id}', '${booking.bookingRef}')">
                        <i class="fas fa-times-circle"></i> Cancel
                    </button>
                    ` : '<span style="color: #6c757d;">-</span>'}
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('bookingsTable').innerHTML = html;
}

// Cancel a user's booking (Admin only)
async function cancelBooking(bookingId, bookingRef) {
    if (!confirm(`Are you sure you want to cancel booking ${bookingRef}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/cancel/${bookingId}`, {
            method: "PUT",
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Booking ${bookingRef} has been cancelled successfully!`);
            loadAllBookings(); // Reload bookings
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        console.error("Error cancelling booking:", err);
        alert("Error cancelling booking. Please try again.");
    }
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

// Load all feedback (admin endpoint)
async function loadAllFeedback() {
    try {
        const response = await fetch("/api/feedback/all", {
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update total feedback count
            document.getElementById('totalFeedback').textContent = data.feedback.length;
            
            // Render feedback table
            renderFeedbackTable(data.feedback);
        } else {
            document.getElementById('feedbackTable').innerHTML = `
                <div class="error-message">Error loading feedback: ${data.message}</div>
            `;
        }
    } catch (err) {
        console.error("Error loading feedback:", err);
        document.getElementById('feedbackTable').innerHTML = `
            <div class="error-message">Error loading feedback. Please try again.</div>
        `;
    }
}

// Render feedback table
function renderFeedbackTable(feedbackList) {
    if (!feedbackList || feedbackList.length === 0) {
        document.getElementById('feedbackTable').innerHTML = '<p>No feedback submitted yet.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Category</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    feedbackList.forEach(feedback => {
        const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        const date = new Date(feedback.createdAt).toLocaleDateString('en-IN');
        
        // Encode feedback object as JSON for passing to viewMessage
        const feedbackJson = encodeURIComponent(JSON.stringify(feedback));
        
        html += `
            <tr>
                <td>${feedback.userName}</td>
                <td>${feedback.userEmail}</td>
                <td><span style="color: #c9a227;">${stars}</span></td>
                <td><span class="status-badge status-pending">${feedback.category}</span></td>
                <td>${feedback.subject}</td>
                <td><button class="action-btn view" onclick="viewFeedback('${feedbackJson}')">View</button></td>
                <td>${date}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteFeedback('${feedback._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('feedbackTable').innerHTML = html;
}

// View full message in modal
let currentFeedbackId = null;

function viewFeedback(feedbackJson) {
    const feedback = JSON.parse(decodeURIComponent(feedbackJson));
    currentFeedbackId = feedback._id;
    const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
    const date = new Date(feedback.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const modalBody = document.getElementById('feedbackModalBody');
    modalBody.innerHTML = `
        <div class="feedback-detail-card" style="background: #f8fafc; border-radius: 15px; padding: 25px;">
            <div class="feedback-detail-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
                <div class="feedback-user-info" style="display: flex; gap: 15px;">
                    <div class="feedback-avatar" style="width: 50px; height: 50px; background: linear-gradient(135deg, #1e3a5f, #2d4a6f); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="feedback-user-details">
                        <h4 style="color: #1e3a5f; margin: 0 0 5px 0; font-size: 18px; font-weight: 700;">${feedback.userName}</h4>
                        <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 14px;">${feedback.userEmail}</p>
                        <span class="feedback-date" style="color: #6c757d; font-size: 12px;">${date}</span>
                    </div>
                </div>
                <div class="feedback-rating" style="text-align: right;">
                    <span class="stars" style="color: #c9a227; font-size: 20px;">${stars}</span>
                    <span class="rating-text" style="display: block; color: #1e3a5f; font-weight: 600; margin-top: 5px;">${feedback.rating}/5</span>
                </div>
            </div>
            <div class="feedback-detail-body">
                <div class="feedback-category" style="margin-bottom: 15px;">
                    <span class="category-label" style="color: #6c757d; font-weight: 600; margin-right: 10px;">Category:</span>
                    <span class="category-badge" style="background: linear-gradient(135deg, #1e3a5f, #2d4a6f); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${feedback.category}</span>
                </div>
                <div class="feedback-subject" style="margin-bottom: 15px;">
                    <h5 style="color: #1e3a5f; font-size: 20px; font-weight: 700; margin: 0;">${feedback.subject}</h5>
                </div>
                <div class="feedback-message" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <p style="color: #1a1a2e; margin: 0; line-height: 1.7;">${feedback.message}</p>
                </div>
            </div>
        </div>
    `;
    
    // Setup delete button
    const deleteBtn = document.getElementById('deleteFeedbackBtn');
    deleteBtn.onclick = function() {
        deleteFeedback(feedback._id);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    modal.show();
}

// Legacy function for backward compatibility
function viewMessage(message) {
    const feedback = { _id: '', message: message, userName: 'User', userEmail: 'email@example.com', rating: 5, category: 'general', subject: 'Message', createdAt: new Date() };
    viewFeedback(encodeURIComponent(JSON.stringify(feedback)));
}

// Delete feedback
async function deleteFeedback(feedbackId) {
    if (!confirm("Are you sure you want to delete this feedback?")) {
        return;
    }
    
    try {
        const response = await fetch(`/api/feedback/delete/${feedbackId}`, {
            method: "DELETE",
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close the modal first
            const modalEl = document.getElementById('feedbackModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
            }
            
            alert("Feedback deleted successfully!");
            loadAllFeedback(); // Reload feedback
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        console.error("Error deleting feedback:", err);
        alert("Error deleting feedback. Please try again.");
    }
}
