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

        // If backend returns accountId, attempt OTP verify
        if (response && response.accountId) {
            showNotification('OTP sent. Please verify your bank account.', 'success');

            const otp = prompt('Enter the OTP sent to verify your bank account:');
            if (otp) {
                try {
                    await dataService.verifyBankAccount(response.accountId, otp);
                    showNotification('Bank account verified successfully!', 'success');
                } catch (e) {
                    console.error(e);
                    showNotification(e.message || 'Bank account verification failed', 'error');
                }
            }
        } else {
            showNotification('Account added successfully!', 'success');
        }

        setTimeout(() => {
            window.location.href = 'dashboard.html?accounts_updated=' + Date.now() + '#accounts';
        }, 800);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText || '<i class="fas fa-plus"></i> Add Account';
            submitBtn.disabled = false;
        }
    }
});
