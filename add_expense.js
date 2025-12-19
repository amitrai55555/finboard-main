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

function mapExpenseCategory(category) {
    const c = String(category || '').toLowerCase();
    switch (c) {
        case 'food': return 'FOOD';
        case 'transport': return 'TRANSPORTATION';
        case 'shopping': return 'SHOPPING';
        case 'entertainment': return 'ENTERTAINMENT';
        case 'bills': return 'UTILITIES';
        case 'healthcare': return 'HEALTHCARE';
        case 'education': return 'EDUCATION';
        case 'insurance': return 'INSURANCE';
        // travel/investment not supported by backend enum
        default: return 'OTHER';
    }
}

function mapRecurrenceType(freq) {
    const f = String(freq || '').toLowerCase();
    switch (f) {
        case 'weekly':
        case 'bi-weekly':
            return 'WEEKLY';
        case 'monthly':
            return 'MONTHLY';
        case 'quarterly':
            return 'QUARTERLY';
        case 'yearly':
            return 'YEARLY';
        default:
            return null;
    }
}

async function populateExpenseBankAccounts() {
    const select = document.getElementById('expenseBankAccount');
    if (!select) return;

    try {
        const accounts = await dataService.getAccounts(true);
        select.innerHTML = '';

        if (!accounts || accounts.length === 0) {
            select.innerHTML = '<option value="">No bank accounts found. Add an account first.</option>';
            return;
        }

        accounts.forEach((a) => {
            const opt = document.createElement('option');
            opt.value = a.id;
            const suffix = a.verified ? '' : ' (unverified)';
            opt.textContent = `${a.bankName || 'Bank'} - ${a.accountNumber || ''}${suffix}`.trim();
            select.appendChild(opt);
        });

        const verified = accounts.find(a => a.verified);
        if (verified) select.value = String(verified.id);
    } catch (e) {
        console.error('Failed to load bank accounts:', e);
        select.innerHTML = '<option value="">Unable to load bank accounts</option>';
    }
}

document.addEventListener('DOMContentLoaded', populateExpenseBankAccounts);

// Form submission
document.getElementById('expenseForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    try {
        const formData = new FormData(this);

        const amount = parseFloat(formData.get('amount'));
        const date = formData.get('date');
        const category = formData.get('category');
        const merchant = formData.get('merchant');
        const isRecurring = formData.get('recurring') === 'on';
        const recurrenceType = isRecurring ? mapRecurrenceType(formData.get('frequency')) : null;
        const bankAccountId = Number(formData.get('bankAccountId'));

        const description = (formData.get('description') || '').trim()
            || (merchant || '').trim()
            || `${category || 'Expense'}`;

        // Validate amount
        if (Number.isNaN(amount) || amount <= 0) {
            throw new Error('Please enter a valid amount greater than 0');
        }

        // Validate category
        if (!category) {
            throw new Error('Please select an expense category');
        }

        if (!bankAccountId || Number.isNaN(bankAccountId)) {
            throw new Error('Please select a bank account');
        }

        const expenseData = {
            description,
            amount,
            category: mapExpenseCategory(category),
            date,
            isRecurring,
            recurrenceType,
            notes: merchant ? `Merchant: ${merchant}` : null,
            bankAccountId
        };

        // Show loading state
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Expense...';
            submitBtn.disabled = true;
        }

        // Save the data
        await saveExpenseData(expenseData);

        showNotification('Expense added successfully!', 'success');

        // Redirect back to Budget section with refresh flag
        setTimeout(() => {
            window.location.href = 'dashboard.html?expense_updated=' + Date.now() + '#budget';
        }, 800);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText || '<i class="fas fa-plus"></i> Add Expense';
            submitBtn.disabled = false;
        }
    }
});
