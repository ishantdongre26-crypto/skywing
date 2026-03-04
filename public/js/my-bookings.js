// My Bookings Page JavaScript

// Check if user is logged in on page load
async function checkSession() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById("userName").textContent = data.user.name;
            loadBookings();
        } else {
            window.location.href = "login.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
        window.location.href = "login.html";
    }
}

// Load user's bookings
async function loadBookings() {
    try {
        const response = await fetch("/api/bookings", { credentials: "include" });
        const data = await response.json();
        
        // Hide loading spinner
        document.getElementById("loadingSpinner").style.display = "none";
        
        if (data.success && data.bookings.length > 0) {
            displayBookings(data.bookings);
            updateTotalSummary(data.bookings);
        } else {
            showNoBookings();
        }
    } catch (err) {
        console.error("Failed to load bookings:", err);
        document.getElementById("loadingSpinner").style.display = "none";
        showNoBookings();
    }
}

// Display bookings in the list
function displayBookings(bookings) {
    const bookingsList = document.getElementById("bookingsList");
    
    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        bookingsList.innerHTML += bookingCard;
    });
}

// Create HTML for a booking card
function createBookingCard(booking) {
    const flight = booking.flight;
    const passenger = booking.passenger;
    const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const fullName = passenger.firstName + " " + passenger.lastName;
    
    return '<div class="booking-card">' +
        '<div class="booking-header">' +
        '<span class="booking-ref">' + booking.bookingRef + '</span>' +
        '<span class="booking-status status-confirmed">' + booking.status + '</span>' +
        '</div>' +
        '<div class="booking-body">' +
        '<div class="flight-route">' +
        '<i class="fas fa-plane me-2"></i>' +
        flight.from + ' <i class="fas fa-arrow-right mx-2 text-muted"></i> ' + flight.to +
        '</div>' +
        '<div class="flight-details-grid">' +
        '<div class="flight-detail-item"><span class="detail-label">Airline</span><span class="detail-value">' + flight.airline + '</span></div>' +
        '<div class="flight-detail-item"><span class="detail-label">Flight Number</span><span class="detail-value">' + flight.flightNumber + '</span></div>' +
        '<div class="flight-detail-item"><span class="detail-label">Date</span><span class="detail-value">' + flight.date + '</span></div>' +
        '<div class="flight-detail-item"><span class="detail-label">Departure</span><span class="detail-value">' + flight.departureTime + '</span></div>' +
        '<div class="flight-detail-item"><span class="detail-label">Arrival</span><span class="detail-value">' + flight.arrivalTime + '</span></div>' +
        '<div class="flight-detail-item"><span class="detail-label">Duration</span><span class="detail-value">' + flight.duration + '</span></div>' +
        '</div>' +
        '<div class="passenger-info">' +
        '<span class="detail-label">Passenger</span>' +
        '<span class="passenger-name">' + fullName + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="booking-footer">' +
        '<span class="booking-date"><i class="fas fa-calendar me-1"></i> Booked on ' + bookingDate + '</span>' +
        '<span class="total-amount">₹' + booking.totalAmount.toLocaleString('en-IN') + '</span>'
        '</div>' +
        '</div>';
}

// Update total bookings summary
function updateTotalSummary(bookings) {
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce(function(sum, booking) {
        return sum + booking.totalAmount;
    }, 0);
    
    document.getElementById("totalBookingsCount").textContent = totalBookings;
    document.getElementById("totalSpent").textContent = '₹' + totalSpent.toLocaleString('en-IN');
    document.getElementById("totalBookingsCard").style.display = "flex";
}

// Show no bookings message
function showNoBookings() {
    document.getElementById("noBookings").style.display = "block";
}

// Logout functionality
async function logout() {
    try {
        const response = await fetch("/api/users/logout", {
            method: "POST",
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert("Logout successful!");
            window.location.href = "login.html";
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkSession);
