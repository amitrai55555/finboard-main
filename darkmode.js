class DarkModeManager {
    constructor() {
        this.themeKey = 'fintrackr-theme';
        this.overlay = null;
        this.init();
    }

    init() {
        this.createOverlay();
        this.loadTheme();
        this.setupToggleListener();
        this.updateToggleIcon();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'theme-transition-overlay';
        document.body.appendChild(this.overlay);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(this.themeKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(theme, false, false);
    }

    setTheme(theme, save = true, animate = true) {
        if (animate) {
            this.overlay.classList.add('active');
            
            setTimeout(() => {
                if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
                this.updateToggleIcon();
            }, 400);

            setTimeout(() => {
                this.overlay.classList.remove('active');
            }, 800);
        } else {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            this.updateToggleIcon();
        }

        if (save) {
            localStorage.setItem(this.themeKey, theme);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme, true, true);
    }

    setupToggleListener() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }

    updateToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.darkModeManager = new DarkModeManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager;
}
