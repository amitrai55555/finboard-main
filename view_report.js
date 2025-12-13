function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.report-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Initialize with monthly tab active
document.addEventListener('DOMContentLoaded', function() {
    showTab('monthly');
});
