// Admin Panel JavaScript functionality

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const addUserBtn = document.getElementById('addUserBtn');
const userFilter = document.getElementById('userFilter');
const generateReportBtn = document.getElementById('generateReportBtn');
const reportFilter = document.getElementById('reportFilter');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Modal Elements
const addUserModal = document.getElementById('addUserModal');
const closeAddUserModal = document.getElementById('closeAddUserModal');
const cancelAddUser = document.getElementById('cancelAddUser');
const addUserForm = document.getElementById('addUserForm');

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Allow external links (like dashboard.html) to work normally
            if (href.startsWith('http') || href.includes('.html') || this.classList.contains('external')) {
                return; // Don't prevent default for external links
            }

            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            // Add active class to clicked link
            this.parentElement.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.style.display = 'none');

            // Show target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}

// Cache for UI actions
let cachedUsers = [];

function isAdminUser() {
    const userData = sessionStorage.getItem('fintrackr_user');
    if (!userData) return false;
    try {
        const user = JSON.parse(userData);
        const roleStr = String(user.role || '').toUpperCase();
        return roleStr === 'ROLE_ADMIN' || roleStr === 'ADMIN';
    } catch (_) {
        return false;
    }
}

async function ensureAdminAccess() {
    const token = sessionStorage.getItem('fintrackr_token');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }

    if (!isAdminUser()) {
        alert('Admin access required. Please login with an admin account.');
        window.location.href = 'dashboard.html';
        return false;
    }

    try {
        await apiService.adminPing();
        return true;
    } catch (e) {
        console.error(e);
        alert('Admin API access failed. Please login again.');
        sessionStorage.removeItem('fintrackr_token');
        sessionStorage.removeItem('fintrackr_user');
        window.location.href = 'index.html';
        return false;
    }
}

// Load Admin Dashboard Data
async function loadAdminDashboard() {
    try {
        const stats = await apiService.getAdminStats();

        document.getElementById('totalUsers').textContent = String(stats.totalUsers ?? 0);
        document.getElementById('activeUsers').textContent = String(stats.activeUsers ?? 0);
        document.getElementById('totalReports').textContent = String(stats.totalReports ?? 0);
        document.getElementById('systemHealth').textContent = `${stats.systemHealth ?? 100}%`;

        // Basic animated metrics (placeholder for now)
        animateMetric('cpuUsage', Math.floor(30 + Math.random() * 40));
        animateMetric('memoryUsage', Math.floor(40 + Math.random() * 40));
        animateMetric('storageUsage', Math.floor(20 + Math.random() * 50));
        animateMetric('apiResponseTime', Math.floor(80 + Math.random() * 120));

        loadRecentActivity();
    } catch (error) {
        console.error('Failed to load admin dashboard:', error);
        showNotification(error.message || 'Failed to load admin dashboard', 'error');
    }
}

function animateMetric(elementId, value) {
    const element = document.getElementById(elementId);
    const progressFill = element.parentElement.nextElementSibling.firstElementChild;

    if (elementId === 'apiResponseTime') {
        element.textContent = `${value}ms`;
        progressFill.style.width = `${Math.min(value / 2, 100)}%`;
    } else {
        element.textContent = `${value}%`;
        progressFill.style.width = `${value}%`;
    }
}

// Start real-time metrics updates
function startRealTimeMetrics() {
    // Clear any existing interval
    stopRealTimeMetrics();

    // Update metrics immediately
    updateMetrics();

    // Set up periodic updates every 3 seconds
    metricsUpdateInterval = setInterval(updateMetrics, 3000);
}

// Stop real-time metrics updates
function stopRealTimeMetrics() {
    if (metricsUpdateInterval) {
        clearInterval(metricsUpdateInterval);
        metricsUpdateInterval = null;
    }
}

// Update system metrics with simulated real-time values
function updateMetrics() {
    // Generate realistic simulated values
    const cpuUsage = Math.floor(20 + Math.random() * 60); // 20-80%
    const memoryUsage = Math.floor(30 + Math.random() * 50); // 30-80%
    const storageUsage = Math.floor(15 + Math.random() * 65); // 15-80%
    const apiResponseTime = Math.floor(50 + Math.random() * 150); // 50-200ms

    // Animate the metrics
    animateMetric('cpuUsage', cpuUsage);
    animateMetric('memoryUsage', memoryUsage);
    animateMetric('storageUsage', storageUsage);
    animateMetric('apiResponseTime', apiResponseTime);
}

// Load Recent Activity
function loadRecentActivity() {
    const activities = [
        {
            icon: 'fas fa-user-plus',
            title: 'New user registered',
            description: 'John Doe joined the platform',
            time: '2 minutes ago'
        },
        {
            icon: 'fas fa-file-alt',
            title: 'Report generated',
            description: 'Monthly user activity report completed',
            time: '15 minutes ago'
        },
        {
            icon: 'fas fa-server',
            title: 'System maintenance',
            description: 'Scheduled maintenance completed successfully',
            time: '1 hour ago'
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Security update',
            description: 'Security patches applied to all servers',
            time: '3 hours ago'
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Performance improved',
            description: 'API response time improved by 15%',
            time: '5 hours ago'
        }
    ];

    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Load Users List
async function loadUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<div style="padding:12px; color:#6b7280;">Loading users...</div>';

    try {
        const users = await apiService.getAdminUsers();
        cachedUsers = Array.isArray(users) ? users : [];

        usersList.innerHTML = cachedUsers.map(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
            const role = String(user.role || '').toUpperCase();
            const status = user.enabled ? 'active' : 'inactive';

            return `
                <div class="user-item" data-status="${status}" data-role="${role}">
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <h4>${escapeHtml(fullName)}</h4>
                            <p>${escapeHtml(user.email || '')}</p>
                            <span class="user-role">${escapeHtml(role)}</span>
                        </div>
                    </div>
                    <div class="user-status ${status}">${status}</div>
                    <div class="user-actions">
                        <button class="action-btn edit" onclick="editUser(${user.id})" title="Toggle Active">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        filterUsers();
    } catch (error) {
        console.error('Failed to load users:', error);
        usersList.innerHTML = '<div style="padding:12px; color:#ef4444;">Failed to load users</div>';
        showNotification(error.message || 'Failed to load users', 'error');
    }
}

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// Load Reports List
function loadReportsList() {
    const reports = [
        { id: 1, title: 'Monthly User Activity Report', type: 'user', date: '2024-01-15', status: 'completed' },
        { id: 2, title: 'System Performance Report', type: 'system', date: '2024-01-14', status: 'completed' },
        { id: 3, title: 'Financial Summary Report', type: 'financial', date: '2024-01-13', status: 'pending' },
        { id: 4, title: 'User Engagement Report', type: 'user', date: '2024-01-12', status: 'completed' },
        { id: 5, title: 'Security Audit Report', type: 'system', date: '2024-01-11', status: 'pending' }
    ];

    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = reports.map(report => `
        <div class="report-item" data-type="${report.type}" data-status="${report.status}">
            <div class="report-info">
                <div class="report-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="report-details">
                    <h4>${report.title}</h4>
                    <p>Type: ${report.type} | Date: ${report.date}</p>
                    <span class="report-status ${report.status}">${report.status}</span>
                </div>
            </div>
            <div class="report-actions">
                <button class="action-btn view" onclick="viewReport(${report.id})">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                <button class="action-btn download" onclick="downloadReport(${report.id})">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
        </div>
    `).join('');
}

// User Management Functions
async function editUser(userId) {
    const user = cachedUsers.find(u => u.id === userId);
    if (!user) return;

    const nextEnabled = !user.enabled;
    const action = nextEnabled ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return;

    try {
        await apiService.updateAdminUser(userId, { enabled: nextEnabled });
        showNotification(`User ${user.username} updated.`, 'success');
        await loadUsersList();
        await loadAdminDashboard();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to update user', 'error');
    }
}

async function deleteUser(userId) {
    const user = cachedUsers.find(u => u.id === userId);
    const label = user ? user.username : `ID ${userId}`;

    if (!confirm(`Are you sure you want to delete ${label}? This action cannot be undone.`)) return;

    try {
        await apiService.deleteAdminUser(userId);
        showNotification(`User deleted: ${label}`, 'success');
        await loadUsersList();
        await loadAdminDashboard();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to delete user', 'error');
    }
}

// Report Management Functions
function viewReport(reportId) {
    alert(`Viewing report with ID: ${reportId} - Feature coming soon!`);
}

function downloadReport(reportId) {
    alert(`Downloading report with ID: ${reportId}...`);
    // Simulate download
    setTimeout(() => {
        alert('Report downloaded successfully!');
    }, 1000);
}

// Modal Functions
function openAddUserModal() {
    addUserModal.classList.add('show');
}

function closeAddUserModalFunc() {
    addUserModal.classList.remove('show');
    addUserForm.reset();
}

// Settings Functions
function saveSettings() {
    const siteTitle = document.getElementById('siteTitle').value;
    const maintenanceMode = document.getElementById('maintenanceMode').checked;
    const twoFactor = document.getElementById('twoFactor').checked;
    const sessionTimeout = document.getElementById('sessionTimeout').value;

    // In a real app, this would save to backend
    alert(`Settings saved!\n\nSite Title: ${siteTitle}\nMaintenance Mode: ${maintenanceMode}\n2FA: ${twoFactor}\nSession Timeout: ${sessionTimeout} minutes`);

    // Show success message
    showNotification('Settings saved successfully!', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        animation: slideIn 0.3s ease;
    `;

    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    document.body.appendChild(notification);
}

// Filtering Functions
function filterUsers() {
    const filterValue = userFilter ? userFilter.value : 'all';
    const userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
        const status = item.dataset.status;
        const role = (item.dataset.role || '').toUpperCase();

        if (filterValue === 'all' ||
            (filterValue === 'active' && status === 'active') ||
            (filterValue === 'inactive' && status === 'inactive') ||
            (filterValue === 'admin' && role === 'ADMIN')) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterReports() {
    const filterValue = reportFilter.value;
    const reportItems = document.querySelectorAll('.report-item');

    reportItems.forEach(item => {
        const type = item.dataset.type;
        const status = item.dataset.status;

        if (filterValue === 'all' ||
            (filterValue === 'user' && type === 'user') ||
            (filterValue === 'system' && type === 'system') ||
            (filterValue === 'financial' && type === 'financial')) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Setup navigation
    setupNavigation();

    // Verify admin access before loading anything
    const ok = await ensureAdminAccess();
    if (!ok) return;

    // Load initial data
    await loadAdminDashboard();
    await loadUsersList();
    loadReportsList();

    // Logout Modal Elements
    const logoutModal = document.getElementById('logoutModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');

    // Button event listeners
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutModal.classList.add('show');
        });
    }

    // Logout Modal Event Listeners
    if (cancelLogout) {
        cancelLogout.addEventListener('click', function() {
            logoutModal.classList.remove('show');
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            // Show loading state
            confirmLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            confirmLogout.disabled = true;

            // Clear session data
            sessionStorage.removeItem('fintrackr_user');
            localStorage.removeItem('incomes');
            localStorage.removeItem('expenses');
            localStorage.removeItem('accounts');
            localStorage.removeItem('goals');
            localStorage.removeItem('investments');

    // Attempt API logout if available
    if (typeof apiService !== 'undefined' && apiService.logout) {
        apiService.logout().finally(() => {
            // Always redirect after attempting logout
            window.location.href = 'index.html';
        });
    } else {
        // Direct redirect if no API service
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            window.location.reload();
        });
    }

    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }

    if (userFilter) {
        userFilter.addEventListener('change', filterUsers);
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            alert('Generate report functionality - Feature coming soon!');
        });
    }

    if (reportFilter) {
        reportFilter.addEventListener('change', filterReports);
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }

    // Modal event listeners
    if (closeAddUserModal) {
        closeAddUserModal.addEventListener('click', closeAddUserModalFunc);
    }

    if (cancelAddUser) {
        cancelAddUser.addEventListener('click', closeAddUserModalFunc);
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('userName')?.value?.trim();
            const email = document.getElementById('userEmail')?.value?.trim();
            const password = document.getElementById('userPassword')?.value;
            const role = document.getElementById('userRole')?.value;
            const enabled = document.getElementById('userEnabled')?.checked;

            if (!name || !email || !password) {
                showNotification('Name, email and password are required', 'error');
                return;
            }

            try {
                await apiService.createAdminUser({ name, email, password, role, enabled });
                showNotification(`User "${name}" created successfully!`, 'success');
                closeAddUserModalFunc();
                await loadUsersList();
                await loadAdminDashboard();
            } catch (err) {
                console.error(err);
                showNotification(err.message || 'Failed to create user', 'error');
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === addUserModal) {
            closeAddUserModalFunc();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAddUserModalFunc();
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        stopRealTimeMetrics();
    });
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: 8px;
    }
`;
document.head.appendChild(style);
