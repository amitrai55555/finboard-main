// API Service - Handles all API communication with JWT authentication
// Create a singleton instance
let instance = null;

class ApiService {
    constructor() {
        if (instance) {
            return instance;
        }

        this.baseUrl = API_CONFIG.BASE_URL;
        this.endpoints = API_CONFIG.ENDPOINTS;
        
        instance = this;
    }

    // Helper to read stored JWT
    getToken() {
        return sessionStorage.getItem('fintrackr_token');
    }

    // Check backend connection
    async checkConnection() {
        try {
            const res = await fetch(this.baseUrl + '/api/public/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                mode: 'cors',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return res;
        } catch (error) {
            console.error('Connection check failed:', error);
            throw error;
        }
    }

    // Build headers, attach Authorization if available
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Login method
    async login(usernameOrEmail, password, remember = false) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.LOGIN, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify({
                    usernameOrEmail,
                    password
                })
            });

            if (!response.ok) {
                let errorText = 'Login failed';
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || errorData.error || errorText;
                } catch (_) {}
                throw new Error(errorText);
            }

            const data = await response.json();

            // Backend returns JWT as 'token' (JwtResponse.token) or sometimes 'jwt'
            const token = data && (data.jwt || data.token);
            if (token) {
                sessionStorage.setItem('fintrackr_token', token);
                const user = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role
                };
                sessionStorage.setItem('fintrackr_user', JSON.stringify(user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register method
    async register(userData) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.REGISTER, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify(userData) // { firstName, lastName, username, email, password }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();

            // Backend returns success message for registration, not JWT
            // Registration doesn't automatically log in the user
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Logout method
    async logout() {
        try {
            // Call backend logout endpoint if available (best-effort)
            try {
                await fetch(this.baseUrl + this.endpoints.LOGOUT, {
                    method: 'POST',
                    headers: this.getHeaders(true)
                });
            } catch (_) {}
            
            // Clear user data
            this.clearTokens();
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear tokens even if backend call fails
            this.clearTokens();
            throw error;
        }
    }

    // Clear all user data
    clearTokens() {
        sessionStorage.removeItem('fintrackr_user');
        sessionStorage.removeItem('fintrackr_token');
    }

    // Refresh token - optional (backend may not provide this endpoint)
    async refreshToken() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.REFRESH, {
                method: 'POST',
                headers: this.getHeaders(true)
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            if (data && data.token) sessionStorage.setItem('fintrackr_token', data.token);
            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    // Get user profile
    async getUserProfile() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.USER_PROFILE, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to get user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }

    // Income management
    async getIncome() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.INCOME, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch income data');
            }

            return await response.json();
        } catch (error) {
            console.error('Get income error:', error);
            throw error;
        }
    }

    async createIncome(incomeData) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.INCOME, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(incomeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to create income');
            }

            return await response.json();
        } catch (error) {
            console.error('Create income error:', error);
            throw error;
        }
    }

    async updateIncome(id, incomeData) {
        const response = await fetch(this.baseUrl + this.endpoints.INCOME_BY_ID(id), {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(incomeData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to update income');
        }
        return response.json();
    }

    async deleteIncome(id) {
        const response = await fetch(this.baseUrl + this.endpoints.INCOME_BY_ID(id), {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to delete income');
        }
        return response.json();
    }

    async getIncomeByCategory(startDate = null, endDate = null) {
        let url = this.baseUrl + this.endpoints.INCOME_BY_CATEGORY;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch income by category');
        return response.json();
    }

    async getIncomeTotal(startDate = null, endDate = null) {
        let url = this.baseUrl + this.endpoints.INCOME_TOTAL;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch income total');
        return response.json();
    }

    async getRecentIncome(limit = 5) {
        const response = await fetch(this.baseUrl + this.endpoints.INCOME_RECENT(limit), {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch recent income');
        return response.json();
    }

    async getIncomeCategories() {
        const response = await fetch(this.baseUrl + this.endpoints.INCOME_CATEGORIES, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch income categories');
        return response.json();
    }

    // Expenses management
    async getExpenses() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.EXPENSES, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch expenses data');
            }

            return await response.json();
        } catch (error) {
            console.error('Get expenses error:', error);
            throw error;
        }
    }

    async createExpense(expenseData) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.EXPENSES, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to create expense');
            }

            return await response.json();
        } catch (error) {
            console.error('Create expense error:', error);
            throw error;
        }
    }

    async updateExpense(id, expenseData) {
        const response = await fetch(this.baseUrl + this.endpoints.EXPENSE_BY_ID(id), {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(expenseData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to update expense');
        }
        return response.json();
    }

    async deleteExpense(id) {
        const response = await fetch(this.baseUrl + this.endpoints.EXPENSE_BY_ID(id), {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to delete expense');
        }
        return response.json();
    }

    async getExpensesByCategory(startDate = null, endDate = null) {
        let url = this.baseUrl + this.endpoints.EXPENSES_BY_CATEGORY;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch expenses by category');
        return response.json();
    }

    async getExpensesTotal(startDate = null, endDate = null) {
        let url = this.baseUrl + this.endpoints.EXPENSES_TOTAL;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch expenses total');
        return response.json();
    }

    async getRecentExpenses(limit = 5) {
        const response = await fetch(this.baseUrl + this.endpoints.EXPENSES_RECENT(limit), {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch recent expenses');
        return response.json();
    }

    async getExpenseCategories() {
        const response = await fetch(this.baseUrl + this.endpoints.EXPENSE_CATEGORIES, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch expense categories');
        return response.json();
    }

    // Goals management
    async getGoals() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.GOALS, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch goals data');
            }

            return await response.json();
        } catch (error) {
            console.error('Get goals error:', error);
            throw error;
        }
    }

    async createGoal(goalData) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.GOALS, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(goalData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to create goal');
            }

            return await response.json();
        } catch (error) {
            console.error('Create goal error:', error);
            throw error;
        }
    }

    async updateGoal(id, goalData) {
        const response = await fetch(this.baseUrl + this.endpoints.GOAL_BY_ID(id), {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(goalData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to update goal');
        }
        return response.json();
    }

    async deleteGoal(id) {
        const response = await fetch(this.baseUrl + this.endpoints.GOAL_BY_ID(id), {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to delete goal');
        }
        return response.json();
    }

    async getActiveGoals() {
        const response = await fetch(this.baseUrl + this.endpoints.GOALS_ACTIVE, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch active goals');
        return response.json();
    }

    async getGoalStats() {
        const response = await fetch(this.baseUrl + this.endpoints.GOALS_STATS, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch goal stats');
        return response.json();
    }

    async getOverdueGoals() {
        const response = await fetch(this.baseUrl + this.endpoints.GOALS_OVERDUE, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch overdue goals');
        return response.json();
    }

    async updateGoalProgress(id, amount) {
        const response = await fetch(this.baseUrl + this.endpoints.GOAL_PROGRESS(id), {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ amount })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to update goal progress');
        }
        return response.json();
    }

    async addToGoalProgress(id, amount) {
        const response = await fetch(this.baseUrl + this.endpoints.GOAL_ADD_PROGRESS(id), {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ amount })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to add to goal progress');
        }
        return response.json();
    }

    async updateGoalStatus(id, status) {
        const response = await fetch(this.baseUrl + this.endpoints.GOAL_STATUS(id), {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to update goal status');
        }
        return response.json();
    }

    // Investments management
    async getInvestments() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.INVESTMENTS, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch investments data');
            }

            return await response.json();
        } catch (error) {
            console.error('Get investments error:', error);
            throw error;
        }
    }

    async createInvestment(investmentData) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.INVESTMENTS, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(investmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create investment');
            }

            return await response.json();
        } catch (error) {
            console.error('Create investment error:', error);
            throw error;
        }
    }

    // Dashboard & Analytics
    async getDashboardOverview() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.DASHBOARD_OVERVIEW, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard overview');
            }

            return await response.json();
        } catch (error) {
            console.error('Get dashboard overview error:', error);
            throw error;
        }
    }

    async getSpendingAnalysis(startDate = null, endDate = null) {
        let url = this.baseUrl + this.endpoints.DASHBOARD_SPENDING_ANALYSIS;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch spending analysis');
        return response.json();
    }

    async getMonthlyTrends(monthsBack = 6) {
        const url = this.baseUrl + this.endpoints.DASHBOARD_MONTHLY_TRENDS + `?monthsBack=${monthsBack}`;
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch monthly trends');
        return response.json();
    }

    async getFinancialInsights() {
        const response = await fetch(this.baseUrl + this.endpoints.DASHBOARD_INSIGHTS, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch financial insights');
        return response.json();
    }

    // Investment Recommendations
    async getInvestmentRecommendations(riskProfile = 'MODERATE') {
        const url = this.baseUrl + this.endpoints.INVEST_RECOMMENDATIONS + `?riskProfile=${riskProfile}`;
        const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch investment recommendations');
        return response.json();
    }

    async getInvestmentCapacity() {
        const response = await fetch(this.baseUrl + this.endpoints.INVEST_CAPACITY, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch investment capacity');
        return response.json();
    }

    async getRiskProfiles() {
        const response = await fetch(this.baseUrl + this.endpoints.INVEST_RISK_PROFILES, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch risk profiles');
        return response.json();
    }

    // ===============================
    // Bank Account APIs
    // ===============================

    async addBankAccount(payload) {
        const response = await fetch(this.baseUrl + this.endpoints.BANK_ACCOUNT_ADD, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to add bank account');
        }

        return response.json();
    }

    async verifyBankAccount(accountId, otp) {
        const response = await fetch(this.baseUrl + this.endpoints.BANK_ACCOUNT_VERIFY, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ accountId, otp })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to verify bank account');
        }

        return response.json();
    }

    async getMyBankAccounts() {
        const response = await fetch(this.baseUrl + this.endpoints.BANK_ACCOUNT_MY, {
            method: 'GET',
            headers: this.getHeaders(true)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to fetch bank accounts');
        }

        return response.json();
    }

    // ===============================
    // Password Reset APIs
    // ===============================

    async requestPasswordReset(email) {
        const response = await fetch(this.baseUrl + this.endpoints.FORGOT_PASSWORD, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ email })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to request password reset');
        }

        return data;
    }

    async resetPassword(token, newPassword) {
        const response = await fetch(this.baseUrl + this.endpoints.RESET_PASSWORD, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to reset password');
        }

        return data;
    }

    // ===============================
    // Admin APIs
    // ===============================

    async adminPing() {
        const response = await fetch(this.baseUrl + this.endpoints.ADMIN_PING, {
            method: 'GET',
            headers: this.getHeaders(true)
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Admin ping failed (${response.status}) ${text}`);
        }

        return response.json();
    }

    async getAdminStats() {
        const response = await fetch(this.baseUrl + this.endpoints.ADMIN_STATS, {
            method: 'GET',
            headers: this.getHeaders(true)
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to fetch admin stats (${response.status}) ${text}`);
        }

        return response.json();
    }

    async getAdminUsers() {
        const response = await fetch(this.baseUrl + this.endpoints.ADMIN_USERS, {
            method: 'GET',
            headers: this.getHeaders(true)
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to fetch users (${response.status}) ${text}`);
        }

        return response.json();
    }

    async createAdminUser(userData) {
        const response = await fetch(this.baseUrl + this.endpoints.ADMIN_USERS, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            let msg = 'Failed to create user';
            try {
                const err = await response.json();
                msg = err.error || err.message || msg;
            } catch (_) {}
            throw new Error(`${msg} (${response.status})`);
        }

        return response.json();
    }

    async updateAdminUser(id, patch) {
        const response = await fetch(this.baseUrl + this.endpoints.ADMIN_USER_BY_ID(id), {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(patch)
        });

        if (!response.ok) {
            let msg = 'Failed to update user';
            try {
                const err = await response.json();
                msg = err.error || err.message || msg;
            } catch (_) {}
            throw new Error(`${msg} (${response.status})`);
        }

        return response.json();
    }

    async deleteAdminUser(id) {
        const response = await fetch(this.baseUrl + this.endpoints.ADMIN_USER_BY_ID(id), {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });

        if (response.status === 204) return;

        if (!response.ok) {
            let msg = 'Failed to delete user';
            try {
                const err = await response.json();
                msg = err.error || err.message || msg;
            } catch (_) {}
            throw new Error(`${msg} (${response.status})`);
        }

        return response.json();
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
if (typeof window !== 'undefined') {
    window.apiService = apiService;
}
