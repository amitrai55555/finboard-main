// Function to show notifications
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set default target date to one year from now
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
document.getElementById('goalTargetDate').valueAsDate = oneYearFromNow;

// Form submission
document.getElementById('goalForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);

        const name = formData.get('name').trim();
        const targetAmount = parseFloat(formData.get('targetAmount'));
        let currentAmount = parseFloat(formData.get('currentAmount') || 0);
        const targetDate = formData.get('targetDate');
        const category = formData.get('category');
        const priority = formData.get('priority');
        const description = formData.get('description').trim();

        // Validate name
        if (!name) {
            throw new Error('Please enter a goal name');
        }

        // Validate target amount
        if (isNaN(targetAmount) || targetAmount <= 0) {
            throw new Error('Please enter a valid target amount greater than 0');
        }

        // Validate current amount
        if (isNaN(currentAmount) || currentAmount < 0) {
            currentAmount = 0;
        }

        // Ensure current amount doesn't exceed target
        if (currentAmount > targetAmount) {
            throw new Error('Current saved amount cannot exceed target amount');
        }

        // Validate category
        if (!category) {
            throw new Error('Please select a goal category');
        }

        // Validate target date
        const targetDateObj = new Date(targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (targetDateObj <= today) {
            throw new Error('Target date must be in the future');
        }

        // Build the goal payload matching backend GoalRequest DTO
        const goalPayload = {
            title: name,
            description: description || '',
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            targetDate: targetDate,
            priority: (priority || 'MEDIUM').toUpperCase()
        };

        // Send goal to backend API
        const token = sessionStorage.getItem('fintrackr_token');
        if (!token) {
            throw new Error('You must be logged in to add a goal. Please log in first.');
        }

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GOALS), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(goalPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to add goal');
        }

        // Show success message
        showNotification('Goal added successfully!', 'success');

        // Redirect back to Goals section after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html#goals';
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
    }
});
