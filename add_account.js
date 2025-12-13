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

// Function to save account data to localStorage
function saveAccountData(accountData) {
    // Get existing accounts or initialize empty array
    let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    // Add new account with unique ID
    accountData.id = Date.now();
    accountData.timestamp = new Date().toISOString();
    accounts.push(accountData);

    // Save back to localStorage
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

// Form submission
document.getElementById('accountForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);
        const accountData = {
            name: formData.get('name'),
            type: formData.get('type'),
            bank: formData.get('bank'),
            number: formData.get('number'),
            balance: parseFloat(formData.get('balance')),
            currency: formData.get('currency'),
            description: formData.get('description'),
            primary: formData.get('primary') === 'on'
        };

        // Validate required fields
        if (!accountData.name) {
            throw new Error('Please enter an account name');
        }

        if (!accountData.type) {
            throw new Error('Please select an account type');
        }

        if (isNaN(accountData.balance)) {
            throw new Error('Please enter a valid balance');
        }

        if (!accountData.currency) {
            throw new Error('Please select a currency');
        }

        // Save the data
        saveAccountData(accountData);

        // Show success message
        showNotification('Account added successfully!', 'success');

        // Redirect back to Accounts section after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html#accounts';
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
    }
});
