// Mark that we came from animation
sessionStorage.setItem("fromAnimation", "true");

// Replay animation if needed (keep your existing function)
function replayAnimation() {
    const container = document.querySelector('.chart-container');
    const clone = container.cloneNode(true);
    container.parentNode.replaceChild(clone, container);
}

// After animation ends, go to login page
setTimeout(() => {
    window.location.href = 'login.html';
}, 5800); // 5.8 seconds - after animation completes
