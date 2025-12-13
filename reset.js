function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Password strength calculator
document.getElementById('newPassword').addEventListener('input', function (e) {
    const password = e.target.value;
    const bars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const level = Math.min(Math.floor(strength * 0.8), 4);

    bars.forEach((bar, index) => {
        if (index < level) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    strengthText.textContent = labels[level] || 'Weak';
});

document.getElementById('resetForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.querySelector('.submit-btn');
    
    // Create or get message div
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.style.marginTop = '15px';
        messageDiv.style.fontSize = '14px';
        messageDiv.style.fontWeight = '500';
        messageDiv.style.textAlign = 'center';
        submitBtn.parentNode.insertBefore(messageDiv, submitBtn.nextSibling);
    }
    
    // Validation
    if (!token) {
        messageDiv.textContent = 'Invalid or missing reset token. Please request a new password reset link.';
        messageDiv.style.color = '#ef4444';
        return;
    }
    
    if (!newPassword || !confirmPassword) {
        messageDiv.textContent = 'Please fill in all fields';
        messageDiv.style.color = '#ef4444';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        messageDiv.textContent = 'Passwords do not match';
        messageDiv.style.color = '#ef4444';
        return;
    }
    
    if (newPassword.length < 8) {
        messageDiv.textContent = 'Password must be at least 8 characters long';
        messageDiv.style.color = '#ef4444';
        return;
    }
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing Password...';
    submitBtn.style.opacity = '0.7';
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/reset-password', {
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
            // Redirect to password changed page
            window.location.href = '/password_changed.html';
        } else {
            messageDiv.textContent = data.error || data.message || 'Error resetting password. The link may have expired.';
            messageDiv.style.color = '#ef4444';
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Change Password';
            submitBtn.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'An error occurred. Please try again later.';
        messageDiv.style.color = '#ef4444';
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
        submitBtn.style.opacity = '1';
    }
});
