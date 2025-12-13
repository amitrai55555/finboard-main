// Profile Dropdown Handler
// Handles profile dropdown visibility and admin link display based on user role

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Profile handler loaded, checking admin access...');
    setupProfileDropdown();
});

function setupProfileDropdown() {
    const adminLink = document.getElementById('admin-link');
    
    if (!adminLink) {
        console.warn('⚠️ Admin link element not found in DOM');
        return;
    }
    
    // Get user data from session storage
    const userData = sessionStorage.getItem('fintrackr_user');
    
    if (!userData) {
        console.log('ℹ️ No user data in session storage, hiding admin link');
        adminLink.style.display = 'none';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('👤 Current user data:', user);
        console.log('🔑 User role:', user.role, '(type:', typeof user.role + ')');
        
        // Check if user has admin role
        // Backend returns role as "ROLE_ADMIN" from getAuthority()
        const roleStr = String(user.role || '').toUpperCase();
        const isAdmin = roleStr === 'ROLE_ADMIN' || 
                       roleStr === 'ADMIN' || 
                       user.isAdmin === true;
        
        console.log('✅ Admin check result:', isAdmin);
        
        if (isAdmin) {
            adminLink.style.display = 'block';
            console.log('✨ Admin access granted for user:', user.username);
        } else {
            adminLink.style.display = 'none';
            console.log('🚫 User does not have admin role:', user.username, '- role is:', user.role);
        }
    } catch (error) {
        console.error('❌ Error parsing user data:', error);
        adminLink.style.display = 'none';
    }
}

// Export function for use in other scripts if needed
if (typeof window !== 'undefined') {
    window.setupProfileDropdown = setupProfileDropdown;
}
