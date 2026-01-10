let allIncomes = [];

async function loadIncomes() {
    try {
        let incomes = await dataService.getIncome(true);
        
        if (!incomes || incomes.length === 0) {
            console.log('No incomes from /api/income, trying dashboard overview recentIncomes');
            
            try {
                const summary = await dataService.getDashboardSummary(false);
                const recentIncomes = Array.isArray(summary?.recentIncomes) ? summary.recentIncomes : [];
                
                if (recentIncomes.length > 0) {
                    console.log('Using recentIncomes from dashboard overview to populate income list');
                    incomes = recentIncomes;
                } else {
                    console.log('No incomes from dashboard either, checking localStorage...');
                    const localIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
                    if (localIncomes && localIncomes.length > 0) {
                        console.log('Found incomes in localStorage:', localIncomes);
                        incomes = localIncomes;
                    } else {
                        document.getElementById('incomeTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No incomes found. Add your first income to get started!</td></tr>';
                        document.getElementById('totalIncome').textContent = '₹0';
                        document.getElementById('monthIncome').textContent = '₹0';
                        document.getElementById('topCategory').textContent = 'N/A';
                        return;
                    }
                }
            } catch (summaryError) {
                console.error('Error loading dashboard summary for incomes:', summaryError);
                const localIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
                if (localIncomes && localIncomes.length > 0) {
                    console.log('Using localStorage fallback');
                    incomes = localIncomes;
                } else {
                    document.getElementById('incomeTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No incomes found. Add your first income to get started!</td></tr>';
                    document.getElementById('totalIncome').textContent = '₹0';
                    document.getElementById('monthIncome').textContent = '₹0';
                    document.getElementById('topCategory').textContent = 'N/A';
                    return;
                }
            }
        }

        console.log('Loading incomes:', incomes);
        allIncomes = incomes;
        const latestIncomes = [...incomes].reverse().slice(0, 5);
        displayIncomes(latestIncomes);
        updateSummary(incomes);
    } catch (error) {
        console.error('Error loading incomes:', error);
        const localIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
        if (localIncomes && localIncomes.length > 0) {
            console.log('Error occurred, using localStorage fallback');
            allIncomes = localIncomes;
            const latestIncomes = [...localIncomes].reverse().slice(0, 5);
            displayIncomes(latestIncomes);
            updateSummary(localIncomes);
        } else {
            document.getElementById('incomeTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ff6b6b;">Error loading incomes. Please check your connection.</td></tr>';
        }
    }
}

function displayIncomes(incomes) {
    const tbody = document.getElementById('incomeTableBody');
    tbody.innerHTML = '';
    
    if (incomes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No matching incomes found</td></tr>';
        return;
    }
    
    incomes.forEach(income => {
        const row = document.createElement('tr');
        row.setAttribute('data-income-id', income.id);
        
        const incomeDate = income.date ? new Date(income.date).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        }) : 'N/A';
        
        const category = income.category ? income.category.charAt(0).toUpperCase() + income.category.slice(1).toLowerCase() : 'N/A';
        const description = income.description || income.source || 'No description';
        const amount = Number(income.amount).toFixed(2);
        
        row.innerHTML = `
            <td>${incomeDate}</td>
            <td>${category}</td>
            <td>${description}</td>
            <td>₹${amount}</td>
            <td>
                <button class="income-update-btn" data-id="${income.id}" style="margin-right: 8px;">Update</button>
                <button class="income-remove-btn" data-id="${income.id}">Remove</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function searchIncomes() {
    console.log('Search button clicked');
    const amountInput = document.getElementById('amountInput').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const categoryFilter = document.getElementById('incomeCategory').value;
    const priceOrder = document.getElementById('priceOrder').value;
    
    console.log('Search params:', { amountInput, timeFilter, categoryFilter, priceOrder });
    
    let filtered = [...allIncomes];
    console.log('Total incomes:', filtered.length);
    
    if (timeFilter && timeFilter !== 'Alltime') {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        filtered = filtered.filter(inc => {
            const incDate = new Date(inc.date);
            if (timeFilter === 'last7days') {
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                return incDate >= sevenDaysAgo && incDate <= now;
            } else if (timeFilter === 'Thismonth') {
                return incDate.getMonth() === now.getMonth() && incDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
        console.log('After time filter:', filtered.length);
    }
    
    if (categoryFilter && categoryFilter !== 'All') {
        filtered = filtered.filter(inc => {
            const incCategory = String(inc.category || '').toUpperCase();
            const searchCategory = categoryFilter.toUpperCase();
            const categoryMap = {
                'SALARY': 'SALARY',
                'FREELANCE': 'FREELANCE',
                'BUSINESS': 'BUSINESS',
                'INVESTMENT': 'INVESTMENTS',
                'RENTAL': 'RENTAL',
                'DIVIDEND': 'DIVIDEND',
                'BONUS': 'BONUS',
                'OTHER': 'OTHER'
            };
            const mappedCategory = categoryMap[searchCategory] || searchCategory;
            return incCategory === searchCategory || incCategory === mappedCategory;
        });
        console.log('After category filter:', filtered.length);
    }
    
    if (amountInput) {
        const searchAmount = Number(amountInput);
        if (priceOrder === 'Exactamount') {
            filtered = filtered.filter(inc => {
                const incAmount = Number(inc.amount || 0);
                return Math.abs(incAmount - searchAmount) < 0.01;
            });
        } else if (priceOrder === 'Morethan') {
            filtered = filtered.filter(inc => {
                const incAmount = Number(inc.amount || 0);
                return incAmount >= searchAmount;
            });
        } else if (priceOrder === 'Lessthan') {
            filtered = filtered.filter(inc => {
                const incAmount = Number(inc.amount || 0);
                return incAmount <= searchAmount;
            });
        }
        console.log('After amount filter:', filtered.length);
    }
    
    const sortedFiltered = [...filtered].reverse();
    displayIncomes(sortedFiltered);
    updateSummary(filtered);
}

function updateSummary(incomes) {
    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
    document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthIncome = incomes.filter(inc => {
        const incDate = new Date(inc.date);
        return incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear;
    }).reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
    document.getElementById('monthIncome').textContent = `₹${monthIncome.toFixed(2)}`;
    
    const categoryCount = {};
    incomes.forEach(inc => {
        const cat = inc.category || 'Other';
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
    loadIncomes();
    
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', searchIncomes);
    
    const tbody = document.getElementById('incomeTableBody');
    tbody.addEventListener('click', handleIncomeActions);
    
    const categories = document.querySelectorAll(".category");
    categories.forEach(category => {
        category.addEventListener("click", () => {
            categories.forEach(c => c.classList.remove("active"));
            category.classList.add("active");
            
            const categoryText = category.textContent.trim();
            const categorySelect = document.getElementById('incomeCategory');
            
            const categoryMap = {
                'Salary': 'salary',
                'Freelance': 'freelance',
                'Business': 'business',
                'Investment': 'investment',
                'Rental Income': 'rental'
            };
            
            const categoryValue = categoryMap[categoryText] || '';
            categorySelect.value = categoryValue;
            
            searchIncomes();
        });
    });
    
    const saveIncomeEdit = document.getElementById('saveIncomeEdit');
    if (saveIncomeEdit) {
        saveIncomeEdit.addEventListener('click', submitIncomeEditForm);
    }
    
    const cancelIncomeEdit = document.getElementById('cancelIncomeEdit');
    if (cancelIncomeEdit) {
        cancelIncomeEdit.addEventListener('click', () => toggleModal('incomeEditModal', false));
    }
    
    const modal = document.getElementById('incomeEditModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                toggleModal('incomeEditModal', false);
            }
        });
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteIncome);
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

function handleIncomeActions(e) {
    const updateBtn = e.target.closest('.income-update-btn');
    const removeBtn = e.target.closest('.income-remove-btn');
    
    if (updateBtn) {
        const id = Number(updateBtn.dataset.id);
        openIncomeEditModal(id);
    } else if (removeBtn) {
        const id = Number(removeBtn.dataset.id);
        handleDeleteIncome(id);
    }
}

let pendingDeleteId = null;

function handleDeleteIncome(id) {
    pendingDeleteId = id;
    toggleModal('deleteConfirmModal', true);
}

async function confirmDeleteIncome() {
    if (!pendingDeleteId) return;
    
    try {
        toggleModal('deleteConfirmModal', false);
        await apiService.deleteIncome(pendingDeleteId);
        dataService.clearCache('incomes');
        dataService.clearCache('dashboard');
        dataService.clearCache('monthlyTrends');
        
        pendingDeleteId = null;
        await loadIncomes();
    } catch (error) {
        console.error('Error deleting income:', error);
        alert('Failed to delete income. Please try again.');
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

async function openIncomeEditModal(id) {
    const income = allIncomes.find(inc => inc.id === id);
    if (!income) {
        console.warn('Income not found for id', id);
        return;
    }

    const amountInput = document.getElementById('editIncomeAmount');
    const typeSelect = document.getElementById('editIncomeType');
    const bankSelect = document.getElementById('editIncomeBankAccount');
    const idInput = document.getElementById('editIncomeId');

    idInput.value = String(id);
    amountInput.value = Number(income.amount || 0);

    const cat = String(income.category || '').toUpperCase();
    let typeValue = 'other';
    if (cat === 'SALARY') typeValue = 'salary';
    else if (cat === 'FREELANCE') typeValue = 'freelance';
    else if (cat === 'BUSINESS') typeValue = 'business';
    else if (cat === 'INVESTMENTS' || cat === 'INVESTMENT') typeValue = 'investment';
    else if (cat === 'RENTAL') typeValue = 'rental';
    else if (cat === 'BONUS') typeValue = 'bonus';
    else if (cat === 'DIVIDEND') typeValue = 'dividend';
    typeSelect.value = typeValue;

    await populateBankAccountsSelect(bankSelect, income.bankAccountId || null);

    toggleModal('incomeEditModal', true);
}

function mapIncomeTypeToEnum(type) {
    const map = {
        'salary': 'SALARY',
        'freelance': 'FREELANCE',
        'business': 'BUSINESS',
        'investment': 'INVESTMENTS',
        'rental': 'RENTAL',
        'dividend': 'DIVIDEND',
        'bonus': 'BONUS',
        'other': 'OTHER'
    };
    return map[type] || 'OTHER';
}

async function submitIncomeEditForm(e) {
    if (e) e.preventDefault();
    const id = Number(document.getElementById('editIncomeId').value);
    const amount = Number(document.getElementById('editIncomeAmount').value);
    const type = document.getElementById('editIncomeType').value;
    const bankSelect = document.getElementById('editIncomeBankAccount');

    const income = allIncomes.find(inc => inc.id === id);
    const originalDescription = income?.description || 'Income';
    const originalNotes = income?.notes || null;
    let bankAccountId = Number(bankSelect.value) || income?.bankAccountId || null;

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
        category: mapIncomeTypeToEnum(type),
        date: income?.date || new Date().toISOString().slice(0, 10),
        isRecurring: false,
        recurrenceType: null,
        notes: originalNotes,
        bankAccountId
    };

    try {
        toggleModal('incomeEditModal', false);
        await apiService.updateIncome(id, payload);
        dataService.clearCache('incomes');
        dataService.clearCache('dashboard');
        dataService.clearCache('monthlyTrends');
        
        await loadIncomes();
    } catch (error) {
        console.error('Error updating income:', error);
        alert('Failed to update income. Please try again.');
    }
}
