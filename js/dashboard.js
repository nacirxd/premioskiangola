// Stage 2: Dashboard Logic
let carouselInterval;
window.userBalance = 3000; // Global state for balance

function updateBalanceDisplay() {
    const formattedBalance = window.userBalance.toLocaleString('pt-AO') + ' Kz';
    const elements = ['balance-header-dash', 'balance-card-dash', 'balance-header-game'];

    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = formattedBalance;
    });
}

function animateBalanceUpdate(start, end, duration = 1500) {
    let startTimestamp = null;
    const elements = ['balance-header-dash', 'balance-card-dash', 'balance-header-game'];
    const targetElements = elements.map(id => document.getElementById(id)).filter(el => el);

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        const formatted = value.toLocaleString('pt-AO') + ' Kz';

        targetElements.forEach(el => {
            el.innerText = formatted;
        });

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            const finalFormatted = end.toLocaleString('pt-AO') + ' Kz';
            targetElements.forEach(el => {
                el.innerText = finalFormatted;
            });
        }
    };
    window.requestAnimationFrame(step);
}

function startCarousel() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');

    if (slides.length === 0) return;

    if (carouselInterval) clearInterval(carouselInterval);

    carouselInterval = setInterval(() => {
        slides[slideIndex].classList.remove('active');
        slideIndex++;
        if (slideIndex >= slides.length) {
            slideIndex = 0;
        }
        slides[slideIndex].classList.add('active');
    }, 3000); // Change image every 3 seconds
}

// Make them available globally
window.startCarousel = startCarousel;
window.updateBalanceDisplay = updateBalanceDisplay;
window.animateBalanceUpdate = animateBalanceUpdate;

document.addEventListener('DOMContentLoaded', () => {
    const dashboardView = document.getElementById('dashboard-view');

    // Initial update to sync UI with state
    updateBalanceDisplay();

    if (dashboardView && !dashboardView.classList.contains('hidden')) {
        startCarousel();
    }

    console.log("Dashboard stage initialized");
});
