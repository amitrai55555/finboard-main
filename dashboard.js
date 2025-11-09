// Dashboard JavaScript functionality

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelectorAll('.nav-section a');
const notificationBtn = document.querySelector('.notification-btn');
const addAccountBtn = document.querySelector('.add-account-btn');
const accountMenus = document.querySelectorAll('.account-menu');
const actionBtns = document.querySelectorAll('.action-btn');
const upgradeBtn = document.querySelector('.upgrade-btn');

// Navigation functionality
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove active class from all nav items
        document.querySelectorAll('.nav-section li').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        this.parentElement.classList.add('active');

        // Get the target section
        const href = this.getAttribute('href');
        let target = '';

        if (href.startsWith('#')) {
            target = href.substring(1);
        } else if (href.includes('#')) {
            target = href.split('#')[1];
        }

        console.log(`Navigating to: ${target}`);

        // Scroll to the target section smoothly with offset for navbar
        const targetSection = document.getElementById(target);
        if (targetSection) {
            const navbarHeight = 80; // Height of the fixed navbar
            const targetPosition = targetSection.offsetTop - navbarHeight - 20; // Add extra 20px padding
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // If target section not found, scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // In a real app, you would handle routing here
        // Navigation completed
    });
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length > 2) {
            console.log(`Searching for: ${query}`);
            // In a real app, you would perform the search here
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                // Searching for query
            }
        }
    });
}

// Notification functionality removed

// Add account functionality
if (addAccountBtn) {
    addAccountBtn.addEventListener('click', function() {
        // In a real app, you would open an add account modal
    });
}

// Account menu functionality
accountMenus.forEach(menu => {
    menu.addEventListener('click', function(e) {
        e.stopPropagation();
        // In a real app, you would show account options dropdown
    });
});

// Action buttons functionality
actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.textContent.trim();

        if (action === 'Add Income') {
            // Navigate to add_income.html page
            window.location.href = 'add_income.html';
        } else if (action === 'View Reports') {
            // In a real app, you would navigate to reports
            console.log('Navigating to reports');
        }
    });
});

// Upgrade button functionality
if (upgradeBtn) {
    upgradeBtn.addEventListener('click', function() {
        // In a real app, you would redirect to pricing/upgrade page
    });
}

// Notification system - disabled
function showNotification(message, type = 'info') {
    // Notifications are disabled - no popups will appear
    return;
}

// Notification styles removed - no longer needed

// Sidebar toggle for mobile
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// Add mobile menu button if needed
function addMobileMenuButton() {
    if (window.innerWidth <= 768) {
        const header = document.querySelector('.dashboard-header');
        const existingMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!existingMenuBtn) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            menuBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                color: #4a5568;
                margin-right: 16px;
            `;
            
            menuBtn.addEventListener('click', toggleSidebar);
            
            const headerLeft = document.querySelector('.header-left');
            headerLeft.insertBefore(menuBtn, headerLeft.firstChild);
        }
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    addMobileMenuButton();
    
    // Close sidebar on desktop
    if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
    }
});

// Initialize mobile menu button on load
document.addEventListener('DOMContentLoaded', function() {
    addMobileMenuButton();
});

// Simulate real-time data updates
function updateDashboardData() {
    // Simulate balance updates
    const balanceElement = document.querySelector('.balance-card h3');
    if (balanceElement) {
        // In a real app, you would fetch this from an API
        console.log('Updating dashboard data...');
    }
}

// Update data every 30 seconds (in a real app)
setInterval(updateDashboardData, 30000);

// Handle account card interactions
document.querySelectorAll('.account-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // Don't trigger if clicking on menu button
        if (!e.target.closest('.account-menu')) {
            const accountType = this.querySelector('.account-info h3').textContent;
            // In a real app, you would navigate to account details
        }
    });
});

// Handle stat card interactions
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', function() {
        const statType = this.querySelector('.stat-content p').textContent;
        // In a real app, you would show detailed statistics
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close sidebar on mobile
    if (e.key === 'Escape') {
        sidebar.classList.remove('open');
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
            sidebar.classList.remove('open');
        }
    }
});

// Income and Expense Section Functionality
// Add Income Button
const addIncomeBtn = document.querySelector('.add-income-btn');
if (addIncomeBtn) {
    addIncomeBtn.addEventListener('click', function() {
        // Navigate to add_income.html page
        window.location.href = 'add_income.html';
    });
}

// Back to Dashboard Button
const backToDashboardBtn = document.getElementById('backToDashboardBtn');
if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener('click', function() {
        // Hide add income form and show main dashboard
        document.querySelector('.dashboard-main').style.display = 'block';
        document.getElementById('addIncomeSection').style.display = 'none';
    });
}

// Add Expense Button
const addExpenseBtn = document.querySelector('.add-expense-btn');
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', function() {
        window.location.href = 'add_expense.html';
    });
}

// Add Transaction Button
const addTransactionBtn = document.querySelector('.add-transaction-btn');
if (addTransactionBtn) {
    addTransactionBtn.addEventListener('click', function() {
        window.location.href = 'add_transaction.html';
    });
}

// Filter Buttons
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Filter options coming soon
    });
});

// Time Filter Dropdowns
const timeFilters = document.querySelectorAll('.time-filter');
timeFilters.forEach(filter => {
    filter.addEventListener('change', function() {
        // Time filter changed
    });
});

// Load more transactions
const loadMoreBtn = document.querySelector('.load-more-btn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
        // Simulate loading more transactions
        setTimeout(() => {
            // More transactions loaded
        }, 1000);
    });
}

// Financial Goals functionality
const addGoalBtn = document.querySelector('.add-goal-btn');
if (addGoalBtn) {
    addGoalBtn.addEventListener('click', function() {
        window.location.href = 'add_goal.html';
    });
}

// Animate progress bars on load
const progressBars = document.querySelectorAll('.progress-fill');
progressBars.forEach((bar, index) => {
    const width = bar.style.width;
    bar.style.width = '0%';
    
    setTimeout(() => {
        bar.style.width = width;
    }, 500 + (index * 200));
});

// Multi-Currency functionality
const addCurrencyBtn = document.querySelector('.add-currency-btn');
if (addCurrencyBtn) {
    addCurrencyBtn.addEventListener('click', function() {
        // Add Currency feature coming soon
    });
}

const currencyFilter = document.querySelector('.currency-filter');
if (currencyFilter) {
    currencyFilter.addEventListener('change', function() {
        const selectedCurrency = this.value;
        const currencyCards = document.querySelectorAll('.currency-card');

        currencyCards.forEach(card => {
            if (selectedCurrency === 'all') {
                card.style.display = 'flex';
            } else {
                if (card.classList.contains(selectedCurrency)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            }
        });

        // Filtered currencies
    });
}

// Animate currency cards on hover - removed transform to avoid layout shifts
const currencyCards = document.querySelectorAll('.currency-card');
currencyCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        // no-op
    });
    card.addEventListener('mouseleave', function() {
        // no-op
    });
});

// Animate goal cards on hover - removed transform to avoid layout shifts
const goalCards = document.querySelectorAll('.goal-card');
goalCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        // no-op
    });
    card.addEventListener('mouseleave', function() {
        // no-op
    });
});

// Animate SVG chart paths
const svgPaths = document.querySelectorAll('.trend-svg path');
svgPaths.forEach((path, index) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 2s ease-in-out';
        path.style.strokeDashoffset = 0;
    }, 1000 + (index * 300));
});

// Investment Portfolio functionality
const addInvestmentBtn = document.querySelector('.add-investment-btn');
if (addInvestmentBtn) {
    addInvestmentBtn.addEventListener('click', function() {
        window.location.href = 'add_investment.html';
    });
}

const portfolioFilter = document.querySelector('.portfolio-filter');
if (portfolioFilter) {
    portfolioFilter.addEventListener('change', function() {
        const selectedType = this.value;
        // Filtered holdings
    });
}

// Animate portfolio performance chart
const performancePath = document.querySelector('.performance-svg path[stroke="#4F46E5"]');
if (performancePath) {
    const length = performancePath.getTotalLength();
    performancePath.style.strokeDasharray = length;
    performancePath.style.strokeDashoffset = length;
    
    setTimeout(() => {
        performancePath.style.transition = 'stroke-dashoffset 3s ease-in-out';
        performancePath.style.strokeDashoffset = 0;
    }, 1500);
}

// Holding items hover effects - removed transform to avoid layout shifts
const holdingItems = document.querySelectorAll('.holding-item');
holdingItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        // no-op
    });
    item.addEventListener('mouseleave', function() {
        // no-op
    });
});

// AI Financial Advisor functionality
const askAdvisorBtn = document.querySelector('.ask-advisor-btn');
if (askAdvisorBtn) {
    askAdvisorBtn.addEventListener('click', function() {
        // AI Advisor chat feature coming soon
    });
}

const adviceFilter = document.querySelector('.advice-filter');
if (adviceFilter) {
    adviceFilter.addEventListener('change', function() {
        const selectedAdvice = this.value;
        // Filtered advice
    });
}

const chatBtn = document.querySelector('.chat-btn');
if (chatBtn) {
    chatBtn.addEventListener('click', function() {
        setTimeout(() => {
            // FinBot ready
        }, 1000);
    });
}

// Action buttons in recommendations
const recommendationActionBtns = document.querySelectorAll('.action-btn');
recommendationActionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.textContent.trim();
        // Action triggered
    });
});

// Animate insight score bars
const scoreFills = document.querySelectorAll('.score-fill');
scoreFills.forEach((fill, index) => {
    const width = fill.style.width;
    fill.style.width = '0%';
    
    setTimeout(() => {
        fill.style.width = width;
    }, 2000 + (index * 300));
});

// Recommendation items hover effects - removed transform to avoid layout shifts
const recommendationItems = document.querySelectorAll('.recommendation-item');
recommendationItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        // no-op
    });
    item.addEventListener('mouseleave', function() {
        // no-op
    });
});

// Insight cards hover effects - removed transform to avoid layout shifts
const insightCards = document.querySelectorAll('.insight-card');
insightCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        // no-op
    });
    card.addEventListener('mouseleave', function() {
        // no-op
    });
});

// Income Item Hover Effects - removed transform to avoid layout shifts
const incomeItems = document.querySelectorAll('.income-item');
incomeItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        // no-op
    });
    item.addEventListener('mouseleave', function() {
        // no-op
    });
});

// Category Item Hover Effects - removed transform to avoid layout shifts
const categoryItems = document.querySelectorAll('.category-item');
categoryItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        // no-op
    });
    item.addEventListener('mouseleave', function() {
        // no-op
    });
});

// Transaction Item Click Events
const transactionItems = document.querySelectorAll('.transaction-item');
transactionItems.forEach(item => {
    item.addEventListener('click', function() {
        const transactionName = this.querySelector('h4').textContent;
        // Viewing transaction details
    });
});

// Chart Bar Hover Effects with Data Display
const chartBars = document.querySelectorAll('.chart-bar');
chartBars.forEach((bar) => {
    bar.addEventListener('mouseenter', function() {
        // No dummy income amounts; real values will be shown when integrated with data
    });
});

// Trend Bar Hover Effects
const trendBars = document.querySelectorAll('.trend-bar');
trendBars.forEach((bar, index) => {
    const expenses = ['₹0', '₹0', '₹0', '₹0', '₹0', '₹0'];
    bar.addEventListener('mouseenter', function() {
        if (expenses[index]) {
            // Show expenses
        }
    });
});

// Animate chart bars on page load
function animateCharts() {
    const chartBars = document.querySelectorAll('.chart-bar');
    const trendBars = document.querySelectorAll('.trend-bar');
    
    // When no real data is available, do not set arbitrary heights.
    chartBars.forEach((bar) => {
        // Keep default CSS height; real data updates should adjust these.
    });

    trendBars.forEach((bar) => {
        // Keep default CSS height; real data updates should adjust these.
    });
}

// Call chart animation after page load
window.addEventListener('load', animateCharts);

// Admin Dashboard functionality
const adminFilter = document.querySelector('.admin-filter');
const addUserBtn = document.querySelector('.add-user-btn');
const userItems = document.querySelectorAll('.user-item');
const userActionBtns = document.querySelectorAll('.user-actions .action-btn');

if (adminFilter) {
    adminFilter.addEventListener('change', function() {
        const filterValue = this.value;
        userItems.forEach(item => {
            if (filterValue === 'all') {
                item.style.display = 'grid';
            } else {
                const userStatus = item.querySelector('.user-status').textContent.toLowerCase().trim();
                item.style.display = userStatus === filterValue ? 'grid' : 'none';
            }
        });
    });
}

if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
        // Add User feature coming soon
    });
}

userActionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.classList.contains('edit') ? 'Edit' : 'Delete';
        const userName = this.closest('.user-item').querySelector('.user-details h4').textContent;
        // User action feature coming soon
    });
});

// Animate admin stat cards on load
const adminStatCards = document.querySelectorAll('.admin-stat-card');
adminStatCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 200 + (index * 100));
});

// Animate system metrics progress bars
const metricProgressBars = document.querySelectorAll('.metric-progress .progress-fill');
metricProgressBars.forEach((bar, index) => {
    const width = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
        bar.style.width = width;
    }, 1000 + (index * 300));
});

// Financial Reports functionality
const reportPeriod = document.querySelector('.report-period');
const exportReportBtn = document.querySelector('.export-report-btn');

if (reportPeriod) {
    reportPeriod.addEventListener('change', function() {
        const period = this.value;
        // Filtering reports

        // Animate chart refresh
        const trendChart = document.querySelector('.trend-chart-svg');
        const donutChart = document.querySelector('.donut-svg');

        if (trendChart) {
            trendChart.style.opacity = '0.5';
            setTimeout(() => {
                trendChart.style.opacity = '1';
            }, 300);
        }

        if (donutChart) {
            donutChart.style.opacity = '0.5';
            setTimeout(() => {
                donutChart.style.opacity = '1';
            }, 300);
        }
    });
}

if (exportReportBtn) {
    exportReportBtn.addEventListener('click', function() {
        // Simulate export process
        setTimeout(() => {
            // Report exported
        }, 2000);
    });
}

// Animate trend chart lines on load
const trendLines = document.querySelectorAll('.trend-line');
trendLines.forEach((line, index) => {
    const pathLength = line.getTotalLength();
    line.style.strokeDasharray = pathLength + ' ' + pathLength;
    line.style.strokeDashoffset = pathLength;
    
    setTimeout(() => {
        line.style.transition = 'stroke-dashoffset 2s ease-in-out';
        line.style.strokeDashoffset = '0';
    }, 500 + (index * 200));
});

// Animate donut chart segments
const donutSegments = document.querySelectorAll('.donut-segment');
donutSegments.forEach((segment, index) => {
    const circumference = 2 * Math.PI * 70; // radius = 70
    const percentage = parseFloat(segment.getAttribute('data-percentage')) || 0;
    const offset = circumference - (percentage / 100) * circumference;
    
    segment.style.strokeDasharray = circumference;
    segment.style.strokeDashoffset = circumference;
    
    setTimeout(() => {
        segment.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        segment.style.strokeDashoffset = offset;
    }, 800 + (index * 200));
});

// Animate summary cards on scroll
const summaryCards = document.querySelectorAll('.summary-card');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const summaryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

summaryCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    summaryObserver.observe(card);
});

// Add CSS animation for summary cards
(function addSummaryCardStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(styleEl);
})();

// Hover effects for breakdown items
const breakdownItems = document.querySelectorAll('.breakdown-item');
breakdownItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(8px)';
        this.style.transition = 'transform 0.2s ease';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

console.log('Dashboard JavaScript loaded successfully!');

// Update user profile name and welcome message
function updateUserInfo() {
    const userData = sessionStorage.getItem('fintrackr_user');
    let username = 'User';
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            username = user.username || user.name || 'User';
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    // Update user profile name
    const userProfileName = document.querySelector('.user-profile span');
    if (userProfileName) {
        userProfileName.textContent = username;
    }

    // Update welcome message
    const welcomeHeading = document.querySelector('.welcome-text h2');
    if (welcomeHeading) {
        welcomeHeading.innerHTML = `Welcome back, <span style="font-weight: 900; color: #0efff0">${username}</span>!`;
    }
}

// Load incomes from API and display
async function loadIncomes() {
    const incomeList = document.querySelector('.income-list');
    if (!incomeList) return;

    try {
        // Show loading state
        incomeList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading incomes...</div>';
        
        const incomes = await dataService.getIncome();
        incomeList.innerHTML = '';
        
        if (incomes.length === 0) {
            incomeList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No income records yet. Add your first income to get started!</p>';
            return;
        }
        
        incomes.forEach(income => {
            const item = document.createElement('div');
            item.className = 'income-item';
            item.innerHTML = `
                <div class="income-icon ${income.category ? income.category.toLowerCase() : 'other'}">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div class="income-details">
                    <h4>${income.category ? income.category.charAt(0).toUpperCase() + income.category.slice(1) : 'Income'}</h4>
                    <p>${income.description || income.source || 'Income source'}</p>
                </div>
                <div class="income-amount">₹${income.amount.toFixed(2)}</div>
            `;
            incomeList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading incomes:', error);
        incomeList.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 20px;">Error loading incomes. Please try again later.</p>';
    }
}

// Load expenses from API and display
async function loadExpenses() {
    const expenseList = document.querySelector('.expense-list');
    if (!expenseList) return;

    try {
        // Show loading state
        expenseList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading expenses...</div>';
        
        const expenses = await dataService.getExpenses();
        expenseList.innerHTML = '';
        
        if (expenses.length === 0) {
            expenseList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No expense records yet. Add your first expense to get started!</p>';
            return;
        }
        
        expenses.forEach(expense => {
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div class="expense-icon ${expense.category ? expense.category.toLowerCase() : 'other'}">
                    <i class="fas fa-tag"></i>
                </div>
                <div class="expense-details">
                    <h4>${expense.category ? expense.category.charAt(0).toUpperCase() + expense.category.slice(1) : 'Expense'}</h4>
                    <p>${expense.description || expense.merchant || 'Expense details'}</p>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
            `;
            expenseList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading expenses:', error);
        expenseList.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 20px;">Error loading expenses. Please try again later.</p>';
    }
}

// Load accounts from data service and display
async function loadAccounts() {
    const accountList = document.querySelector('.accounts-grid');
    if (!accountList) return;

    try {
        // Show loading state
        accountList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading accounts...</div>';
        
        const accounts = await dataService.getAccounts();
        accountList.innerHTML = '';
        
        if (accounts.length === 0) {
            accountList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No accounts yet. Add your first account to get started!</p>';
            return;
        }
        
        accounts.forEach(account => {
            const card = document.createElement('div');
            card.className = 'account-card';
            card.innerHTML = `
                <div class="account-icon"><i class="fas fa-university"></i></div>
                <div class="account-info">
                    <h3>${account.name}</h3>
                    <p>${account.bank || account.type || 'Account'}</p>
                </div>
                <div class="account-balance">₹${(account.balance || 0).toFixed(2)}</div>
                <div class="account-meta">
                    <span>${account.currency || ''}</span>
                    <span>${account.number ? '•••• ' + String(account.number).slice(-4) : ''}</span>
                </div>
            `;
            accountList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading accounts:', error);
        accountList.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Error loading accounts. Please try again later.</p>';
    }
}

// Load goals from API and display
async function loadGoals() {
    const goalsGrid = document.querySelector('.goals-grid');
    if (!goalsGrid) return;

    try {
        // Show loading state
        goalsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading goals...</div>';
        
        const goals = await dataService.getGoals();
        goalsGrid.innerHTML = '';
        
        if (goals.length === 0) {
            goalsGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No financial goals yet. Add your first goal to start tracking!</p>';
            return;
        }

        goals.forEach(goal => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const targetDate = new Date(goal.targetDate);
            const today = new Date();
            const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

            const item = document.createElement('div');
            item.className = `goal-card priority-${goal.priority || 'medium'}`;
            item.innerHTML = `
                <div class="goal-header">
                    <div class="goal-icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="goal-info">
                        <h3>${goal.name}</h3>
                        <p>${goal.category ? goal.category.charAt(0).toUpperCase() + goal.category.slice(1) : 'Goal'}</p>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>₹${goal.currentAmount.toLocaleString()} / ₹${goal.targetAmount.toLocaleString()}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="goal-details">
                    <div class="goal-metric">
                        <span class="label">Remaining</span>
                        <span class="value">₹${remaining.toLocaleString()}</span>
                    </div>
                    <div class="goal-metric">
                        <span class="label">Days Left</span>
                        <span class="value">${daysLeft > 0 ? daysLeft : 'Overdue'}</span>
                    </div>
                </div>
            `;
            goalsGrid.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading goals:', error);
        goalsGrid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Error loading goals. Please try again later.</p>';
    }
}

// Load investments from API and display
async function loadInvestments() {
    const portfolioTable = document.querySelector('.portfolio-table');
    if (!portfolioTable) return;

    try {
        // Show loading state
        portfolioTable.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading investments...</div>';
        
        const investments = await dataService.getInvestments();
        
        // Clear existing content except header
        const tableHeader = portfolioTable.querySelector('.table-header');
        portfolioTable.innerHTML = '';
        if (tableHeader) {
            portfolioTable.appendChild(tableHeader);
        }

        if (investments.length === 0) {
            const noData = document.createElement('div');
            noData.className = 'no-data';
            noData.innerHTML = '<p>No investments yet. Add your first investment to start tracking your portfolio!</p>';
            portfolioTable.appendChild(noData);
            return;
        }

        investments.forEach(investment => {
            const pnl = investment.currentValue - investment.amount;
            const pnlPercentage = investment.amount > 0 ? (pnl / investment.amount) * 100 : 0;

            const item = document.createElement('div');
            item.className = 'holding-item';
            item.innerHTML = `
                <span class="holding-name">
                    <div class="holding-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="holding-details">
                        <span class="name">${investment.name}</span>
                        <span class="type">${investment.type ? investment.type.replace('-', ' ').toUpperCase() : 'INVESTMENT'}</span>
                    </div>
                </span>
                <span class="holding-quantity">${investment.quantity > 0 ? investment.quantity.toLocaleString() : '-'}</span>
                <span class="holding-price">₹${(investment.amount / (investment.quantity || 1)).toFixed(2)}</span>
                <span class="holding-value">₹${investment.currentValue.toLocaleString()}</span>
                <span class="holding-change ${pnl >= 0 ? 'positive' : 'negative'}">
                    ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)} (${pnlPercentage.toFixed(2)}%)
                </span>
            `;
            portfolioTable.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading investments:', error);
        portfolioTable.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Error loading investments. Please try again later.</p>';
    }
}

// Fetch users from API
function fetchUsers() {
    apiService.getUsers()
        .then(data => {
            console.log('Users data:', data);
            displayUsers(data);
            // Users loaded
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            // Failed to fetch users
        });
}

// Display users in admin panel
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (Array.isArray(users)) {
        usersList.innerHTML = '<h4>Users:</h4><ul>' + users.map(user => `<li>${user.name || user.email || JSON.stringify(user)}</li>`).join('') + '</ul>';
    } else {
        usersList.innerHTML = '<p>No users data available.</p>';
    }
}

// Setup admin panel visibility
function setupAdminPanel() {
    const userData = sessionStorage.getItem('fintrackr_user');
    let isAdmin = false;
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            isAdmin = user.role === 'admin' || user.isAdmin === true;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = isAdmin ? 'block' : 'none';
        if (isAdmin) {
            // Add event listener for fetch users button
            const fetchUsersBtn = document.getElementById('fetchUsersBtn');
            if (fetchUsersBtn) {
                fetchUsersBtn.addEventListener('click', fetchUsers);
            }
        }
    }
}

// Setup navigation and event handlers for dashboard page
function setupDashboardNavigation() {
    // Add Income button
    const addIncomeBtn = document.querySelector('.add-income-btn');
    if (addIncomeBtn) {
        addIncomeBtn.addEventListener('click', () => {
            // Navigate to add_income.html page
            window.location.href = 'add_income.html';
        });
    }

    // Back to Dashboard button in Add Income form
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            document.querySelector('.dashboard-main').style.display = 'block';
            document.getElementById('addIncomeSection').style.display = 'none';
        });
    }

    // Add Account button
    const addAccountBtn = document.querySelector('.add-account-btn');
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', () => {
            window.location.href = 'add_account.html';
        });
    }

    // Add Expense button
    const addExpenseBtn = document.querySelector('.add-expense-btn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => {
            window.location.href = 'add_expense.html';
        });
    }
}

// Initialize dashboard page
async function initializeDashboard() {
    try {
        // Check authentication
        const userData = sessionStorage.getItem('fintrackr_user');
        if (!userData) {
            window.location.href = 'index.html';
            return;
        }

        // Load all data with error handling
        try {
            await Promise.all([
                loadIncomes(),
                loadExpenses(),
                loadAccounts(),
                loadGoals(),
                loadInvestments()
            ]);
        } catch (dataError) {
            console.log('Some data services not available, using mock data');
            // Continue with dashboard even if some data services fail
        }

        // Setup navigation and admin panel
        setupDashboardNavigation();
        setupAdminPanel();

        // Update dashboard summary
        try {
            await updateDashboardSummary();
        } catch (summaryError) {
            console.log('Dashboard summary not available, using default values');
        }

        // Dashboard loaded
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        // Dashboard loaded with limited functionality
    }
}

// Update dashboard summary with real data
async function updateDashboardSummary() {
    try {
        const summary = await dataService.getDashboardSummary();
        
        // Update balance cards
        const totalBalanceEl = document.querySelector('.balance-card h3');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = `₹${summary.totalBalance.toLocaleString()}`;
        }
        
        // Update income/expense summary
        const incomeAmountEl = document.querySelector('.balance-item:first-child .amount');
        const expenseAmountEl = document.querySelector('.balance-item:last-child .amount');
        if (incomeAmountEl) incomeAmountEl.textContent = `₹${summary.monthlyIncome.toLocaleString()}`;
        if (expenseAmountEl) expenseAmountEl.textContent = `₹${summary.monthlyExpenses.toLocaleString()}`;
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 3) {
            statCards[0].querySelector('h3').textContent = `₹${summary.monthlyIncome.toLocaleString()}`;
            statCards[1].querySelector('h3').textContent = `₹${summary.monthlyExpenses.toLocaleString()}`;
            statCards[2].querySelector('h3').textContent = `₹${summary.monthlySavings.toLocaleString()}`;
        }
        
        console.log('Dashboard summary updated:', summary);
    } catch (error) {
        console.error('Error updating dashboard summary:', error);
    }
}

// Update user profile name and welcome message with secure token manager
// Removed duplicate updateUserInfo definition

// Initialize mock data for demo purposes
function initializeMockData() {
    // Mock data disabled for production: return early to keep dashboards fresh for new users
    return;
}

// Demo toggle: set to true only when you want demo data to be seeded
window.FINTRACKR_DEMO = window.FINTRACKR_DEMO === true;

// Call on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.FINTRACKR_DEMO) {
        initializeMockData();
    }
    updateUserInfo();
    // Set dynamic date in welcome section
    const dateEl = document.getElementById('welcomeDate');
    if (dateEl) {
        const now = new Date();
        const formatted = now.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateEl.textContent = formatted;
    }

    initializeDashboard();
});



// Reset charts function
function resetCharts() {
    // Reset income chart bars
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        bar.style.height = '0%';
        bar.style.transition = 'height 0.5s ease-in-out';
    });

    // Reset expense trend bars
    const trendBars = document.querySelectorAll('.trend-bar');
    trendBars.forEach(bar => {
        bar.style.height = '0%';
        bar.style.transition = 'height 0.5s ease-in-out';
    });

    // Reset SVG chart paths
    const svgPaths = document.querySelectorAll('.trend-svg path, .performance-svg path');
    svgPaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
    });

    // Reset donut chart segments
    const donutSegments = document.querySelectorAll('.donut-segment');
    donutSegments.forEach(segment => {
        const circumference = 2 * Math.PI * 70; // radius = 70
        segment.style.strokeDasharray = circumference;
        segment.style.strokeDashoffset = circumference;
        segment.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
    });

    // Reset trend chart lines
    const trendLines = document.querySelectorAll('.trend-line');
    trendLines.forEach(line => {
        const pathLength = line.getTotalLength();
        line.style.strokeDasharray = pathLength + ' ' + pathLength;
        line.style.strokeDashoffset = pathLength;
        line.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
    });

    console.log('Charts have been reset!');
}

// Reset dummy data function
function resetUserData() {
    // Clear only user financial data, preserve authentication/session information
    localStorage.removeItem('incomes');
    localStorage.removeItem('expenses');
    localStorage.removeItem('accounts');
    localStorage.removeItem('goals');
    localStorage.removeItem('investments');

    // Reset charts visuals
    resetCharts();

    console.log('Your financial data has been cleared.');
    // Financial data cleared
}

// Initialize dashboard without resetting data
// resetDummyData(); // Commented out to preserve user data

// Call immediately and also on DOM ready
updateUserInfo();
document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();
    initializeDashboard();
});

// Initialize basic components
async function initializeBasicComponents() {
    try {
        // Setup logout functionality
        setupLogoutFunctionality();
        
        console.log('Basic components initialized');
    } catch (error) {
        console.error('Failed to initialize basic components:', error);
    }
}

// Setup logout functionality
function setupLogoutFunctionality() {
    // Try to attach logout to an explicit logout button if present in the page
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogoutConfirmation();
        });
    }
}

// Show logout confirmation
function showLogoutConfirmation() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
}

// Enhanced logout function
async function logout() {
    try {
        await apiService.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear user data and redirect
        sessionStorage.removeItem('fintrackr_user');
        window.location.href = 'index.html';
    }
}

// Also call after a short delay to ensure elements are loaded
setTimeout(() => {
    updateUserInfo();
    initializeDashboard();
}, 100);
