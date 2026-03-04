// Admin Dashboard Icon - Shows only for admin users

// Function to add admin icon to navbar
async function addAdminIcon() {
    try {
        const response = await fetch("/api/users/session", { credentials: "include" });
        const data = await response.json();
        
        if (data.authenticated && data.user.role === 'admin') {
            // User is admin, add the admin dashboard icon
            const navbarNav = document.querySelector('.navbar-nav');
            
            if (navbarNav) {
                const adminIcon = document.createElement('li');
                adminIcon.className = 'nav-item';
                adminIcon.innerHTML = `
                    <a class="nav-link admin-dashboard-link" href="admin.html" title="Admin Dashboard">
                        <i class="fas fa-cogs me-1"></i> Admin
                    </a>
                `;
                navbarNav.appendChild(adminIcon);
            }
        }
    } catch (err) {
        console.error('Failed to check admin status:', err);
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', addAdminIcon);

