// DOM Elements
const forgotForm = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(input, message) {
    // Remove existing error
    const existingError = input.parentNode.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error styling
    input.style.borderColor = '#e53e3e';

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e53e3e';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';

    input.parentNode.parentNode.appendChild(errorDiv);
}

function clearError(input) {
    const existingError = input.parentNode.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = '#e2e8f0';
}

// Real-time validation
emailInput.addEventListener('input', function() {
    if (this.value && !validateEmail(this.value)) {
        showError(this, 'Please enter a valid email address');
    } else {
        clearError(this);
    }
});

// Form submission
forgotForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    let isValid = true;

    // Clear previous errors
    clearError(emailInput);

    // Validate email
    if (!email) {
        showError(emailInput, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }

    if (isValid) {
        // Show loading state
        const submitBtn = this.querySelector('.login-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Show success message
            showSuccessMessage('Password reset link has been sent to your email address.');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }, 2000);
    }
});

// Success message function
function showSuccessMessage(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        background: #48bb78;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;

    forgotForm.insertBefore(successDiv, forgotForm.firstChild);

    // Remove message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
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
