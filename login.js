// DOM Elements
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const usernameOrEmailInput = document.getElementById('usernameOrEmail');
const rememberCheckbox = document.getElementById('remember');
const connectionStatus = document.getElementById('connectionStatus');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

// Auth mode state
let authMode = 'login';

// Basic login status and logout
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    initializeSmoothScrolling();
});

function checkLoginStatus() {
    const userData = sessionStorage.getItem('fintrackr_user');
    const logoutBtn = document.getElementById('logoutBtn');
    if (userData && logoutBtn) {
        logoutBtn.style.display = 'flex';
    } else if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
}

// Keep smooth scrolling for better UX
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        if (!link.closest('button') || !link.onclick) {
            link.addEventListener('click', function(e) {
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });
}


// Mobile menu toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// Toggle between login and registration modes
function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';

    const loginFields = document.querySelectorAll('.login-fields');
    const registerFields = document.querySelectorAll('.register-fields');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const btnText = document.getElementById('btnText');
    const btnLoadingText = document.getElementById('btnLoadingText');
    const switchBtn = document.querySelector('.auth-switch .switch-btn');

    if (authMode === 'register') {
        // Show registration fields, hide login fields
        loginFields.forEach(field => field.style.display = 'none');
        registerFields.forEach(field => field.style.display = 'block');

        // Update text
        formTitle.textContent = 'Create Account';
        formSubtitle.textContent = 'Join our financial dashboard';
        btnText.textContent = 'Create Account';
        btnLoadingText.textContent = 'Creating account...';
        switchBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Back to Login';

        // Make registration fields required
        document.getElementById('firstName').required = true;
        document.getElementById('lastName').required = true;
        document.getElementById('username').required = true;
        document.getElementById('email').required = true;
        document.getElementById('usernameOrEmail').required = false;

    } else {
        // Show login fields, hide registration fields
        loginFields.forEach(field => field.style.display = 'block');
        registerFields.forEach(field => field.style.display = 'none');

        // Update text
        formTitle.textContent = 'Welcome Back';
        formSubtitle.textContent = 'Sign in to your financial dashboard';
        btnText.textContent = 'Sign In to Dashboard';
        btnLoadingText.textContent = 'Signing in...';
        switchBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create New Account';

        // Make login field required, remove required from registration fields
        document.getElementById('usernameOrEmail').required = true;
        document.getElementById('firstName').required = false;
        document.getElementById('lastName').required = false;
        document.getElementById('username').required = false;
        document.getElementById('email').required = false;
    }
}

// Password visibility toggle
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(input, message) {
    // Remove existing error
    const existingError = input.parentNode.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error styling
    input.style.borderColor = 'var(--danger-color)';
    input.parentNode.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.marginTop = '4px';

    input.parentNode.parentNode.appendChild(errorDiv);
}

function clearError(input) {
    const existingError = input.parentNode.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = 'var(--border-color)';
    input.parentNode.classList.remove('error');
}

// Real-time validation
usernameOrEmailInput.addEventListener('input', function() {
    const value = this.value.trim();
    if (!value) {
        showError(this, 'Username or email is required');
    } else if (value.includes('@') && !validateEmail(value)) {
        showError(this, 'Please enter a valid email address');
    } else {
        clearError(this);
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value && !validatePassword(this.value)) {
        showError(this, 'Password must be at least 6 characters long');
    } else {
        clearError(this);
    }
});

// Real-time validation for registration fields
document.getElementById('firstName').addEventListener('input', function() {
    if (!this.value.trim()) {
        showError(this, 'First name is required');
    } else {
        clearError(this);
    }
});

document.getElementById('lastName').addEventListener('input', function() {
    if (!this.value.trim()) {
        showError(this, 'Last name is required');
    } else {
        clearError(this);
    }
});

document.getElementById('username').addEventListener('input', function() {
    if (!this.value.trim()) {
        showError(this, 'Username is required');
    } else {
        clearError(this);
    }
});

document.getElementById('email').addEventListener('input', function() {
    const value = this.value.trim();
    if (!value) {
        showError(this, 'Email is required');
    } else if (!validateEmail(value)) {
        showError(this, 'Please enter a valid email address');
    } else {
        clearError(this);
    }
});

// Form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    let isValid = true;

    // Clear previous errors
    clearError(usernameOrEmailInput);
    clearError(passwordInput);
    clearError(document.getElementById('firstName'));
    clearError(document.getElementById('lastName'));
    clearError(document.getElementById('username'));
    clearError(document.getElementById('email'));

    if (authMode === 'login') {
        const usernameOrEmail = usernameOrEmailInput.value.trim();
        const password = passwordInput.value;

        // Validate username or email
        if (!usernameOrEmail) {
            showError(usernameOrEmailInput, 'Username or email is required');
            isValid = false;
        } else if (usernameOrEmail.includes('@') && !validateEmail(usernameOrEmail)) {
            showError(usernameOrEmailInput, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordInput, 'Password must be at least 6 characters long');
            isValid = false;
        }

        if (isValid) {
            handleAuthentication(usernameOrEmail, password);
        }
    } else {
        // Registration mode
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        // Validate registration fields
        if (!firstName) {
            showError(document.getElementById('firstName'), 'First name is required');
            isValid = false;
        }
        if (!lastName) {
            showError(document.getElementById('lastName'), 'Last name is required');
            isValid = false;
        }
        if (!username) {
            showError(document.getElementById('username'), 'Username is required');
            isValid = false;
        }
        if (!email) {
            showError(document.getElementById('email'), 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('email'), 'Please enter a valid email address');
            isValid = false;
        }
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordInput, 'Password must be at least 6 characters long');
            isValid = false;
        }

        if (isValid) {
            handleAuthenticationRegistration({ firstName, lastName, username, email, password });
        }
    }
});

// Handle authentication (login) - Using AuthManager
async function handleAuthentication(usernameOrEmail, password) {
    const submitBtn = loginForm.querySelector('.login-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    try {
        // Use AuthManager for login
        const result = await AuthManager.login({ usernameOrEmail, password });

        if (result.success) {
            // Handle successful authentication
            handleAuthSuccess(result, usernameOrEmail, password);
        } else {
            throw new Error('Login failed - no success response');
        }

    } catch (error) {
        console.error('Authentication error:', error);
        handleAuthError(error);
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Handle authentication registration - Using AuthManager
async function handleAuthenticationRegistration(userData) {
    const submitBtn = loginForm.querySelector('.login-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    try {
        // Use AuthManager for registration
        const result = await AuthManager.register(userData);

        if (result.success) {
            // Handle successful registration - show success message and switch to login
            showToast('Registration successful! Please login with your credentials.', 'success');

            // Switch back to login mode after a brief delay
            setTimeout(() => {
                toggleAuthMode();
                // Clear registration fields
                document.getElementById('firstName').value = '';
                document.getElementById('lastName').value = '';
                document.getElementById('username').value = '';
                document.getElementById('email').value = '';
                passwordInput.value = '';
            }, 2000);
        }

    } catch (error) {
        console.error('Registration error:', error);
        handleAuthError(error);
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Handle successful authentication - Updated to work with backend
function handleAuthSuccess(data, usernameOrEmail, password) {
    // Update backend connection status
    showBackendStatus(true);

    // Update UI to show logout button
    checkLoginStatus();

    // Show success message
    showToast('Login successful! Redirecting to dashboard...', 'success');

    // Redirect to dashboard after a brief delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Handle logout functionality - Using AuthManager
function handleLogout() {
    // Show loading state on logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    }

    // Use AuthManager for logout
    AuthManager.logout();
}

// Handle authentication errors
function handleAuthError(error) {
    let errorMessage = 'Authentication failed';

    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        showBackendStatus(false);
    } else if (error.message.includes('401')) {
        errorMessage = 'Invalid credentials. Please check your username and password.';
    } else if (error.message.includes('404')) {
        errorMessage = 'Authentication service not available. Please try again later.';
    } else {
        errorMessage = error.message || 'An unexpected error occurred';
    }

    // Show error message to user
    showErrorMessage(errorMessage);

    // Only show input error if it's a credential issue
    if (error.message.includes('401')) {
        showError(usernameOrEmailInput, errorMessage);
    }
}

// Show error message in a toast notification
function showErrorMessage(message) {
    showToast(message, 'error');
}

// Show success message in a toast notification
function showSuccessMessage(message) {
    showToast(message, 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Update backend connection status UI
function showBackendStatus(isConnected, message = '') {
    if (!connectionStatus) return;
    const statusDiv = connectionStatus;
    const statusIndicator = statusDiv.querySelector('.status-indicator');
    const statusText = statusDiv.querySelector('.status-text');
    statusDiv.style.display = 'block';
    if (isConnected) {
        statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #48bb78;"></i>';
        statusText.textContent = message || 'Backend connection successful!';
        statusText.style.color = '#48bb78';
    } else {
        statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #e53e3e;"></i>';
        statusText.textContent = message || 'Backend connection failed.';
        statusText.style.color = '#e53e3e';
    }
    setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
}

// Social login handlers
const googleBtn = document.querySelector('.google-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', function() {
        showInfoMessage('Google Sign-In would be implemented here');
    });
}

const microsoftBtn = document.querySelector('.microsoft-btn');
if (microsoftBtn) {
    microsoftBtn.addEventListener('click', function() {
        showInfoMessage('Microsoft Sign-In would be implemented here');
    });
}

function showInfoMessage(message) {
    const infoDiv = document.createElement('div');
    infoDiv.textContent = message;
    infoDiv.style.cssText = `
        background: #4299e1;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;

    loginForm.insertBefore(infoDiv, loginForm.firstChild);

    setTimeout(() => {
        infoDiv.remove();
    }, 3000);
}

// Load remembered credentials on page load
window.addEventListener('load', function() {
    const userData = sessionStorage.getItem('fintrackr_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.email && usernameOrEmailInput) {
                usernameOrEmailInput.value = user.email;
                rememberCheckbox.checked = true;
            } else if (user.username && usernameOrEmailInput) {
                usernameOrEmailInput.value = user.username;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
});

// Forgot password handler
const forgotPasswordLink = document.querySelector('.forgot');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'forgot.html';
    });
}

// Create account handler
const signupLink = document.querySelector('.signup-link a');
if (signupLink) {
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        showInfoMessage('Account creation would redirect to signup page');
    });
}

// Add CSS animation for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .error-message {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// Input focus effects
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentNode.style.transform = 'translateY(-1px)';
        this.parentNode.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });

    input.addEventListener('blur', function() {
        this.parentNode.style.transform = 'translateY(0)';
        this.parentNode.style.boxShadow = 'none';
    });
});

// Feature cards hover effect
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.transition = 'transform 0.2s ease';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Handle feature like button click
function handleFeatureLike(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const likeCount = btn.querySelector('.like-count');
    const isLiked = btn.classList.contains('liked');

    // Toggle liked state
    if (isLiked) {
        btn.classList.remove('liked');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
    } else {
        btn.classList.add('liked');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;

        // Show success message
        showSuccessMessage('Feature liked! Redirecting to login page...');

        // Redirect to login page after a brief delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// Handle footer like button click
function handleFooterLike(event, section) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const likeCount = btn.querySelector('.like-count');
    const isLiked = btn.getAttribute('data-liked') === 'true';

    // Toggle liked state
    if (isLiked) {
        btn.setAttribute('data-liked', 'false');
        btn.classList.remove('liked');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
    } else {
        btn.setAttribute('data-liked', 'true');
        btn.classList.add('liked');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;

        // Show success message with section specification
        showSuccessMessage(`${section} liked! Redirecting to login page...`);

        // Redirect to login page after a brief delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}


// API testing functionality: test real backend connectivity
async function testBackendConnection() {
    const statusDiv = document.getElementById('connectionStatus');
    const statusIndicator = statusDiv.querySelector('.status-indicator');
    const statusText = statusDiv.querySelector('.status-text');

    // Show checking status
    statusDiv.style.display = 'block';
    statusIndicator.className = 'status-indicator';
    statusIndicator.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    statusText.textContent = `Checking ${API_CONFIG.BASE_URL} ...`;

    try {
        const res = await apiService.checkConnection();
        if (res && res.ok) {
            statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #48bb78;"></i>';
            statusText.textContent = 'Backend connection successful!';
            statusText.style.color = '#48bb78';
        } else {
            statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #e53e3e;"></i>';
            statusText.textContent = `Backend responded with ${res.status}`;
            statusText.style.color = '#e53e3e';
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #e53e3e;"></i>';
        statusText.textContent = 'Cannot reach backend. Check API base URL and server.';
        statusText.style.color = '#e53e3e';
    }

    // Hide status after 5 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// View API documentation
function viewApiDocs() {
    // Open API documentation in a new tab
    const docsUrl = API_CONFIG.BASE_URL.replace('/api', '') + '/swagger-ui.html';
    window.open(docsUrl, '_blank');
}
