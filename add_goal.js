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

// Function to save goal data to localStorage
function saveGoalData(goalData) {
    // Get existing goals or initialize empty array
    let goals = JSON.parse(localStorage.getItem('goals') || '[]');

    // Add new goal with unique ID
    goalData.id = Date.now();
    goalData.timestamp = new Date().toISOString();
    goals.push(goalData);

    // Save back to localStorage
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Set default target date to one year from now
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
document.getElementById('goalTargetDate').valueAsDate = oneYearFromNow;

// Form submission
document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);
        const goalData = {
            name: formData.get('name').trim(),
            targetAmount: parseFloat(formData.get('targetAmount')),
            currentAmount: parseFloat(formData.get('currentAmount') || 0),
            targetDate: formData.get('targetDate'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            description: formData.get('description').trim()
        };

        // Validate name
        if (!goalData.name) {
            throw new Error('Please enter a goal name');
        }

        // Validate target amount
        if (isNaN(goalData.targetAmount) || goalData.targetAmount <= 0) {
            throw new Error('Please enter a valid target amount greater than 0');
        }

        // Validate current amount
        if (isNaN(goalData.currentAmount) || goalData.currentAmount < 0) {
            goalData.currentAmount = 0;
        }

        // Ensure current amount doesn't exceed target
        if (goalData.currentAmount > goalData.targetAmount) {
            throw new Error('Current saved amount cannot exceed target amount');
        }

        // Validate category
        if (!goalData.category) {
            throw new Error('Please select a goal category');
        }

        // Validate target date
        const targetDate = new Date(goalData.targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (targetDate <= today) {
            throw new Error('Target date must be in the future');
        }

        // Save the data
        saveGoalData(goalData);

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
