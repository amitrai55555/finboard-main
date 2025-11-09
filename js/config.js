// ===============================
// Environment Detection
// ===============================
const ENVIRONMENT = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),
    isTest: window.location.hostname.includes('test') || window.location.hostname.includes('staging')
};

// ===============================
// API Configuration
// ===============================
const API_CONFIG = {
    // Base URL depending on environment
    BASE_URL: ENVIRONMENT.isProduction 
        ? 'https://api.fintrackr.com' 
        : ENVIRONMENT.isTest 
            ? 'https://test-api.fintrackr.com'
            : 'http://localhost:8080',

    VERSION: 'v1',

    // ===============================
    // Endpoints
    // ===============================
    ENDPOINTS: {
        // Authentication
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        ME: '/api/auth/me',

        // User Profile
        USER_PROFILE: '/api/auth/me',
        UPDATE_PROFILE: '/api/auth/me',

        // Income & Expenses
        INCOME: '/api/income',
        INCOME_BY_ID: (id) => `/api/income/${id}`,
        INCOME_CATEGORIES: '/api/income/categories',
        INCOME_BY_CATEGORY: '/api/income/by-category',
        INCOME_RECENT: (limit = 5) => `/api/income/recent?limit=${limit}`,

        EXPENSES: '/api/expenses',
        EXPENSE_BY_ID: (id) => `/api/expenses/${id}`,
        EXPENSE_CATEGORIES: '/api/expenses/categories',
        EXPENSES_BY_CATEGORY: '/api/expenses/by-category',
        EXPENSES_RECENT: (limit = 5) => `/api/expenses/recent?limit=${limit}`,

        // Goals
        GOALS: '/api/goals',
        GOAL_BY_ID: (id) => `/api/goals/${id}`,
        GOALS_ACTIVE: '/api/goals/active',
        GOALS_STATS: '/api/goals/stats',

        // Investments
        INVESTMENTS: '/api/investments',
        INVESTMENT_BY_ID: (id) => `/api/investments/${id}`,
        INVEST_RECOMMENDATIONS: '/api/investments/recommendations',
        INVEST_CAPACITY: '/api/investments/capacity',
        INVEST_RISK_PROFILES: '/api/investments/risk-profiles',

        // Dashboard & Analytics
        DASHBOARD_OVERVIEW: '/api/dashboard/overview',
        DASHBOARD_SPENDING_ANALYSIS: '/api/dashboard/spending-analysis',
        DASHBOARD_MONTHLY_TRENDS: '/api/dashboard/monthly-trends',
        DASHBOARD_INSIGHTS: '/api/dashboard/insights',

        // Admin
        USERS: '/api/users',
        USER_BY_ID: (id) => `/api/users/${id}`,

        // Reports
        REPORTS_MONTHLY: '/api/reports/monthly',
        REPORTS_SPENDING: '/api/reports/spending',
        REPORTS_INCOME: '/api/reports/income',
        REPORTS_BUDGET: '/api/reports/budget'
    },

    // ===============================
    // Basic Config
    // ===============================
    TIMEOUT: ENVIRONMENT.isProduction ? 15000 : 10000,

    // Default headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': '1.0.0',
        'X-Client-Platform': 'web'
    },

    // Retry configuration
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY_MS: 1000,
        BACKOFF_MULTIPLIER: 2
    },

    // Cache configuration
    CACHE: {
        ENABLED: true,
        TTL_MS: 5 * 60 * 1000,
        MAX_SIZE: 100
    }
};

// ===============================
// Helper Functions
// ===============================

// Full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}

// Get basic headers
function getAuthHeaders() {
    return {};
}

// Build fetch options with JWT and defaults
function buildRequestOptions(method = 'GET', body = null) {
    return {
        method,
        headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...getAuthHeaders()
        },
        body: body ? JSON.stringify(body) : null
    };
}

// ===============================
// Export for Node.js or Browser
// ===============================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getApiUrl, buildRequestOptions };
}
