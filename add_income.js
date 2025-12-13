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

// Function to save income data to API and localStorage as fallback
async function saveIncomeData(incomeData) {
    try {
        // Try to save to backend first
        const response = await dataService.createIncome(incomeData);
        console.log('Income saved to backend:', response);
        return response;
    } catch (error) {
        console.error('Failed to save to backend, using localStorage:', error);
        // Fallback to localStorage
        let incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
        incomeData.id = Date.now();
        incomeData.timestamp = new Date().toISOString();
        incomes.push(incomeData);
        localStorage.setItem('incomes', JSON.stringify(incomes));
        showNotification('Income saved locally (offline mode)', 'warning');
        return incomeData;
    }
}

// Set default date to today
document.getElementById('incomeDate').valueAsDate = new Date();

// Handle recurring checkbox
document.getElementById('incomeRecurring').addEventListener('change', function() {
    const recurringOptions = document.getElementById('recurringOptions');
    recurringOptions.style.display = this.checked ? 'block' : 'none';
});

// Form submission
document.getElementById('incomeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);
        const incomeData = {
            amount: parseFloat(formData.get('amount')),
            date: formData.get('date'),
            type: formData.get('type'),
            source: formData.get('source'),
            description: formData.get('description'),
            recurring: formData.get('recurring') === 'on',
            frequency: formData.get('frequency')
        };

        // Validate amount
        if (isNaN(incomeData.amount) || incomeData.amount <= 0) {
            throw new Error('Please enter a valid amount greater than 0');
        }

        // Validate type
        if (!incomeData.type) {
            throw new Error('Please select an income type');
        }

        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Income...';
        submitBtn.disabled = true;

        // Save the data
        await saveIncomeData(incomeData);

        // Show success message
        showNotification('Income added successfully!', 'success');

        // Reset form
        this.reset();
        document.getElementById('incomeDate').valueAsDate = new Date();

        // Redirect back to Budget section after a short delay with refresh flag
        setTimeout(() => {
            window.location.href = 'dashboard.html#budget?income_updated=' + Date.now();
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        const submitBtn = this.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Income';
        submitBtn.disabled = false;
    }
});
