const AuthManager = {
    state: {
        user: null,
        isAuthenticated: false
    },

    // Initialize auth state from session storage
    init() {
        const token = sessionStorage.getItem('fintrackr_token');
        const userData = sessionStorage.getItem('fintrackr_user');

        if (token && userData) {
            try {
                this.state.user = JSON.parse(userData);
                this.state.isAuthenticated = true;
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                this.clearSession();
            }
        }
    },

    // Login method
    async login(credentials) {
        try {
            const response = await apiService.login(credentials.usernameOrEmail, credentials.password);

            // Check if response has token (backend returns JwtResponse.token) or jwt
            const token = response && (response.jwt || response.token);
            if (token) {
                // Update state
                this.state.user = {
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: response.role
                };
                this.state.isAuthenticated = true;

                return { success: true, user: this.state.user };
            } else {
                throw new Error('Invalid response from server - missing token');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register method
    async register(userData) {
        try {
            const response = await apiService.register(userData);

            // Registration successful - backend returns success message
            // User needs to login separately after registration
            return { success: true, message: response.message || 'Registration successful' };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Logout method
    async logout() {
        try {
            // Clear local storage first
            this.clearSession();

            // Call backend logout (best-effort)
            await apiService.logout();
        } catch (error) {
            console.warn('Backend logout failed:', error);
            // Continue with logout even if backend fails
        }

        // Always redirect to login page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    },

    // Clear session data
    clearSession() {
        sessionStorage.removeItem('fintrackr_token');
        sessionStorage.removeItem('fintrackr_user');
        this.state.user = null;
        this.state.isAuthenticated = false;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.state.isAuthenticated;
    },

    // Get current user
    getUser() {
        return this.state.user;
    }
};

// Initialize auth manager when script loads
AuthManager.init();
