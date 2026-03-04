/* Chatbot JavaScript for SkyWing Help & Support */

// Chatbot knowledge base - easy to understand answers
const chatbotKnowledge = {
    greeting: {
        response: "Hello! I'm SkyWing Assistant, here to help you understand how to use our website. What would you like to know?",
        quickReplies: ["How to book a flight", "How to view my bookings", "What deals are available"]
    },
    "how to book": {
        response: "Booking a flight is easy! Here's how:",
        steps: [
            "Go to <strong>Search Flights</strong> from the menu",
            "Enter your <strong>departure city</strong> and <strong>destination</strong>",
            "Select your <strong>travel date</strong> and <strong>number of passengers</strong>",
            "Browse available flights and select one you like",
            "Fill in passenger details and <strong>complete payment</strong>",
            "You'll receive a <strong>confirmation email</strong> with your booking details!"
        ],
        quickReplies: ["How to search flights", "How to pay", "Where is my booking"]
    },
    "search flights": {
        response: "To search for flights:",
        steps: [
            "Click on <strong>Search Flights</strong> in the navigation menu",
            "Enter your <strong>From</strong> (departure city) and <strong>To</strong> (destination)",
            "Choose your <strong>departure date</strong>",
            "Select the <strong>number of passengers</strong>",
            "Click <strong>Search</strong> to see available flights"
        ],
        quickReplies: ["Can I search round trip", "How to select dates", "Book a flight"]
    },
    "my bookings": {
        response: "To view your bookings:",
        steps: [
            "Click on <strong>My Bookings</strong> in the main menu",
            "You'll see a list of all your flight reservations",
            "Each booking shows flight details, date, and status",
            "You can <strong>view details</strong> or <strong>cancel</strong> if needed"
        ],
        quickReplies: ["How to cancel booking", "Where is my ticket", "Change my booking"]
    },
    "deals": {
        response: "To find the best deals:",
        steps: [
            "Click on <strong>Deals</strong> in the navigation menu",
            "Browse our <strong>Hot Deals</strong> - limited time offers with big discounts",
            "Check <strong>Weekend Getaways</strong> for quick trips",
            "Explore <strong>International Escapes</strong> for overseas travel",
            "Click <strong>Book Now</strong> on any deal to reserve!"
        ],
        quickReplies: ["What deals available", "How long are deals valid", "Best time to book"]
    },
    "cancel booking": {
        response: "To cancel a booking:",
        steps: [
            "Go to <strong>My Bookings</strong> page",
            "Find the booking you want to cancel",
            "Click on the booking to view details",
            "Look for <strong>Cancel</strong> button",
            "Confirm your cancellation"
        ],
        note: "Refund policies vary. Check our terms for details.",
        quickReplies: ["How do I get refund", "Cancel policy", "Modify booking"]
    },
    "payment": {
        response: "We accept various payment methods:",
        methods: [
            "<strong>Credit/Debit Cards</strong> - Visa, MasterCard, American Express",
            "<strong>PayPal</strong> - Fast and secure online payment",
            "<strong>Bank Transfer</strong> - For larger bookings"
        ],
        note: "All payments are secure and encrypted.",
        quickReplies: ["Is payment secure", "Can I pay later", "Payment failed"]
    },
    "account": {
        response: "Managing your account:",
        steps: [
            "Click on your <strong>name</strong> in the top right",
            "View your <strong>profile information</strong>",
            "See your <strong>member since</strong> date",
            "Check your <strong>total bookings</strong> and <strong>total spending</strong>"
        ],
        quickReplies: ["How to update profile", "Change password", "Delete account"]
    },
    "baggage": {
        response: "Baggage information:",
        steps: [
            "Most flights include <strong>1 carry-on bag</strong> (free)",
            "Checked baggage <strong>varies by airline</strong>",
            "Check the <strong>flight details</strong> before booking",
            "Some deals include <strong>free baggage</strong>!"
        ],
        quickReplies: ["Baggage allowance", "Extra baggage cost", "Size limits"]
    },
    "contact": {
        response: "Need more help? Contact us:",
        methods: [
            "<strong>Email:</strong> support@skywing.com",
            "<strong>Phone:</strong> 1-800-SKY-WING (24/7)",
            "<strong>Live Chat:</strong> Available on the website"
        ],
        note: "We're here to help 24/7!",
        quickReplies: ["Operating hours", "Call back request", "Email support"]
    },
    "default": {
        response: "I'm here to help! You can ask me about:",
        topics: [
            "🔍 <strong>How to search and book flights</strong>",
            "📋 <strong>How to view or cancel bookings</strong>",
            "🏷️ <strong>Deals and special offers</strong>",
            "💳 <strong>Payment methods</strong>",
            "💼 <strong>Baggage information</strong>",
            "👤 <strong>Account help</strong>"
        ],
        quickReplies: ["Help me book", "View my bookings", "Find deals"]
    }
};

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Check session
    checkSession();
    
    // Initialize chat
    initChat();
    
    // Set up quick topic buttons
    setupQuickTopics();
    
    // Set up enter key to send message
    setupInputHandler();
});

// Check if user is logged in
async function checkSession() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById("displayUserName").textContent = data.user.name;
        } else {
            window.location.href = "login.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
        window.location.href = "login.html";
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch("/api/users/logout", {
            method: "POST",
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = "login.html";
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// Initialize chat with welcome message
function initChat() {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Add welcome message
    const welcomeHtml = `
        <div class="welcome-card">
            <h4>👋 Welcome to SkyWing Help!</h4>
            <p>I'm here to help you understand how to use our website. Ask me anything!</p>
        </div>
    `;
    
    addBotMessage(welcomeHtml);
    addBotMessage(chatbotKnowledge.greeting.response, chatbotKnowledge.greeting.quickReplies);
}

// Add bot message to chat
function addBotMessage(text, quickReplies = null) {
    const messagesContainer = document.getElementById('chatMessages');
    
    let html = `
        <div class="message bot">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                ${text}
    `;
    
    if (quickReplies && quickReplies.length > 0) {
        html += `<div class="quick-replies">`;
        quickReplies.forEach(reply => {
            html += `<button class="quick-reply-btn" onclick="sendMessage('${reply}')">${reply}</button>`;
        });
        html += `</div>`;
    }
    
    html += `</div></div>`;
    
    messagesContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

// Add user message to chat
function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const html = `
        <div class="message user">
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                ${text}
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

// Send message
function sendMessage(text) {
    if (!text.trim()) return;
    
    // Add user message
    addUserMessage(text);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get response after delay
    setTimeout(() => {
        removeTypingIndicator();
        const response = getResponse(text);
        addBotMessage(response.text, response.quickReplies);
    }, 1000);
}

// Get chatbot response
function getResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for success messages first
    if (matchKeywords(message, ['login successful', 'logged in', 'login success', 'successfully logged'])) {
        return {
            text: "🎉 Welcome back! You're now logged in to SkyWing. You can search for flights, view your bookings, or check out our exclusive deals. How can I help you today?",
            quickReplies: ["Search flights", "View bookings", "Find deals"]
        };
    }
    
    if (matchKeywords(message, ['flight booked', 'booked successfully', 'booking confirmed', 'booking success', 'booking complete'])) {
        return {
            text: "🎉 Congratulations! Your flight has been booked successfully! You will receive a confirmation email shortly with all the details. You can view your booking anytime in 'My Bookings'. Have a wonderful trip! ✈️",
            quickReplies: ["View my booking", "Find more deals", "Home"]
        };
    }
    
    if (matchKeywords(message, ['cancel successful', 'cancelled successfully', 'booking cancelled', 'cancellation complete'])) {
        return {
            text: "✅ Your booking has been cancelled successfully! The refund process will depend on the booking terms. If you have any questions about refunds, please check our cancellation policy or contact our support team.",
            quickReplies: ["View bookings", "Book new flight", "Contact support"]
        };
    }
    
    // Check for keywords
    if (matchKeywords(message, ['hello', 'hi', 'hey', 'greetings'])) {
        return {
            text: chatbotKnowledge.greeting.response,
            quickReplies: chatbotKnowledge.greeting.quickReplies
        };
    }
    
    if (matchKeywords(message, ['book', 'booking', 'buy', 'purchase', 'reserve'])) {
        return {
            text: formatResponse(chatbotKnowledge["how to book"]),
            quickReplies: chatbotKnowledge["how to book"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['search', 'find', 'look'])) {
        return {
            text: formatResponse(chatbotKnowledge["search flights"]),
            quickReplies: chatbotKnowledge["search flights"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['my booking', 'view booking', 'my reservation', 'ticket'])) {
        return {
            text: formatResponse(chatbotKnowledge["my bookings"]),
            quickReplies: chatbotKnowledge["my bookings"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['deal', 'offer', 'discount', 'cheap', 'price', 'cost'])) {
        return {
            text: formatResponse(chatbotKnowledge["deals"]),
            quickReplies: chatbotKnowledge["deals"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['cancel', 'refund', 'money back'])) {
        return {
            text: formatResponse(chatbotKnowledge["cancel booking"]),
            quickReplies: chatbotKnowledge["cancel booking"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['pay', 'payment', 'card', 'credit'])) {
        return {
            text: formatResponse(chatbotKnowledge["payment"]),
            quickReplies: chatbotKnowledge["payment"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['account', 'profile', 'user', 'password'])) {
        return {
            text: formatResponse(chatbotKnowledge["account"]),
            quickReplies: chatbotKnowledge["account"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['baggage', 'bag', 'luggage', 'carry on'])) {
        return {
            text: formatResponse(chatbotKnowledge["baggage"]),
            quickReplies: chatbotKnowledge["baggage"].quickReplies
        };
    }
    
    if (matchKeywords(message, ['contact', 'phone', 'email', 'help', 'support'])) {
        return {
            text: formatResponse(chatbotKnowledge["contact"]),
            quickReplies: chatbotKnowledge["contact"].quickReplies
        };
    }
    
    // Default response
    return {
        text: formatResponse(chatbotKnowledge["default"]),
        quickReplies: chatbotKnowledge["default"].quickReplies
    };
}

// Match keywords in message
function matchKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
}

// Format response with steps
function formatResponse(knowledge) {
    let response = knowledge.response;
    
    if (knowledge.steps) {
        response += '<ul>';
        knowledge.steps.forEach(step => {
            response += `<li>${step}</li>`;
        });
        response += '</ul>';
    }
    
    if (knowledge.methods) {
        response += '<ul>';
        knowledge.methods.forEach(method => {
            response += `<li>${method}</li>`;
        });
        response += '</ul>';
    }
    
    if (knowledge.topics) {
        response += '<ul>';
        knowledge.topics.forEach(topic => {
            response += `<li>${topic}</li>`;
        });
        response += '</ul>';
    }
    
    if (knowledge.note) {
        response += `<p><em>💡 ${knowledge.note}</em></p>`;
    }
    
    return response;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    
    const html = `
        <div class="message bot" id="typingIndicator">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Set up quick topic buttons
function setupQuickTopics() {
    const topics = [
        { text: "How to Book a Flight", icon: "fa-plane" },
        { text: "Search Flights", icon: "fa-search" },
        { text: "View My Bookings", icon: "fa-ticket-alt" },
        { text: "Find Deals", icon: "fa-tags" },
        { text: "Cancel Booking", icon: "fa-times-circle" },
        { text: "Payment Methods", icon: "fa-credit-card" },
        { text: "Baggage Info", icon: "fa-suitcase" },
        { text: "Contact Support", icon: "fa-headset" }
    ];
    
    const container = document.getElementById('quickTopics');
    
    topics.forEach(topic => {
        const btn = document.createElement('button');
        btn.className = 'topic-btn';
        btn.innerHTML = `<i class="fas ${topic.icon}"></i> ${topic.text}`;
        btn.onclick = () => sendMessage(topic.text);
        container.appendChild(btn);
    });
}

// Set up enter key handler
function setupInputHandler() {
    const input = document.getElementById('chatInput');
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = input.value.trim();
            if (message) {
                sendMessage(message);
                input.value = '';
            }
        }
    });
}

// Send button handler
function handleSend() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        sendMessage(message);
        input.value = '';
    }
}
