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
        // Token management removed
        
        instance = this;
    }

    // Check backend connection
    async checkConnection() {
        try {
            return await fetch(this.baseUrl + '/api/csrf-token', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
        } catch (error) {
            console.error('Connection check failed:', error);
            throw error;
        }
    }

    // Get headers without authentication
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            
            // Store user info if available
            if (data.user) {
                sessionStorage.setItem('fintrackr_user', JSON.stringify(data.user));
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
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Logout method
    async logout() {
        try {
            // Call backend logout endpoint
            await fetch(this.baseUrl + this.endpoints.LOGOUT, {
                method: 'POST',
                headers: this.getHeaders(true)
            });
            
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
    }

    // Refresh token - simplified
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
                throw new Error(errorData.message || 'Failed to create income');
            }

            return await response.json();
        } catch (error) {
            console.error('Create income error:', error);
            throw error;
        }
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
                throw new Error(errorData.message || 'Failed to create expense');
            }

            return await response.json();
        } catch (error) {
            console.error('Create expense error:', error);
            throw error;
        }
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
                throw new Error(errorData.message || 'Failed to create goal');
            }

            return await response.json();
        } catch (error) {
            console.error('Create goal error:', error);
            throw error;
        }
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

    // Dashboard overview
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
}

// Create and export a singleton instance
const apiService = new ApiService();