// ============================================
// EMAIL SENT PAGE - Display user's email
// ============================================

// Run when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Get the email from sessionStorage
    const email = sessionStorage.getItem('resetEmail');
    
    if (email) {
        // Find the paragraph element
        const messageParagraph = document.querySelector('.container p');
        
        // Update the message to include the email
        messageParagraph.innerHTML = `
            We've sent a password reset link to<br>
            <strong style="color: #4361ee; font-weight: 600;">${email}</strong><br><br>
            Please click on the link in the email to reset your password.<br>
            If you don't get the email, please contact support@fintrackr.com
        `;
    } else {
        // If no email found, redirect back to forgot password page
        console.log('No email found in session');
        // Optionally redirect: window.location.href = '/forgot.html';
    }
});

// Clear the email from sessionStorage when user clicks resend
function clearAndResend() {
    sessionStorage.removeItem('resetEmail');
    window.location.href = '/forgot.html';
}