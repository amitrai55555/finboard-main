// Data Service Layer - Manages frontend data with API integration
class DataService {
    constructor() {
        this.cache = {
            accounts: null,
            incomes: null,
            expenses: null,
            goals: null,
            investments: null,
            user: null,
            dashboard: null,
            monthlyTrends: null
        };
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
        this.lastFetch = {};
    }

    // Check if cached data is still valid
    isCacheValid(dataType) {
        const lastFetchTime = this.lastFetch[dataType];
        if (!lastFetchTime || !this.cache[dataType]) return false;
        return Date.now() - lastFetchTime < this.cacheExpiry;
    }

    // Set cache with timestamp
    setCache(dataType, data) {
        this.cache[dataType] = data;
        this.lastFetch[dataType] = Date.now();
    }

    // Clear cache for specific data type or all
    clearCache(dataType = null) {
        if (dataType) {
            this.cache[dataType] = null;
            delete this.lastFetch[dataType];
        } else {
            this.cache = {
                accounts: null,
                incomes: null,
                expenses: null,
                goals: null,
                investments: null,
                user: null,
                dashboard: null,
                monthlyTrends: null
            };
            this.lastFetch = {};
        }
    }

    // Show loading indicator
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        }
    }

    // Hide loading indicator
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const loader = element.querySelector('.loading-spinner');
            if (loader) loader.remove();
        }
    }

    // Accounts: removed (not supported by backend)

    // Income management
    async getIncome(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('incomes')) {
            return this.cache.incomes;
        }

        try {
            const incomes = await apiService.getIncome();
            this.setCache('incomes', incomes);
            return incomes;
        } catch (error) {
            console.error('Error fetching income from API:', error);
            // Fallback to localStorage when API is not available
            const localIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
            if (localIncomes.length > 0) {
                console.log('Using localStorage fallback for incomes');
                this.setCache('incomes', localIncomes);
                return localIncomes;
            }
            // Return empty array for new users
            return [];
        }
    }

    async createIncome(incomeData) {
        try {
            const newIncome = await apiService.createIncome(incomeData);
            this.clearCache('incomes');
            this.clearCache('dashboard');
            return newIncome;
        } catch (error) {
            console.error('Error creating income:', error);
            throw error;
        }
    }

    // Expenses management
    async getExpenses(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('expenses')) {
            return this.cache.expenses;
        }

        try {
            const expenses = await apiService.getExpenses();
            this.setCache('expenses', expenses);
            return expenses;
        } catch (error) {
            console.error('Error fetching expenses from API:', error);
            // Fallback to localStorage when API is not available
            const localExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            if (localExpenses.length > 0) {
                console.log('Using localStorage fallback for expenses');
                this.setCache('expenses', localExpenses);
                return localExpenses;
            }
            // Return empty array for new users
            return [];
        }
    }

    async createExpense(expenseData) {
        try {
            const newExpense = await apiService.createExpense(expenseData);
            this.clearCache('expenses');
            this.clearCache('dashboard');
            return newExpense;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    }

    // Goals management
    async getGoals(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('goals')) {
            return this.cache.goals;
        }

        try {
            const goals = await apiService.getGoals();
            this.setCache('goals', goals);
            return goals;
        } catch (error) {
            console.error('Error fetching goals from API:', error);
            // Fallback to localStorage when API is not available
            const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            if (localGoals.length > 0) {
                console.log('Using localStorage fallback for goals');
                this.setCache('goals', localGoals);
                return localGoals;
            }
            // Return empty array for new users
            return [];
        }
    }

    async createGoal(goalData) {
        try {
            const newGoal = await apiService.createGoal(goalData);
            this.clearCache('goals'); // Force refresh on next load
            // Goal created successfully
            return newGoal;
        } catch (error) {
            console.error('Error creating goal:', error);
            // Failed to create goal
            throw error;
        }
    }

    // Investments management
    async getInvestments(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('investments')) {
            return this.cache.investments;
        }

        try {
            const investments = await apiService.getInvestments();
            this.setCache('investments', investments);
            return investments;
        } catch (error) {
            console.error('Error fetching investments from API:', error);
            // Fallback to localStorage when API is not available
            const localInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
            if (localInvestments.length > 0) {
                console.log('Using localStorage fallback for investments');
                this.setCache('investments', localInvestments);
                return localInvestments;
            }
            // Return empty array for new users
            return [];
        }
    }

    async createInvestment(investmentData) {
        try {
            const newInvestment = await apiService.createInvestment(investmentData);
            this.clearCache('investments'); // Force refresh on next load
            // Investment added successfully
            return newInvestment;
        } catch (error) {
            console.error('Error creating investment:', error);
            // Failed to add investment
            throw error;
        }
    }

    // ===============================
    // Bank Accounts management
    // ===============================
    async getAccounts(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('accounts')) {
            return this.cache.accounts;
        }

        try {
            const accounts = await apiService.getMyBankAccounts();
            this.setCache('accounts', accounts);
            return accounts;
        } catch (error) {
            console.error('Error fetching accounts from API:', error);
            // Fallback to localStorage (older UI)
            const localAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            if (localAccounts.length > 0) {
                this.setCache('accounts', localAccounts);
                return localAccounts;
            }
            return [];
        }
    }

    async createBankAccount(bankAccountData) {
        const created = await apiService.addBankAccount(bankAccountData);
        this.clearCache('accounts');
        return created;
    }

    async verifyBankAccount(accountId, otp) {
        const verified = await apiService.verifyBankAccount(accountId, otp);
        this.clearCache('accounts');
        return verified;
    }

    // User profile management
    async getUserProfile(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('user')) {
            return this.cache.user;
        }

        try {
            const userProfile = await apiService.getUserProfile();
            this.setCache('user', userProfile);
            return userProfile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to localStorage data
            const localUser = localStorage.getItem('fintrackr_user');
            if (localUser) {
                return JSON.parse(localUser);
            }
            return null;
        }
    }

    // Get dashboard summary data (from backend)
    async getDashboardSummary(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('dashboard')) {
            return this.cache.dashboard;
        }
        try {
            const overview = await apiService.getDashboardOverview();
            this.setCache('dashboard', overview);
            return overview;
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            // Failed to load dashboard data
            throw error;
        }
    }

    // Get monthly income/expense trends for charts
    async getMonthlyTrends(forceRefresh = false, monthsBack = 12) {
        if (!forceRefresh && this.isCacheValid('monthlyTrends')) {
            return this.cache.monthlyTrends;
        }
        try {
            const trends = await apiService.getMonthlyTrends(monthsBack);
            this.setCache('monthlyTrends', trends);
            return trends;
        } catch (error) {
            console.error('Error fetching monthly trends:', error);
            throw error;
        }
    }

    // Sync all data with backend
    async syncAllData() {
        try {
            // Syncing data with server
            this.clearCache(); // Clear all cache to force fresh data

            const summary = await this.getDashboardSummary();
            // Data synced successfully
            return summary;
        } catch (error) {
            console.error('Error syncing data:', error);
            // Failed to sync data with server
            throw error;
        }
    }
}

// Create a global instance of the data service
const dataService = new DataService();
if (typeof window !== 'undefined') {
    window.dataService = dataService;
}
