// Flight Home Page JavaScript

// Mock flight data
const airlines = [
    { name: 'Emirates', code: 'EK' },
    { name: 'Qatar Airways', code: 'QR' },
    { name: 'Singapore Airlines', code: 'SQ' },
    { name: 'Delta Air Lines', code: 'DL' },
    { name: 'United Airlines', code: 'UA' },
    { name: 'British Airways', code: 'BA' }
];

// Check if user is logged in on page load
async function checkSession() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById("userName").textContent = `Welcome, ${data.user.name}!`;
            
            // Check for saved search params from home page
            const savedSearch = sessionStorage.getItem('flightSearch');
            if (savedSearch) {
                const searchParams = JSON.parse(savedSearch);
                document.getElementById("fromCity").value = searchParams.from;
                document.getElementById("toCity").value = searchParams.to;
                document.getElementById("departureDate").value = searchParams.date;
                document.getElementById("adults").value = searchParams.passengers;
                sessionStorage.removeItem('flightSearch');
            }
        } else {
            window.location.href = "login.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
        window.location.href = "login.html";
    }
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

// Search flights function
function searchFlights() {
    const from = document.getElementById("fromCity").value;
    const to = document.getElementById("toCity").value;
    const departure = document.getElementById("departureDate").value;
    
    if (!from || !to || !departure) {
        alert("Please fill in all required fields");
        return;
    }

    // Show loading spinner
    document.getElementById("loadingSpinner").classList.add("active");
    document.getElementById("searchResults").classList.remove("active");

    // Simulate search delay
    setTimeout(() => {
        displayResults(from, to, departure);
    }, 1500);
}

// Display search results
function displayResults(from, to, date) {
    // Hide loading spinner
    document.getElementById("loadingSpinner").classList.remove("active");
    
    // Generate mock flight results
    const results = generateMockFlights(from, to, date);
    
    const container = document.getElementById("resultsContainer");
    const resultsSection = document.getElementById("searchResults");
    const resultsCount = document.getElementById("resultsCount");
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h4>No flights found</h4>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
    } else {
        resultsCount.textContent = `${results.length} flights found`;
        
        container.innerHTML = results.map((flight, index) => `
            <div class="flight-result-card">
                <div class="flight-route">
                    <div class="route-point">
                        <div class="route-time">${flight.departureTime}</div>
                        <div class="route-city">${flight.from}</div>
                    </div>
                    <div class="route-line">
                        <div class="line"></div>
                    </div>
                    <div class="route-duration">
                        <div class="duration">${flight.duration}</div>
                        <div class="stops">${flight.stops}</div>
                    </div>
                    <div class="route-line">
                        <div class="line"></div>
                    </div>
                    <div class="route-point">
                        <div class="route-time">${flight.arrivalTime}</div>
                        <div class="route-city">${flight.to}</div>
                    </div>
                </div>
                <div class="flight-details">
                    <div class="flight-airline">
                        <div class="airline-icon">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="airline-info">
                            <strong>${flight.airline}</strong><br>
                            ${flight.flightNumber}
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price-amount">₹${flight.price.toLocaleString('en-IN')}</div>
                        <div class="price-per">per person</div>
                        <button class="book-btn" onclick="bookFlight(${index})">
                            <i class="fas fa-ticket-alt me-1"></i> Book Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    resultsSection.classList.add("active");
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Generate mock flight data
function generateMockFlights(from, to, date) {
    const flights = [];
    const times = ['06:00', '08:30', '11:00', '14:30', '17:00', '20:00'];
    const durations = ['2h 30m', '3h 15m', '4h 00m', '5h 30m', '6h 45m'];
    const stopsOptions = ['Non-stop', '1 Stop', '2 Stops'];
    
    for (let i = 0; i < 5; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const basePrice = Math.floor(Math.random() * 500) + 200;
        
        flights.push({
            from: from,
            to: to,
            date: date,
            departureTime: times[Math.floor(Math.random() * times.length)],
            arrivalTime: times[Math.floor(Math.random() * times.length)],
            duration: durations[Math.floor(Math.random() * durations.length)],
            stops: stopsOptions[Math.floor(Math.random() * stopsOptions.length)],
            airline: airline.name,
            flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
            price: basePrice + (i * 50)
        });
    }
    
    return flights.sort((a, b) => a.price - b.price);
}

// Quick search from destination cards
function quickSearch(from, to) {
    document.getElementById("fromCity").value = from;
    document.getElementById("toCity").value = to;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("departureDate").value = tomorrow.toISOString().split('T')[0];
    
    // Scroll to search form
    document.querySelector(".flight-search-form").scrollIntoView({ behavior: 'smooth' });
}

// Book flight function
function bookFlight(index) {
    // Get the results from the generated flights
    const results = generateMockFlights(
        document.getElementById("fromCity").value,
        document.getElementById("toCity").value,
        document.getElementById("departureDate").value
    );
    
    const selectedFlight = results[index];
    
    // Store selected flight in sessionStorage
    sessionStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
    
    // Redirect to booking page
    window.location.href = "booking.html";
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkSession);
