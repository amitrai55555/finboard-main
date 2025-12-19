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

function mapIncomeCategory(type) {
    const t = String(type || '').toLowerCase();
    switch (t) {
        case 'salary': return 'SALARY';
        case 'freelance': return 'FREELANCE';
        case 'business': return 'BUSINESS';
        case 'investment':
        case 'dividend':
            return 'INVESTMENTS';
        case 'rental': return 'RENTAL';
        case 'bonus': return 'BONUS';
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

async function populateIncomeBankAccounts() {
    const select = document.getElementById('incomeBankAccount');
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

document.addEventListener('DOMContentLoaded', populateIncomeBankAccounts);

// Form submission
document.getElementById('incomeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    try {
        const formData = new FormData(this);

        const amount = parseFloat(formData.get('amount'));
        const date = formData.get('date');
        const type = formData.get('type');
        const source = formData.get('source');
        const isRecurring = formData.get('recurring') === 'on';
        const recurrenceType = isRecurring ? mapRecurrenceType(formData.get('frequency')) : null;
        const bankAccountId = Number(formData.get('bankAccountId'));

        const description = (formData.get('description') || '').trim()
            || (source || '').trim()
            || `${type || 'Income'} income`;

        // Validate amount
        if (Number.isNaN(amount) || amount <= 0) {
            throw new Error('Please enter a valid amount greater than 0');
        }

        // Validate type
        if (!type) {
            throw new Error('Please select an income type');
        }

        if (!bankAccountId || Number.isNaN(bankAccountId)) {
            throw new Error('Please select a bank account');
        }

        const incomeData = {
            description,
            amount,
            category: mapIncomeCategory(type),
            date,
            isRecurring,
            recurrenceType,
            notes: source ? `Source: ${source}` : null,
            bankAccountId
        };

        // Show loading state
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Income...';
            submitBtn.disabled = true;
        }

        // Save the data
        await saveIncomeData(incomeData);

        showNotification('Income added successfully!', 'success');

        // Redirect back to Budget section with refresh flag
        setTimeout(() => {
            window.location.href = 'dashboard.html?income_updated=' + Date.now() + '#budget';
        }, 800);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText || '<i class="fas fa-plus"></i> Add Income';
            submitBtn.disabled = false;
        }
    }
});
