// ===============================
// Environment Detection
// ===============================
const ENVIRONMENT = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),
    isTest: window.location.hostname.includes('test') || window.location.hostname.includes('staging')
};

// Helper: allow overriding API base URL via query param or localStorage
function resolveBaseUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const urlOverride = params.get('apiBase');
        const storedOverride = localStorage.getItem('FIN_API_BASE_URL');
        const defaultBase = ENVIRONMENT.isProduction
            ? 'https://api.fintrackr.com'
            : (ENVIRONMENT.isTest ? 'https://test-api.fintrackr.com' : 'http://localhost:8080');
        const base = (urlOverride || storedOverride || defaultBase).trim();
        // Persist override from URL for next loads
        if (urlOverride) localStorage.setItem('FIN_API_BASE_URL', base);
        return base.replace(/\/$/, ''); // remove trailing slash
    } catch (_) {
        return 'http://localhost:8080';
    }
}

function setApiBaseUrl(newBase) {
    if (typeof newBase === 'string' && newBase.length > 0) {
        localStorage.setItem('FIN_API_BASE_URL', newBase);
    }
}

// ===============================
// API Configuration
// ===============================
const API_CONFIG = {
    // Base URL depending on environment, with override support
    BASE_URL: resolveBaseUrl(),

    VERSION: 'v1',

    // ===============================
    // Endpoints
    // ===============================
    ENDPOINTS: {
        // Authentication
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        // Note: backend may not implement these; kept for compatibility
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        ME: '/api/auth/me',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        CHECK_USERNAME: (username) => `/api/auth/check-username/${username}`,

        // User Profile
        USER_PROFILE: '/api/auth/me',
        UPDATE_PROFILE: '/api/auth/me',

        // Income & Expenses
        INCOME: '/api/income',
        INCOME_BY_ID: (id) => `/api/income/${id}`,
        INCOME_CATEGORIES: '/api/income/categories',
        INCOME_BY_CATEGORY: '/api/income/by-category',
        INCOME_RECENT: (limit = 5) => `/api/income/recent?limit=${limit}`,
        INCOME_TOTAL: '/api/income/total',

        // NOTE: Backend maps expenses under /api/expense (singular)
        EXPENSES: '/api/expense',
        EXPENSE_BY_ID: (id) => `/api/expense/${id}`,
        EXPENSE_CATEGORIES: '/api/expense/categories',
        EXPENSES_BY_CATEGORY: '/api/expense/by-category',
        EXPENSES_RECENT: (limit = 5) => `/api/expense/recent?limit=${limit}`,
        EXPENSES_TOTAL: '/api/expense/total',

        // Goals
        GOALS: '/api/goals',
        GOAL_BY_ID: (id) => `/api/goals/${id}`,
        GOALS_ACTIVE: '/api/goals/active',
        GOALS_STATS: '/api/goals/stats',
        GOALS_OVERDUE: '/api/goals/overdue',
        GOALS_BY_PRIORITY: (priority) => `/api/goals/priority/${priority}`,
        GOAL_PROGRESS: (id) => `/api/goals/${id}/progress`,
        GOAL_ADD_PROGRESS: (id) => `/api/goals/${id}/add-progress`,
        GOAL_STATUS: (id) => `/api/goals/${id}/status`,

        // Investments
        INVESTMENTS: '/api/investments',
        INVESTMENT_BY_ID: (id) => `/api/investments/${id}`,
        INVEST_RECOMMENDATIONS: '/api/investments/recommendations',
        INVEST_CAPACITY: '/api/investments/capacity',
        INVEST_RISK_PROFILES: '/api/investments/risk-profiles',

        // Bank Accounts (OTP verification)
        BANK_ACCOUNT_ADD: '/api/bank-account/add',
        BANK_ACCOUNT_VERIFY: '/api/bank-account/verify',
        BANK_ACCOUNT_MY: '/api/bank-account/my',
        BANK_ACCOUNT_DELETE_REQUEST_OTP: (id) => `/api/bank-account/${id}/delete/request-otp`,
        BANK_ACCOUNT_DELETE_CONFIRM: (id) => `/api/bank-account/${id}/delete/confirm`,

        // Dashboard & Analytics
        DASHBOARD_OVERVIEW: '/api/dashboard/overview',
        DASHBOARD_SPENDING_ANALYSIS: '/api/dashboard/spending-analysis',
        DASHBOARD_MONTHLY_TRENDS: '/api/dashboard/monthly-trends',
        DASHBOARD_INSIGHTS: '/api/dashboard/insights',

        // Admin
        ADMIN_PING: '/api/admin/ping',
        ADMIN_STATS: '/api/admin/stats',
        ADMIN_USERS: '/api/admin/users',
        ADMIN_USER_BY_ID: (id) => `/api/admin/users/${id}`,

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
    const token = sessionStorage.getItem('fintrackr_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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

// Expose helper in browser
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.setApiBaseUrl = setApiBaseUrl;
    window.getApiUrl = getApiUrl;
}
