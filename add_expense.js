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

// Function to save expense data to API and localStorage as fallback
async function saveExpenseData(expenseData) {
    try {
        // Try to save to backend first
        const response = await dataService.createExpense(expenseData);
        console.log('Expense saved to backend:', response);
        return response;
    } catch (error) {
        console.error('Failed to save to backend, using localStorage:', error);
        // Fallback to localStorage
        let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        expenseData.id = Date.now();
        expenseData.timestamp = new Date().toISOString();
        expenses.push(expenseData);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        showNotification('Expense saved locally (offline mode)', 'warning');
        return expenseData;
    }
}

// Set default date to today
document.getElementById('expenseDate').valueAsDate = new Date();

// Handle recurring checkbox
document.getElementById('expenseRecurring').addEventListener('change', function() {
    const recurringOptions = document.getElementById('recurringOptions');
    recurringOptions.style.display = this.checked ? 'block' : 'none';
});

// Form submission
document.getElementById('expenseForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);
        const expenseData = {
            amount: parseFloat(formData.get('amount')),
            date: formData.get('date'),
            category: formData.get('category'),
            merchant: formData.get('merchant'),
            description: formData.get('description'),
            recurring: formData.get('recurring') === 'on',
            frequency: formData.get('frequency')
        };

        // Validate amount
        if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
            throw new Error('Please enter a valid amount greater than 0');
        }

        // Validate category
        if (!expenseData.category) {
            throw new Error('Please select an expense category');
        }

        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Expense...';
        submitBtn.disabled = true;

        // Save the data
        await saveExpenseData(expenseData);

        // Show success message
        showNotification('Expense added successfully!', 'success');

        // Reset form
        this.reset();
        document.getElementById('expenseDate').valueAsDate = new Date();

        // Redirect back to Budget section after a short delay with refresh flag
        setTimeout(() => {
            window.location.href = 'dashboard.html#budget?expense_updated=' + Date.now();
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        const submitBtn = this.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Expense';
        submitBtn.disabled = false;
    }
});
