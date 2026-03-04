/* Mini Chatbot JavaScript for Home Page */

// Mini chatbot knowledge base (same as main chatbot)
const miniChatbotKnowledge = {
    greeting: {
        response: "Hello! I'm SkyWing Assistant. How can I help you today?",
        quickReplies: ["Book a flight", "View bookings", "Find deals"]
    },
    "how to book": {
        response: "To book a flight: Go to Search Flights → Enter your travel details → Select a flight → Complete payment → Get confirmation!",
        quickReplies: ["Search flights", "View my bookings"]
    },
    "search flights": {
        response: "Click on 'Search Flights' in the menu, enter your departure city, destination, date, and number of passengers, then click Search!",
        quickReplies: ["Book now", "View deals"]
    },
    "my bookings": {
        response: "Go to 'My Bookings' to see all your flight reservations. You can view details or cancel bookings from there.",
        quickReplies: ["Search flights", "Home"]
    },
    "deals": {
        response: "Check our 'Deals' page for exclusive discounts on flights! We have Hot Deals, Weekend Getaways, and International Escapes.",
        quickReplies: ["Book a deal", "Search flights"]
    },
    "cancel booking": {
        response: "To cancel a booking: Go to My Bookings → Find your booking → Click Cancel → Confirm cancellation. Refund policies vary by booking.",
        quickReplies: ["View bookings", "Contact support"]
    },
    "payment": {
        response: "We accept Credit/Debit Cards, PayPal, and Bank Transfers. All payments are secure and encrypted!",
        quickReplies: ["Book flight", "More help"]
    },
    "default": {
        response: "I can help you with: booking flights, viewing bookings, finding deals, payment info, and more! What would you like to know?",
        quickReplies: ["Book flight", "View bookings", "Find deals"]
    }
};

// Toggle mini chatbot popup
function toggleMiniChatbot() {
    const popup = document.getElementById('miniChatbotPopup');
    popup.classList.toggle('show');
}

// Close mini chatbot
function closeMiniChatbot() {
    const popup = document.getElementById('miniChatbotPopup');
    popup.classList.remove('show');
}

// Send message in mini chatbot
function sendMiniMessage(text) {
    if (!text.trim()) return;
    
    const messagesContainer = document.getElementById('miniChatMessages');
    
    // Add user message
    const userMsgHtml = `
        <div class="mini-message user">
            <div class="mini-message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="mini-message-content">
                ${text}
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', userMsgHtml);
    
    // Show typing indicator
    showMiniTyping();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Get response after delay
    setTimeout(() => {
        removeMiniTyping();
        const response = getMiniResponse(text);
        addMiniBotMessage(response.response, response.quickReplies);
    }, 1000);
}

// Add bot message to mini chatbot
function addMiniBotMessage(text, quickReplies) {
    const messagesContainer = document.getElementById('miniChatMessages');
    
    let html = `
        <div class="mini-message bot">
            <div class="mini-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="mini-message-content">
                ${text}
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', html);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get chatbot response
function getMiniResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for success messages first
    if (message.includes('login successful') || message.includes('logged in') || message.includes('login success')) {
        return {
            response: "🎉 Welcome back! You're now logged in. You can search for flights, view your bookings, or check out our deals. How can I help you today?",
            quickReplies: ["Search flights", "View bookings", "Find deals"]
        };
    }
    
    if (message.includes('flight booked') || message.includes('booked successfully') || message.includes('booking confirmed') || message.includes('booking success')) {
        return {
            response: "🎉 Congratulations! Your flight has been booked successfully! You will receive a confirmation email shortly. You can view your booking details in 'My Bookings'. Have a great trip!",
            quickReplies: ["View my booking", "Find more deals", "Home"]
        };
    }
    
    if (message.includes('cancel successful') || message.includes('cancelled successfully') || message.includes('booking cancelled')) {
        return {
            response: "✅ Your booking has been cancelled successfully! If you have any questions about refunds, please check our cancellation policy or contact support.",
            quickReplies: ["View bookings", "Book new flight", "Contact support"]
        };
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return miniChatbotKnowledge.greeting;
    }
    
    if (message.includes('book') || message.includes('buy') || message.includes('purchase')) {
        return miniChatbotKnowledge["how to book"];
    }
    
    if (message.includes('search') || message.includes('find') || message.includes('look')) {
        return miniChatbotKnowledge["search flights"];
    }
    
    if (message.includes('booking') || message.includes('reservation') || message.includes('ticket')) {
        return miniChatbotKnowledge["my bookings"];
    }
    
    if (message.includes('deal') || message.includes('offer') || message.includes('discount') || message.includes('cheap')) {
        return miniChatbotKnowledge["deals"];
    }
    
    if (message.includes('cancel') || message.includes('refund')) {
        return miniChatbotKnowledge["cancel booking"];
    }
    
    if (message.includes('pay') || message.includes('card') || message.includes('credit')) {
        return miniChatbotKnowledge["payment"];
    }
    
    return miniChatbotKnowledge["default"];
}

// Show typing indicator
function showMiniTyping() {
    const messagesContainer = document.getElementById('miniChatMessages');
    
    const html = `
        <div class="mini-message bot" id="miniTypingIndicator">
            <div class="mini-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="mini-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', html);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeMiniTyping() {
    const indicator = document.getElementById('miniTypingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle send button click
function handleMiniSend() {
    const input = document.getElementById('miniChatInput');
    const message = input.value.trim();
    
    if (message) {
        sendMiniMessage(message);
        input.value = '';
    }
}

// Initialize mini chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up enter key handler
    const input = document.getElementById('miniChatInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleMiniSend();
            }
        });
    }
    
    // Add welcome message if popup is opened for first time
    const popup = document.getElementById('miniChatbotPopup');
    if (popup && !popup.dataset.initialized) {
        popup.dataset.initialized = 'true';
    }
});
