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

// Function to save investment data to localStorage
function saveInvestmentData(investmentData) {
    // Get existing investments or initialize empty array
    let investments = JSON.parse(localStorage.getItem('investments') || '[]');

    // Add new investment with unique ID
    investmentData.id = Date.now();
    investmentData.timestamp = new Date().toISOString();
    investments.push(investmentData);

    // Save back to localStorage
    localStorage.setItem('investments', JSON.stringify(investments));
}

// Set default date to today
document.getElementById('investmentDate').valueAsDate = new Date();

// Auto-fill current value with invested amount if empty
document.getElementById('investmentAmount').addEventListener('input', function() {
    const currentValueField = document.getElementById('currentValue');
    if (!currentValueField.value) {
        currentValueField.value = this.value;
    }
});

// Form submission
document.getElementById('investmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);
        const investmentData = {
            name: formData.get('name').trim(),
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            currentValue: parseFloat(formData.get('currentValue') || formData.get('amount')),
            date: formData.get('date'),
            quantity: parseFloat(formData.get('quantity') || 0),
            broker: formData.get('broker').trim(),
            description: formData.get('description').trim()
        };

        // Validate name
        if (!investmentData.name) {
            throw new Error('Please enter an investment name');
        }

        // Validate type
        if (!investmentData.type) {
            throw new Error('Please select an investment type');
        }

        // Validate amount
        if (isNaN(investmentData.amount) || investmentData.amount <= 0) {
            throw new Error('Please enter a valid investment amount greater than 0');
        }

        // Validate current value
        if (isNaN(investmentData.currentValue) || investmentData.currentValue < 0) {
            investmentData.currentValue = investmentData.amount;
        }

        // Validate quantity
        if (isNaN(investmentData.quantity) || investmentData.quantity < 0) {
            investmentData.quantity = 0;
        }

        // Save the data
        saveInvestmentData(investmentData);

        // Show success message
        showNotification('Investment added successfully!', 'success');

        // Redirect back to Investments section after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html#investments';
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
    }
});
