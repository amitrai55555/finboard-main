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

// Load Admin Dashboard Data
function loadAdminDashboard() {
    // Simulate loading admin stats
    document.getElementById('totalUsers').textContent = '1,250';
    document.getElementById('activeUsers').textContent = '892';
    document.getElementById('totalReports').textContent = '456';
    document.getElementById('systemHealth').textContent = '98%';

    // Simulate system metrics with animation
    animateMetric('cpuUsage', 45);
    animateMetric('memoryUsage', 67);
    animateMetric('storageUsage', 34);
    animateMetric('apiResponseTime', 120);

    // Load recent activity
    loadRecentActivity();
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
function loadUsersList() {
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', lastLogin: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', lastLogin: '2024-01-14' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive', lastLogin: '2024-01-10' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'active', lastLogin: '2024-01-13' },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'user', status: 'active', lastLogin: '2024-01-12' }
    ];

    const usersList = document.getElementById('usersList');
    usersList.innerHTML = users.map(user => `
        <div class="user-item" data-status="${user.status}" data-role="${user.role}">
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                    <span class="user-role">${user.role}</span>
                </div>
            </div>
            <div class="user-status ${user.status}">${user.status}</div>
            <div class="user-actions">
                <button class="action-btn edit" onclick="editUser(${user.id})" title="Edit User">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete User">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
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
function editUser(userId) {
    alert(`Edit user functionality for user ID: ${userId} - Feature coming soon!`);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        alert(`User with ID ${userId} has been deleted.`);
        // In a real app, this would make an API call to delete the user
        loadUsersList(); // Reload the list
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
    const filterValue = userFilter.value;
    const userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
        const status = item.dataset.status;
        const role = item.dataset.role;

        if (filterValue === 'all' ||
            (filterValue === 'active' && status === 'active') ||
            (filterValue === 'inactive' && status === 'inactive') ||
            (filterValue === 'admin' && role === 'admin')) {
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
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation
    setupNavigation();

    // Load initial data
    loadAdminDashboard();
    loadUsersList();
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
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const userData = {
                name: formData.get('userName'),
                email: formData.get('userEmail'),
                role: formData.get('userRole')
            };

            // In a real app, this would send data to backend
            console.log('Adding user:', userData);
            showNotification(`User "${userData.name}" added successfully!`, 'success');
            closeAddUserModalFunc();
            loadUsersList(); // Reload users list
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
