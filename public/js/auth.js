// Authentication JavaScript - Login and Registration

// Registration form handler (for index.html)
document.getElementById("userForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    const user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(user)
        });

        const data = await response.json();
        if (response.ok) {
            // Store registration success for chatbot welcome after first login
            sessionStorage.setItem('chatbotRegistrationSuccess', 'true');
            alert("Registration Successful! Please login with your credentials.");
            window.location.href = "login.html";
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// Login form handler (for login.html)
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store login success for chatbot
            sessionStorage.setItem('chatbotLoginSuccess', 'true');
            
            // Store user role in sessionStorage
            if (data.user && data.user.role) {
                sessionStorage.setItem('userRole', data.user.role);
            }
            
            // Check if this is first login (registration just happened)
            const isNewUser = sessionStorage.getItem('chatbotRegistrationSuccess');
            if (isNewUser) {
                sessionStorage.removeItem('chatbotRegistrationSuccess');
                sessionStorage.setItem('chatbotNewUser', 'true');
            }
            
            // Show success message
            showLoginSuccessMessage(data.user);
            
            // Redirect based on role after short delay
            setTimeout(() => {
                if (data.user && data.user.role === 'admin') {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "home.html";
                }
            }, 1500);
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// Show login success message with chatbot
function showLoginSuccessMessage() {
    const isNewUser = sessionStorage.getItem('chatbotNewUser');
    
    // Create a nice success message overlay
    const successHtml = `
        <div id="loginSuccessOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                animation: scaleIn 0.3s ease;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                    color: white;
                ">
                    <i class="fas fa-check"></i>
                </div>
                <h2 style="color: #333; margin-bottom: 10px;">Login Successful!</h2>
                <p style="color: #666; margin-bottom: 20px;">
                    ${isNewUser 
                        ? 'Welcome to SkyWing! Your account has been created successfully.' 
                        : 'Welcome back to SkyWing! How can I help you today?'}
                </p>
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    font-size: 14px;
                ">
                    <i class="fas fa-robot me-2"></i>
                    ${isNewUser 
                        ? 'Pro tip: Check out our deals page for special offers!' 
                        : 'Need help? Click the chat icon for assistance.'}
                </div>
            </div>
        </div>
        <style>
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHtml);
}
