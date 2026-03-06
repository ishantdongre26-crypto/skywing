// Feedback Forum JavaScript

let allFeedback = [];
let isLoggedIn = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadPublicFeedback();
    setupStarRating();
    setupCharCounters();
});

// Check if user is logged in
async function checkSession() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated) {
            isLoggedIn = true;
            document.getElementById("displayUserName").textContent = data.user.name;
            document.getElementById("userNav").style.display = "flex";
        } else {
            isLoggedIn = false;
            document.getElementById("userNav").innerHTML = `
                <a href="login.html" class="login-link me-3">
                    <i class="fas fa-sign-in-alt me-1"></i> Login
                </a>
                <a href="index.html" class="register-link">
                    <i class="fas fa-user-plus me-1"></i> Register
                </a>
            `;
        }
    } catch (err) {
        console.error("Session check failed:", err);
        isLoggedIn = false;
    }
}

// Load public feedback
async function loadPublicFeedback() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const feedbackForum = document.getElementById('feedbackForum');
    const noFeedback = document.getElementById('noFeedback');
    
    loadingSpinner.style.display = 'block';
    feedbackForum.innerHTML = '';
    noFeedback.style.display = 'none';
    
    try {
        const response = await fetch("/api/feedback/public/all");
        const data = await response.json();
        
        loadingSpinner.style.display = 'none';
        
        if (data.success && data.feedback.length > 0) {
            allFeedback = data.feedback;
            renderFeedback(data.feedback);
            updateStats(data.feedback);
        } else {
            noFeedback.style.display = 'block';
            updateStats([]);
        }
    } catch (err) {
        console.error("Error loading feedback:", err);
        loadingSpinner.style.display = 'none';
        noFeedback.style.display = 'block';
    }
}

// Render feedback cards
function renderFeedback(feedbackList) {
    const feedbackForum = document.getElementById('feedbackForum');
    feedbackForum.innerHTML = '';
    
    feedbackList.forEach(feedback => {
        const card = document.createElement('div');
        card.className = 'feedback-card';
        
        const date = new Date(feedback.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const categoryLabel = getCategoryLabel(feedback.category);
        
        // Generate stars
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= feedback.rating) {
                starsHtml += '<i class="fas fa-star filled"></i>';
            } else {
                starsHtml += '<i class="far fa-star empty"></i>';
            }
        }
        
        // Admin response if exists
        let adminResponseHtml = '';
        if (feedback.adminResponse) {
            adminResponseHtml = `
                <div class="admin-response">
                    <div class="admin-response-header">
                        <i class="fas fa-user-shield"></i>
                        <span>SkyWing Response</span>
                    </div>
                    <p>${feedback.adminResponse}</p>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="feedback-card-header">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4>${feedback.userName}</h4>
                        <span class="date">${date}</span>
                    </div>
                </div>
                <div class="rating-display">
                    ${starsHtml}
                </div>
            </div>
            <span class="feedback-category">${categoryLabel}</span>
            <h3 class="feedback-subject">${feedback.subject}</h3>
            <p class="feedback-message">${feedback.message}</p>
            ${adminResponseHtml}
        `;
        
        feedbackForum.appendChild(card);
    });
}

// Update statistics
function updateStats(feedbackList) {
    document.getElementById('totalFeedback').textContent = feedbackList.length;
    
    if (feedbackList.length > 0) {
        // Calculate average rating
        const totalRating = feedbackList.reduce((sum, f) => sum + f.rating, 0);
        const avgRating = (totalRating / feedbackList.length).toFixed(1);
        document.getElementById('avgRating').textContent = avgRating;
        
        // Count 5-star reviews
        const fiveStarCount = feedbackList.filter(f => f.rating === 5).length;
        document.getElementById('fiveStarCount').textContent = fiveStarCount;
    } else {
        document.getElementById('avgRating').textContent = '0.0';
        document.getElementById('fiveStarCount').textContent = '0';
    }
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'general': 'General',
        'booking': 'Booking Experience',
        'website': 'Website',
        'support': 'Customer Support',
        'other': 'Other'
    };
    return labels[category] || category;
}

// Filter feedback
function filterFeedback() {
    const ratingFilter = document.getElementById('ratingFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = [...allFeedback];
    
    if (ratingFilter !== 'all') {
        filtered = filtered.filter(f => f.rating === parseInt(ratingFilter));
    }
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(f => f.category === categoryFilter);
    }
    
    if (filtered.length > 0) {
        document.getElementById('feedbackForum').style.display = 'block';
        document.getElementById('noFeedback').style.display = 'none';
        renderFeedback(filtered);
    } else {
        document.getElementById('feedbackForum').style.display = 'none';
        document.getElementById('noFeedback').style.display = 'block';
    }
}

// Clear filters
function clearFilters() {
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    renderFeedback(allFeedback);
    document.getElementById('feedbackForum').style.display = 'block';
    document.getElementById('noFeedback').style.display = 'none';
}

// Open feedback modal
function openFeedbackModal() {
    if (!isLoggedIn) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }
    
    const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    feedbackModal.show();
}

// Setup star rating input
function setupStarRating() {
    const stars = document.querySelectorAll('#starRatingInput i');
    const ratingInput = document.getElementById('rating');
    const ratingText = document.getElementById('ratingText');
    
    const ratingMessages = {
        1: 'Poor - Very disappointed',
        2: 'Fair - Below expectations',
        3: 'Good - Met expectations',
        4: 'Very Good - Exceeded expectations',
        5: 'Excellent - Highly recommend!'
    };
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingInput.value = rating;
            ratingText.textContent = ratingMessages[rating];
            ratingText.style.color = 'var(--success-color)';
            
            // Update star display
            stars.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                    s.style.color = '#ffc107';
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                    s.style.color = '#e2e8f0';
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            stars.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= rating) {
                    s.style.color = '#ffc107';
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            const currentRating = parseInt(ratingInput.value) || 0;
            stars.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= currentRating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#e2e8f0';
                }
            });
        });
    });
}

// Setup character counters
function setupCharCounters() {
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const subjectCount = document.getElementById('subjectCount');
    const messageCount = document.getElementById('messageCount');
    
    subjectInput.addEventListener('input', function() {
        subjectCount.textContent = this.value.length;
    });
    
    messageInput.addEventListener('input', function() {
        messageCount.textContent = this.value.length;
    });
}

// Submit feedback
async function submitFeedback(event) {
    event.preventDefault();
    
    const rating = document.getElementById('rating').value;
    const category = document.getElementById('category').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const submitBtn = document.getElementById('submitBtn');
    
    if (rating === '0') {
        alert('Please select a rating');
        return;
    }
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Submitting...';
    
    try {
        const response = await fetch("/api/feedback/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ rating, category, subject, message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close feedback modal
            const feedbackModal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
            feedbackModal.hide();
            
            // Reset form
            document.getElementById('feedbackForm').reset();
            document.getElementById('rating').value = '0';
            document.getElementById('ratingText').textContent = 'Select a rating';
            document.getElementById('ratingText').style.color = 'var(--text-muted)';
            
            // Reset stars
            const stars = document.querySelectorAll('#starRatingInput i');
            stars.forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
                s.style.color = '#e2e8f0';
            });
            
            // Reset character counters
            document.getElementById('subjectCount').textContent = '0';
            document.getElementById('messageCount').textContent = '0';
            
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            
            // Reload feedback
            loadPublicFeedback();
        } else {
            alert(data.message || 'Error submitting feedback');
        }
    } catch (err) {
        console.error("Error submitting feedback:", err);
        alert('Error submitting feedback. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Submit Feedback';
    }
}

// Close success modal
function closeSuccessModal() {
    const successModal = bootstrap.Modal.getInstance(document.getElementById('successModal'));
    successModal.hide();
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
        console.error("Logout error:", err);
        window.location.href = "login.html";
    }
}

