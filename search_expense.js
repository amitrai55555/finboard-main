let allExpenses = [];

async function loadExpenses() {
    try {
        let expenses = await dataService.getExpenses(true);
        
        if (!expenses || expenses.length === 0) {
            console.log('No expenses from /api/expense, trying dashboard overview recentExpenses');
            
            try {
                const summary = await dataService.getDashboardSummary(false);
                const recentExpenses = Array.isArray(summary?.recentExpenses) ? summary.recentExpenses : [];
                
                if (recentExpenses.length > 0) {
                    console.log('Using recentExpenses from dashboard overview to populate expense list');
                    expenses = recentExpenses;
                } else {
                    console.log('No expenses from dashboard either, checking localStorage...');
                    const localExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                    if (localExpenses && localExpenses.length > 0) {
                        console.log('Found expenses in localStorage:', localExpenses);
                        expenses = localExpenses;
                    } else {
                        document.getElementById('expenseTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No expenses found. Add your first expense to get started!</td></tr>';
                        document.getElementById('totalExpenses').textContent = '₹0';
                        document.getElementById('monthExpenses').textContent = '₹0';
                        document.getElementById('topCategory').textContent = 'N/A';
                        return;
                    }
                }
            } catch (summaryError) {
                console.error('Error loading dashboard summary for expenses:', summaryError);
                const localExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                if (localExpenses && localExpenses.length > 0) {
                    console.log('Using localStorage fallback');
                    expenses = localExpenses;
                } else {
                    document.getElementById('expenseTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No expenses found. Add your first expense to get started!</td></tr>';
                    document.getElementById('totalExpenses').textContent = '₹0';
                    document.getElementById('monthExpenses').textContent = '₹0';
                    document.getElementById('topCategory').textContent = 'N/A';
                    return;
                }
            }
        }

        console.log('Loading expenses:', expenses);
        allExpenses = expenses;
        const latestExpenses = [...expenses].reverse().slice(0, 5);
        displayExpenses(latestExpenses);
        updateSummary(expenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        const localExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        if (localExpenses && localExpenses.length > 0) {
            console.log('Error occurred, using localStorage fallback');
            allExpenses = localExpenses;
            const latestExpenses = [...localExpenses].reverse().slice(0, 5);
            displayExpenses(latestExpenses);
            updateSummary(localExpenses);
        } else {
            document.getElementById('expenseTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ff6b6b;">Error loading expenses. Please check your connection.</td></tr>';
        }
    }
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = '';
    
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No matching expenses found</td></tr>';
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        const expenseDate = expense.date ? new Date(expense.date).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        }) : 'N/A';
        
        const category = expense.category ? expense.category.charAt(0).toUpperCase() + expense.category.slice(1).toLowerCase() : 'N/A';
        const description = expense.description || expense.merchant || 'No description';
        const amount = Number(expense.amount).toFixed(2);
        
        row.innerHTML = `
            <td>${expenseDate}</td>
            <td>${category}</td>
            <td>${description}</td>
            <td>₹${amount}</td>
            <td>
                <button class="expense-update-btn" data-id="${expense.id}" style="margin-right: 8px;">Update</button>
                <button class="expense-remove-btn" data-id="${expense.id}">Remove</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function searchExpenses() {
    console.log('Search button clicked');
    const amountInput = document.getElementById('amountInput').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const categoryFilter = document.getElementById('expenseCategory').value;
    const priceOrder = document.getElementById('priceOrder').value;
    
    console.log('Search params:', { amountInput, timeFilter, categoryFilter, priceOrder });
    
    let filtered = [...allExpenses];
    console.log('Total expenses:', filtered.length);
    
    if (timeFilter && timeFilter !== 'Alltime') {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        filtered = filtered.filter(exp => {
            const expDate = new Date(exp.date);
            if (timeFilter === 'last7days') {
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                return expDate >= sevenDaysAgo && expDate <= now;
            } else if (timeFilter === 'Thismonth') {
                return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
        console.log('After time filter:', filtered.length);
    }
    
    if (categoryFilter && categoryFilter !== 'All') {
        filtered = filtered.filter(exp => {
            const expCategory = String(exp.category || '').toUpperCase();
            const searchCategory = categoryFilter.toUpperCase();
            const categoryMap = {
                'FOOD': 'FOOD',
                'TRANSPORT': 'TRANSPORTATION',
                'SHOPPING': 'SHOPPING',
                'ENTERTAINMENT': 'ENTERTAINMENT',
                'BILLS': 'UTILITIES',
                'HEALTHCARE': 'HEALTHCARE',
                'EDUCATION': 'EDUCATION',
                'TRAVEL': 'TRAVEL',
                'INSURANCE': 'INSURANCE',
                'INVESTMENT': 'INVESTMENT',
                'OTHER': 'OTHER'
            };
            const mappedCategory = categoryMap[searchCategory] || searchCategory;
            return expCategory === searchCategory || expCategory === mappedCategory;
        });
        console.log('After category filter:', filtered.length);
    }
    
    if (amountInput) {
        const searchAmount = Number(amountInput);
        if (priceOrder === 'Exactamount') {
            filtered = filtered.filter(exp => {
                const expAmount = Number(exp.amount || 0);
                return Math.abs(expAmount - searchAmount) < 0.01;
            });
        } else if (priceOrder === 'Morethan') {
            filtered = filtered.filter(exp => {
                const expAmount = Number(exp.amount || 0);
                return expAmount >= searchAmount;
            });
        } else if (priceOrder === 'Lessthan') {
            filtered = filtered.filter(exp => {
                const expAmount = Number(exp.amount || 0);
                return expAmount <= searchAmount;
            });
        }
        console.log('After amount filter:', filtered.length);
    }
    
    const sortedFiltered = [...filtered].reverse();
    displayExpenses(sortedFiltered);
    updateSummary(filtered);
}

function updateSummary(expenses) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    document.getElementById('monthExpenses').textContent = `₹${monthExpenses.toFixed(2)}`;
    
    const categoryCount = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    let topCategory = 'N/A';
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCount)) {
        if (count > maxCount) {
            maxCount = count;
            topCategory = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        }
    }
    document.getElementById('topCategory').textContent = topCategory;
}

document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', searchExpenses);
    
    const tbody = document.getElementById('expenseTableBody');
    tbody.addEventListener('click', handleExpenseActions);
    
    const saveExpenseEdit = document.getElementById('saveExpenseEdit');
    if (saveExpenseEdit) {
        saveExpenseEdit.addEventListener('click', submitExpenseEditForm);
    }
    
    const cancelExpenseEdit = document.getElementById('cancelExpenseEdit');
    if (cancelExpenseEdit) {
        cancelExpenseEdit.addEventListener('click', () => toggleModal('expenseEditModal', false));
    }
    
    const modal = document.getElementById('expenseEditModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                toggleModal('expenseEditModal', false);
            }
        });
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteExpense);
    }
    
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', cancelDelete);
    }
    
    const deleteModal = document.getElementById('deleteConfirmModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                cancelDelete();
            }
        });
    }
});

function handleExpenseActions(e) {
    const updateBtn = e.target.closest('.expense-update-btn');
    const removeBtn = e.target.closest('.expense-remove-btn');
    
    if (updateBtn) {
        const id = Number(updateBtn.dataset.id);
        openExpenseEditModal(id);
    } else if (removeBtn) {
        const id = Number(removeBtn.dataset.id);
        handleDeleteExpense(id);
    }
}

let pendingDeleteId = null;

function handleDeleteExpense(id) {
    pendingDeleteId = id;
    toggleModal('deleteConfirmModal', true);
}

async function confirmDeleteExpense() {
    if (!pendingDeleteId) return;
    
    try {
        toggleModal('deleteConfirmModal', false);
        await apiService.deleteExpense(pendingDeleteId);
        dataService.clearCache('expenses');
        dataService.clearCache('dashboard');
        dataService.clearCache('monthlyTrends');
        
        pendingDeleteId = null;
        await loadExpenses();
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
        pendingDeleteId = null;
    }
}

function cancelDelete() {
    pendingDeleteId = null;
    toggleModal('deleteConfirmModal', false);
}

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
    }
}

async function populateBankAccountsSelect(selectEl, selectedId = null) {
    if (!selectEl) return;
    try {
        const accounts = await dataService.getAccounts(true);
        selectEl.innerHTML = '';
        if (!accounts || accounts.length === 0) {
            selectEl.innerHTML = '<option value="">No bank accounts found</option>';
            return;
        }
        accounts.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            const suffix = a.verified ? '' : ' (unverified)';
            opt.textContent = `${a.bankName || 'Bank'} - ${a.accountNumber || ''}${suffix}`.trim();
            selectEl.appendChild(opt);
        });
        if (selectedId) {
            selectEl.value = String(selectedId);
        }
    } catch (e) {
        console.error('Failed to load bank accounts:', e);
        selectEl.innerHTML = '<option value="">Unable to load bank accounts</option>';
    }
}

async function openExpenseEditModal(id) {
    const expense = allExpenses.find(exp => exp.id === id);
    if (!expense) {
        console.warn('Expense not found for id', id);
        return;
    }

    const amountInput = document.getElementById('editExpenseAmount');
    const typeSelect = document.getElementById('editExpenseType');
    const bankSelect = document.getElementById('editExpenseBankAccount');
    const idInput = document.getElementById('editExpenseId');

    idInput.value = String(id);
    amountInput.value = Number(expense.amount || 0);

    const cat = String(expense.category || '').toUpperCase();
    let typeValue = 'other';
    if (cat === 'FOOD') typeValue = 'food';
    else if (cat === 'TRANSPORTATION' || cat === 'TRANSPORT') typeValue = 'transport';
    else if (cat === 'SHOPPING') typeValue = 'shopping';
    else if (cat === 'ENTERTAINMENT') typeValue = 'entertainment';
    else if (cat === 'UTILITIES' || cat === 'BILLS') typeValue = 'bills';
    else if (cat === 'HEALTHCARE') typeValue = 'healthcare';
    else if (cat === 'EDUCATION') typeValue = 'education';
    else if (cat === 'TRAVEL') typeValue = 'travel';
    else if (cat === 'INSURANCE') typeValue = 'insurance';
    else if (cat === 'INVESTMENT') typeValue = 'investment';
    typeSelect.value = typeValue;

    await populateBankAccountsSelect(bankSelect, expense.bankAccountId || null);

    toggleModal('expenseEditModal', true);
}

function mapExpenseTypeToEnum(type) {
    const map = {
        'food': 'FOOD',
        'transport': 'TRANSPORTATION',
        'shopping': 'SHOPPING',
        'entertainment': 'ENTERTAINMENT',
        'bills': 'UTILITIES',
        'healthcare': 'HEALTHCARE',
        'education': 'EDUCATION',
        'travel': 'TRAVEL',
        'insurance': 'INSURANCE',
        'investment': 'INVESTMENT',
        'other': 'OTHER'
    };
    return map[type] || 'OTHER';
}

async function submitExpenseEditForm(e) {
    if (e) e.preventDefault();
    const id = Number(document.getElementById('editExpenseId').value);
    const amount = Number(document.getElementById('editExpenseAmount').value);
    const type = document.getElementById('editExpenseType').value;
    const bankSelect = document.getElementById('editExpenseBankAccount');

    const expense = allExpenses.find(exp => exp.id === id);
    const originalDescription = expense?.description || 'Expense';
    const originalNotes = expense?.notes || null;
    let bankAccountId = Number(bankSelect.value) || expense?.bankAccountId || null;

    if (!id || !amount) {
        alert('Please fill in amount');
        return;
    }

    if (!bankAccountId) {
        alert('Please select a bank account or add one first');
        return;
    }

    const payload = {
        description: originalDescription,
        amount,
        category: mapExpenseTypeToEnum(type),
        date: expense?.date || new Date().toISOString().slice(0, 10),
        isRecurring: false,
        recurrenceType: null,
        notes: originalNotes,
        bankAccountId
    };

    try {
        toggleModal('expenseEditModal', false);
        await apiService.updateExpense(id, payload);
        dataService.clearCache('expenses');
        dataService.clearCache('dashboard');
        dataService.clearCache('monthlyTrends');
        
        await loadExpenses();
    } catch (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense. Please try again.');
    }
}
