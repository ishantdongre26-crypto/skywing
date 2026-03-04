// Booking Page JavaScript

// Store selected flight data
let selectedFlight = null;

// Check if user is logged in on page load
async function checkSession() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById("userName").textContent = data.user.name;
            document.getElementById("passengerEmail").value = data.user.email;
            
            // Load selected flight data from sessionStorage
            loadSelectedFlight();
        } else {
            window.location.href = "login.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
        window.location.href = "login.html";
    }
}

// Load selected flight from sessionStorage
function loadSelectedFlight() {
    const flightData = sessionStorage.getItem('selectedFlight');
    
    if (!flightData) {
        alert("No flight selected. Please search for a flight first.");
        window.location.href = "flight-home.html";
        return;
    }
    
    selectedFlight = JSON.parse(flightData);
    displayFlightDetails();
    updateBookingSummary();
}

// Display flight details in the form
function displayFlightDetails() {
    const container = document.getElementById("flightDetails");
    
    if (!selectedFlight) {
        container.innerHTML = '<p class="text-muted">No flight selected</p>';
        return;
    }
    
    // Calculate taxes (approximately 15% of base fare)
    const basePrice = parseInt(selectedFlight.price);
    const taxes = Math.round(basePrice * 0.15);
    
    container.innerHTML = `
        <div class="flight-detail-card">
            <div class="flight-route-info">
                <div class="flight-cities">
                    ${selectedFlight.from} <i class="fas fa-arrow-right mx-2"></i> ${selectedFlight.to}
                </div>
                <div class="flight-route-line">
                    <span><i class="fas fa-plane me-1"></i> ${selectedFlight.airline}</span>
                    <span>•</span>
                    <span>${selectedFlight.flightNumber}</span>
                    <span>•</span>
                    <span>${selectedFlight.date}</span>
                </div>
                <div class="flight-route-line mt-2">
                    <span><i class="fas fa-clock me-1"></i> ${selectedFlight.departureTime} - ${selectedFlight.arrivalTime}</span>
                    <span>•</span>
                    <span>${selectedFlight.stops}</span>
                </div>
            </div>
            <div class="flight-duration">
                <div class="flight-duration-label">Duration</div>
                <div class="flight-duration-time">${selectedFlight.duration}</div>
            </div>
            <div class="flight-price-card">
                <div class="flight-airline">${selectedFlight.airline}</div>
                <div class="flight-price-amount">₹${basePrice.toLocaleString('en-IN')}</div>
                <div class="flight-price-note">per person</div>
            </div>
        </div>
    `;
    
    // Store prices for calculation
    selectedFlight.taxes = taxes;
    selectedFlight.total = basePrice + taxes;
}

// Update booking summary
function updateBookingSummary() {
    if (!selectedFlight) return;
    
    const basePrice = selectedFlight.price;
    const taxes = selectedFlight.taxes;
    const total = selectedFlight.total;
    
    document.getElementById("summaryFlight").textContent = `${selectedFlight.from} → ${selectedFlight.to}`;
    document.getElementById("summaryPassengers").textContent = "1 Adult";
    document.getElementById("summaryClass").textContent = "Economy";
    document.getElementById("summaryBaseFare").textContent = `₹${basePrice.toLocaleString('en-IN')}`;
    document.getElementById("summaryTaxes").textContent = `₹${taxes.toLocaleString('en-IN')}`;
    document.getElementById("summaryTotal").textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Confirm booking
async function confirmBooking() {
    // Validate passenger form
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("passengerEmail").value;
    const phone = document.getElementById("phone").value;
    const dob = document.getElementById("dob").value;
    const passport = document.getElementById("passport").value;
    
    if (!firstName || !lastName || !email || !phone || !dob || !passport) {
        alert("Please fill in all passenger details");
        return;
    }
    
    // Validate payment form
    const cardNumber = document.getElementById("cardNumber").value;
    const expiryDate = document.getElementById("expiryDate").value;
    const cvv = document.getElementById("cvv").value;
    const cardName = document.getElementById("cardName").value;
    
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
        alert("Please fill in all payment details");
        return;
    }
    
    // Generate booking reference
    const bookingRef = generateBookingRef();
    
    // Prepare booking data
    const bookingData = {
        bookingRef: bookingRef,
        flight: selectedFlight,
        passenger: { firstName, lastName, email, phone, dob, passport },
        totalAmount: selectedFlight.total
    };
    
    // Save to database
    try {
        await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(bookingData)
        });
    } catch (e) {
        console.error("Save error:", e);
    }
    
    // Show success modal
    document.getElementById("bookingRef").textContent = bookingRef;
    const modal = new bootstrap.Modal(document.getElementById("successModal"));
    modal.show();
    
    // Store booking success for chatbot
    sessionStorage.setItem('chatbotBookingSuccess', 'true');
}

// Generate random booking reference
function generateBookingRef() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'SKY-';
    for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

// Go to my bookings page
function goToHome() {
    sessionStorage.removeItem('selectedFlight');
    window.location.href = "my-bookings.html";
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
            sessionStorage.removeItem('selectedFlight');
            alert("Logout successful!");
            window.location.href = "login.html";
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// Format card number input
document.getElementById("cardNumber")?.addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = value;
});

// Format expiry date input
document.getElementById("expiryDate")?.addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    e.target.value = value;
});

// Run on page load
document.addEventListener('DOMContentLoaded', checkSession);
