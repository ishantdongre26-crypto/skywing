// Home Page JavaScript

// Check if user is logged in on page load
async function checkSession() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById("displayUserName").textContent = data.user.name;
            document.getElementById("userName").textContent = data.user.name;
            document.getElementById("userEmail").textContent = data.user.email;
            
            // Set member since to current date
            const today = new Date();
            document.getElementById("memberSince").textContent = today.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            // Load total booking value
            loadTotalBookingValue();
        } else {
            // Redirect to login if not authenticated
            window.location.href = "login.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
        window.location.href = "login.html";
    }
}

// Load total booking value for the user
async function loadTotalBookingValue() {
    try {
        const response = await fetch("/api/bookings/total-value", { credentials: "include" });
        const data = await response.json();
        
        if (data.success) {
            const formattedValue = data.totalValue.toLocaleString('en-US', {
                style: 'currency',
                currency: data.currency || 'USD'
            });
            document.getElementById("totalBookingValue").textContent = formattedValue;
        }
    } catch (err) {
        console.error("Failed to load total booking value:", err);
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

// Quick search handler - redirects to flight search page with params
function handleQuickSearch(e) {
    e.preventDefault();
    const from = document.getElementById("quickFrom").value;
    const to = document.getElementById("quickTo").value;
    const date = document.getElementById("quickDeparture").value;
    const passengers = document.getElementById("quickPassengers").value;
    
    // Store search params in sessionStorage for flight-home.html to use
    sessionStorage.setItem('flightSearch', JSON.stringify({
        from, to, date, passengers
    }));
    
    // Redirect to flight search page
    window.location.href = "flight-home.html";
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    checkLoginSuccess();
});

// Check for login success and show chatbot message
function checkLoginSuccess() {
    const loginSuccess = sessionStorage.getItem('chatbotLoginSuccess');
    const bookingSuccess = sessionStorage.getItem('chatbotBookingSuccess');
    const isNewUser = sessionStorage.getItem('chatbotNewUser');
    
    if (loginSuccess) {
        // Clear the flag
        sessionStorage.removeItem('chatbotLoginSuccess');
        
        // Show chatbot with login success message
        setTimeout(() => {
            const popup = document.getElementById('miniChatbotPopup');
            if (popup) {
                popup.classList.add('show');
                
                // Add the login success message
                const messagesContainer = document.getElementById('miniChatMessages');
                messagesContainer.innerHTML = ''; // Clear previous messages
                
                let messageContent = '';
                if (isNewUser) {
                    sessionStorage.removeItem('chatbotNewUser');
                    messageContent = `
                        🎉 <strong>Welcome to SkyWing!</strong> Your account has been created successfully. 
                        You can search for flights, browse deals, and manage your bookings. 
                        Need help getting started? Just ask!
                    `;
                } else {
                    messageContent = `
                        🎉 <strong>Welcome back!</strong> You're now logged in to SkyWing. 
                        You can search for flights, view your bookings, or check out our exclusive deals. 
                        How can I help you today?
                    `;
                }
                
                const botMsgHtml = `
                    <div class="mini-message bot">
                        <div class="mini-message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="mini-message-content">
                            ${messageContent}
                        </div>
                    </div>
                `;
                messagesContainer.insertAdjacentHTML('beforeend', botMsgHtml);
            }
        }, 500);
    } else if (bookingSuccess) {
        // Clear the flag
        sessionStorage.removeItem('chatbotBookingSuccess');
        
        // Show chatbot with booking success message
        setTimeout(() => {
            const popup = document.getElementById('miniChatbotPopup');
            if (popup) {
                popup.classList.add('show');
                
                const messagesContainer = document.getElementById('miniChatMessages');
                messagesContainer.innerHTML = '';
                
                const botMsgHtml = `
                    <div class="mini-message bot">
                        <div class="mini-message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="mini-message-content">
                            🎉 <strong>Congratulations!</strong> Your flight has been booked successfully! 
                            You will receive a confirmation email shortly. 
                            You can view your booking details in 'My Bookings'. 
                            Have a wonderful trip! ✈️
                        </div>
                    </div>
                `;
                messagesContainer.insertAdjacentHTML('beforeend', botMsgHtml);
            }
        }, 500);
    }
}
