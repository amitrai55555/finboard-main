// ============================================
// 1. REQUEST PASSWORD RESET (Send Email Page)
// ============================================
async function sendPasswordResetEmail() {
    const emailInput = document.querySelector('.input-box input[type="email"]');
    const email = emailInput.value.trim();
    const button = document.querySelector('.btn');
    
    // Check if message div exists, if not create it
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        button.parentNode.insertBefore(messageDiv, button.nextSibling);
    }
    
    if (!email) {
        showMessage(messageDiv, 'Please enter your email address', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage(messageDiv, 'Please enter a valid email address', 'error');
        return;
    }
    
    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Sending...';
    button.style.opacity = '0.7';
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store email in sessionStorage for the sent page to display
            sessionStorage.setItem('resetEmail', email);
            // Redirect to email sent page
            window.location.href = '/sent.html';
        } else {
            showMessage(messageDiv, data.error || data.message || 'Error sending reset email', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again later.', 'error');
    } finally {
        // Re-enable button
        button.disabled = false;
        button.textContent = 'Send Email';
        button.style.opacity = '1';
    }
}

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.style.marginTop = '15px';
    element.style.fontSize = '14px';
    element.style.fontWeight = '500';
    
    if (type === 'success') {
        element.style.color = '#10b981';
    } else {
        element.style.color = '#ef4444';
    }
}

// ============================================
// 2. RESET PASSWORD (New Password Page)
// ============================================
async function resetPassword() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPasswordInput = document.querySelector('input[type="password"]:first-of-type');
    const confirmPasswordInput = document.querySelector('input[type="password"]:last-of-type');
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const button = document.querySelector('.btn');
    
    // Check if message div exists, if not create it
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        button.parentNode.insertBefore(messageDiv, button.nextSibling);
    }
    
    // Validate inputs
    if (!newPassword || !confirmPassword) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showMessage(messageDiv, 'Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!token) {
        showMessage(messageDiv, 'Invalid or missing reset token', 'error');
        return;
    }
    
    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Resetting...';
    button.style.opacity = '0.7';
    
    try {
        const response = await fetch('/api/password-reset/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(messageDiv, 'Password reset successfully! Redirecting to login...', 'success');
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showMessage(messageDiv, data.message || 'Error resetting password', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again later.', 'error');
    } finally {
        // Re-enable button if there was an error
        if (!document.querySelector('.message').textContent.includes('successfully')) {
            button.disabled = false;
            button.textContent = 'Reset Password';
            button.style.opacity = '1';
        }
    }
}