// Stage 1: Login & Welcome Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const modal = document.getElementById('success-modal');
    const startBtn = document.getElementById('start-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = loginForm.querySelector('input[type="text"]');

            if (nameInput.value.trim() !== "") {
                const userName = nameInput.value.trim();
                const abbreviation = userName.substring(0, 2).toUpperCase();
                document.getElementById('user-display').innerText = abbreviation;

                // Show the modal
                modal.classList.remove('hidden');

                // Play victory sound
                const audio = document.getElementById('welcome-audio');
                if (audio) {
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }

                // Animate money count
                const moneyElement = document.querySelector('.highlight-money');
                if (moneyElement) {
                    let count = 0;
                    const target = 3000;
                    const duration = 1500;
                    const intervalTime = 20;
                    const steps = duration / intervalTime;
                    const increment = target / steps;

                    const timer = setInterval(() => {
                        count += increment;
                        if (count >= target) {
                            count = target;
                            clearInterval(timer);
                        }
                        moneyElement.innerText = Math.floor(count).toLocaleString('pt-AO') + ' KZ';
                    }, intervalTime);
                }
            }
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Hide modal and login view
            if (modal) modal.classList.add('hidden');
            const loginView = document.getElementById('login-view');
            if (loginView) {
                loginView.classList.add('hidden');
                loginView.style.display = 'none';
            }

            // Show dashboard
            const dashboard = document.getElementById('dashboard-view');
            if (dashboard) {
                dashboard.classList.remove('hidden');
                dashboard.style.display = 'block';
            }

            // Start Carousel (This function will be defined in dashboard.js)
            if (typeof startCarousel === 'function') {
                startCarousel();
            } else {
                console.warn("startCarousel not found yet - will try when dashboard.js loads");
                // The dashboard might start its own carousel on load or we can retry
            }
        });
    }
});
