// Function to show notifications
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function saveAccountData(accountData) {
    try {
        // Primary path: backend bank-account API
        const response = await dataService.createBankAccount(accountData);
        return response;
    } catch (error) {
        console.error('Failed to save bank account to backend, using localStorage:', error);
        // Fallback to localStorage
        let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        accountData.id = Date.now();
        accountData.timestamp = new Date().toISOString();
        accounts.push(accountData);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        showNotification('Account saved locally (offline mode)', 'warning');
        return accountData;
    }
}

// OTP Modal Functions
const otpInputs = document.querySelectorAll('.otp-input');
const verifyBtn = document.getElementById('verifyBtn');
const resendLink = document.getElementById('resendLink');
const resendTimer = document.getElementById('resendTimer');
let resendCountdown = 0;
let currentAccountId = null; // Store accountId for verification

// Auto-focus and navigation between inputs
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            e.target.value = '';
            return;
        }

        // Add filled class
        if (value) {
            e.target.classList.add('filled');
            // Move to next input
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else {
            e.target.classList.remove('filled');
        }

        // Enable/disable verify button
        updateVerifyButton();
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
            otpInputs[index - 1].value = '';
            otpInputs[index - 1].classList.remove('filled');
            updateVerifyButton();
        }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const digits = pastedData.match(/\d/g);
        
        if (digits) {
            digits.forEach((digit, i) => {
                if (i < otpInputs.length) {
                    otpInputs[i].value = digit;
                    otpInputs[i].classList.add('filled');
                }
            });
            updateVerifyButton();
        }
    });
});

function updateVerifyButton() {
    const allFilled = Array.from(otpInputs).every(input => input.value);
    verifyBtn.disabled = !allFilled;
}

function getOTPValue() {
    return Array.from(otpInputs).map(input => input.value).join('');
}

function clearOTP() {
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
    updateVerifyButton();
    if (otpInputs[0]) otpInputs[0].focus();
}

function showError() {
    otpInputs.forEach(input => {
        input.classList.add('error');
    });
    setTimeout(() => {
        otpInputs.forEach(input => {
            input.classList.remove('error');
        });
    }, 500);
}

function showOTPModal(accountId) {
    currentAccountId = accountId;
    document.getElementById('otpOverlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    clearOTP();
    startResendTimer(30);
}

function closeOTPModal() {
    document.getElementById('otpOverlay').classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
    currentAccountId = null;
    clearOTP();
}

async function verifyOTP() {
    const otp = getOTPValue();
    
    if (!otp || otp.length !== 6) {
        showError();
        showNotification('Please enter a valid 6-digit OTP', 'error');
        return;
    }

    if (!currentAccountId) {
        showNotification('Account ID not found', 'error');
        return;
    }

    try {
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        verifyBtn.disabled = true;

        await dataService.verifyBankAccount(currentAccountId, otp);
        showNotification('Bank account verified successfully!', 'success');
        closeOTPModal();

        // Redirect to dashboard after successful verification
        setTimeout(() => {
            window.location.href = 'dashboard.html?accounts_updated=' + Date.now() + '#accounts';
        }, 800);

    } catch (error) {
        console.error('OTP verification error:', error);
        showError();
        showNotification(error.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify Account';
        verifyBtn.disabled = false;
    }
}

function resendOTP(event) {
    event.preventDefault();
    if (resendCountdown > 0) return;
    
    console.log('Resending OTP for account:', currentAccountId);
    
    // TODO: Add your resend OTP API call here
    // Example: await dataService.resendOTP(currentAccountId);
    
    showNotification('OTP has been resent!', 'success');
    clearOTP();
    startResendTimer(30);
}

function startResendTimer(seconds) {
    resendCountdown = seconds;
    resendLink.classList.add('disabled');
    
    const interval = setInterval(() => {
        resendCountdown--;
        resendTimer.textContent = `(${resendCountdown}s)`;
        
        if (resendCountdown <= 0) {
            clearInterval(interval);
            resendTimer.textContent = '';
            resendLink.classList.remove('disabled');
        }
    }, 1000);
}

// Attach verify button click handler
verifyBtn.addEventListener('click', verifyOTP);

// Close on overlay click
document.getElementById('otpOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'otpOverlay') {
        closeOTPModal();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeOTPModal();
    }
});

// Form submission
document.getElementById('accountForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    try {
        const formData = new FormData(this);

        const bankName = (formData.get('bank') || '').trim();
        const accountHolderName = (formData.get('accountHolderName') || '').trim();
        const accountNumber = (formData.get('number') || '').trim();
        const ifscCode = (formData.get('ifscCode') || '').trim();
        const accountType = (formData.get('type') || '').trim();

        if (!bankName) throw new Error('Please enter bank name');
        if (!accountHolderName) throw new Error('Please enter account holder name');
        if (!accountNumber) throw new Error('Please enter account number');
        if (!ifscCode) throw new Error('Please enter IFSC code');
        if (!accountType) throw new Error('Please select an account type');

        const payload = {
            bankName,
            accountHolderName,
            accountNumber,
            ifscCode,
            accountType
        };

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Account...';
            submitBtn.disabled = true;
        }

        const response = await saveAccountData(payload);

        // If backend returns accountId, show OTP modal
        if (response && response.accountId) {
            showNotification('OTP sent. Please verify your bank account.', 'success');
            showOTPModal(response.accountId); // Show custom OTP modal instead of prompt
        } else {
            showNotification('Account added successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html?accounts_updated=' + Date.now() + '#accounts';
            }, 800);
        }

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText || '<i class="fas fa-plus"></i> Add Account';
            submitBtn.disabled = false;
        }
    }
});