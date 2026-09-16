/**
 * ENGLISH QUEST: MASTERY & TRIVIA - ENHANCED CORE GAME ENGINE
 * Features:
 * - Full Question Prompt Reader TTS & Word Clue Pronunciation with Auto-Ducking
 * - 3 Golden Secret Bonus Stages (ข้อพิเศษ) per difficulty tier
 * - Interactive Power-Up Inventory (🔤 Reveal Letter, 💖 +1 Heart, ⚡ Free Pass)
 * - Auto-Start Louder BGM, Master Volume Slider, Fireworks & Victory Runner Mascot
 */

const SPOTLIGHT_VOCAB = [
    {
        word: 'Serendipity',
        type: '[noun] • /ˌser.ənˈdɪp.ə.ti/',
        def: 'The occurrence and development of events by chance in a happy or beneficial way.'
    },
    {
        word: 'Eloquent',
        type: '[adjective] • /ˈel.ə.kwənt/',
        def: 'Fluent or persuasive in speaking or writing; clearly expressing ideas.'
    },
    {
        word: 'Resilience',
        type: '[noun] • /rɪˈzɪl.jəns/',
        def: 'The capacity to withstand or to recover quickly from difficult conditions.'
    },
    {
        word: 'Mellifluous',
        type: '[adjective] • /meˈlɪf.lu.əs/',
        def: 'Pleasingly smooth, sweet, and musical to the ear.'
    },
    {
        word: 'Ephemeral',
        type: '[adjective] • /ɪˈfem.ər.əl/',
        def: 'Lasting for a very short time; fleeting and precious.'
    }
];

class EnglishQuizGame {
    constructor() {
        this.currentLevel = 'basic';
        this.currentStageIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hintUsed = false;
        this.hasStartedAudio = false;
        this.spotlightIndex = Math.floor(Math.random() * SPOTLIGHT_VOCAB.length);

        // Inventory power-ups
        this.inventory = {
            reveal: 2,
            heal: 1,
            skip: 1
        };

        // Progress storage schema
        this.progress = {
            totalScore: 0,
            maxCombo: 0,
            coins: 100,
            equippedTheme: 'cyberpunk',
            unlockedThemes: ['cyberpunk'],
            equippedHat: 'none',
            unlockedHats: ['none'],
            highScores: {
                timeAttack: 0,
                endless: 0,
                bossDefeated: 0,
                duelWinsP1: 0,
                duelWinsP2: 0
            },
            unlocked: {
                basic: 1,
                intermediate: 1,
                advanced: 1
            },
            completed: {
                basic: [],
                intermediate: [],
                advanced: []
            }
        };

        // Duel Mode State
        this.duelScoreP1 = 0;
        this.duelScoreP2 = 0;
        this.duelCurrentQuestion = null;
        this.duelP1Locked = false;
        this.duelP2Locked = false;
        this.duelRoundTimer = null;

        // Time Attack State
        this.taTimer = null;
        this.taTimeRemaining = 60.0;
        this.taScore = 0;
        this.taCombo = 0;
        this.taSolved = 0;
        this.taCurrentQuestion = null;

        // Endless Mode State
        this.endlessWave = 1;
        this.endlessScore = 0;
        this.endlessLives = 3;
        this.endlessCurrentQuestion = null;

        // Boss Battle State
        this.bossMaxHp = 1000;
        this.bossHp = 1000;
        this.bossLives = 3;
        this.bossTurnSeconds = 15;
        this.bossTurnTimer = null;
        this.bossCurrentQuestion = null;

        this.initDOM();
        this.loadProgress();
        this.applyTheme(this.progress.equippedTheme || 'cyberpunk', false);
        this.renderMascotHats();
        this.setupFireworksAndConfetti();
        this.bindEvents();
        this.setupAutoplayAudio();
        this.updatePowerupBadges();
        this.initSpotlight();
        this.updateSidebars();
        this.initMascots();
    }

    initDOM() {
        // Screens
        this.screenLevelSelect = document.getElementById('screenLevelSelect');
        this.screenStageMap = document.getElementById('screenStageMap');
        this.screenGameplay = document.getElementById('screenGameplay');
        this.screenDuel = document.getElementById('screenDuel');
        this.screenTimeAttack = document.getElementById('screenTimeAttack');
        this.screenEndless = document.getElementById('screenEndless');
        this.screenBoss = document.getElementById('screenBoss');

        // Modals
        this.modalStageClear = document.getElementById('modalStageClear');
        this.modalLevelVictory = document.getElementById('modalLevelVictory');
        this.modalGameOver = document.getElementById('modalGameOver');
        this.modalShop = document.getElementById('modalShop');
        this.modalCertificate = document.getElementById('modalCertificate');
        this.modalDuelVictory = document.getElementById('modalDuelVictory');
        this.modalTimeAttackSummary = document.getElementById('modalTimeAttackSummary');
        this.modalBossVictory = document.getElementById('modalBossVictory');

        // Coin Displays
        this.headerCoinCount = document.getElementById('headerCoinCount');
        this.statTotalCoins = document.getElementById('statTotalCoins');
        this.shopCoinCount = document.getElementById('shopCoinCount');

        // Character Overlay
        this.characterOverlay = document.getElementById('characterOverlay');

        // Inputs & Labels
        this.userInput = document.getElementById('userAnswerInput');
        this.questionPrompt = document.getElementById('questionPrompt');
        this.questionDisplaySlot = document.getElementById('questionDisplaySlot');
        this.questionTypeTag = document.getElementById('questionTypeTag');
        this.hintBox = document.getElementById('hintBox');
        this.hintText = document.getElementById('hintText');
        this.feedbackBox = document.getElementById('feedbackBox');
        this.feedbackTitle = document.getElementById('feedbackTitle');
        this.feedbackDesc = document.getElementById('feedbackDesc');
        this.btnAudioSpeak = document.getElementById('btnAudioSpeak');
        this.btnReadPrompt = document.getElementById('btnReadPrompt');

        // Stats
        this.gameScoreDisplay = document.getElementById('gameScoreDisplay');
        this.gameComboDisplay = document.getElementById('gameComboDisplay');
        this.gameStageLabel = document.getElementById('gameStageLabel');
        this.livesContainer = document.getElementById('livesContainer');

        this.statTotalScore = document.getElementById('statTotalScore');
        this.statClearedStages = document.getElementById('statClearedStages');
        this.statMaxCombo = document.getElementById('statMaxCombo');
        this.bestTimeAttack = document.getElementById('bestTimeAttack');
        this.bestEndless = document.getElementById('bestEndless');
        this.bossDefeatedBadge = document.getElementById('bossDefeatedBadge');

        // Audio Volume Controls
        this.btnSoundToggle = document.getElementById('btnSoundToggle');
        this.bgmVolumeSlider = document.getElementById('bgmVolumeSlider');
        this.volumePercent = document.getElementById('volumePercent');

        if (this.bgmVolumeSlider) {
            const volPercent = Math.round(soundManager.bgmVolume * 100);
            this.bgmVolumeSlider.value = volPercent;
            if (this.volumePercent) this.volumePercent.textContent = `${volPercent}%`;
        }

        // Powerup Badges
        this.badgePowerReveal = document.getElementById('badgePowerReveal');
        this.badgePowerHeal = document.getElementById('badgePowerHeal');
        this.badgePowerSkip = document.getElementById('badgePowerSkip');
        this.btnPowerReveal = document.getElementById('btnPowerReveal');
        this.btnPowerHeal = document.getElementById('btnPowerHeal');
        this.btnPowerSkip = document.getElementById('btnPowerSkip');

        // Left Sidebar Profile & Achievements
        this.sidebarAvatar = document.getElementById('sidebarAvatar');
        this.sidebarRankName = document.getElementById('sidebarRankName');
        this.sidebarRankLevel = document.getElementById('sidebarRankLevel');
        this.sidebarExpFill = document.getElementById('sidebarExpFill');
        this.sidebarExpText = document.getElementById('sidebarExpText');
        this.sidebarNextExpText = document.getElementById('sidebarNextExpText');
        this.sidebarAchievements = document.getElementById('sidebarAchievements');

        // Right Sidebar Vault & Spotlight
        this.vaultCountReveal = document.getElementById('vaultCountReveal');
        this.vaultCountHeal = document.getElementById('vaultCountHeal');
        this.vaultCountSkip = document.getElementById('vaultCountSkip');
        this.spotlightWord = document.getElementById('spotlightWord');
        this.spotlightType = document.getElementById('spotlightType');
        this.spotlightDef = document.getElementById('spotlightDef');
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('EQA_PROGRESS');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.progress = {
                    ...this.progress,
                    ...parsed,
                    unlocked: { ...this.progress.unlocked, ...(parsed.unlocked || {}) },
                    completed: { ...this.progress.completed, ...(parsed.completed || {}) },
                    highScores: { ...this.progress.highScores, ...(parsed.highScores || {}) },
                    unlockedThemes: parsed.unlockedThemes || ['cyberpunk'],
                    unlockedHats: parsed.unlockedHats || ['none']
                };
            }
        } catch (e) {
            console.warn('Could not load saved progress:', e);
        }
        this.updateHomeStats();
        this.updateCoinDisplays();
    }

    saveProgress() {
        try {
            localStorage.setItem('EQA_PROGRESS', JSON.stringify(this.progress));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
        this.updateHomeStats();
        this.updateCoinDisplays();
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all game progress, coins, inventory and high scores?')) {
            this.progress = {
                totalScore: 0,
                maxCombo: 0,
                coins: 100,
                equippedTheme: 'cyberpunk',
                unlockedThemes: ['cyberpunk'],
                equippedHat: 'none',
                unlockedHats: ['none'],
                highScores: { timeAttack: 0, endless: 0, bossDefeated: 0, duelWinsP1: 0, duelWinsP2: 0 },
                unlocked: { basic: 1, intermediate: 1, advanced: 1 },
                completed: { basic: [], intermediate: [], advanced: [] }
            };
            this.inventory = { reveal: 2, heal: 1, skip: 1 };
            this.saveProgress();
            this.applyTheme('cyberpunk', true);
            this.renderMascotHats();
            this.updateHomeStats();
            this.updatePowerupBadges();
            soundManager.playClick();
        }
    }

    addCoins(amount) {
        if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return;
        this.progress.coins = Math.max(0, (this.progress.coins || 0) + amount);
        this.saveProgress();
        if (amount > 0) soundManager.playCoin();
        this.updateCoinDisplays();
    }

    updateCoinDisplays() {
        const c = this.progress.coins || 0;
        if (this.headerCoinCount) this.headerCoinCount.textContent = c;
        if (this.statTotalCoins) this.statTotalCoins.textContent = c;
        if (this.shopCoinCount) this.shopCoinCount.textContent = c;
    }

    updateHomeStats() {
        if (!this.statTotalScore) return;
        this.statTotalScore.textContent = this.progress.totalScore || 0;
        this.statMaxCombo.textContent = `${this.progress.maxCombo || 0}x`;

        let totalCompleted = 0;
        ['basic', 'intermediate', 'advanced'].forEach(lvl => {
            totalCompleted += (this.progress.completed[lvl] || []).length;
        });
        this.statClearedStages.textContent = `${totalCompleted}/33`;

        if (this.bestTimeAttack) this.bestTimeAttack.textContent = `Best: ${this.progress.highScores?.timeAttack || 0} pts`;
        if (this.bestEndless) this.bestEndless.textContent = `Best: Wave ${this.progress.highScores?.endless || 0}`;
        if (this.bossDefeatedBadge) this.bossDefeatedBadge.textContent = `Defeated: ${this.progress.highScores?.bossDefeated || 0}`;

        this.updateSidebars();
        this.updateCoinDisplays();
    }

    initSpotlight() {
        const item = SPOTLIGHT_VOCAB[this.spotlightIndex];
        if (this.spotlightWord) this.spotlightWord.textContent = item.word;
        if (this.spotlightType) this.spotlightType.textContent = item.type;
        if (this.spotlightDef) this.spotlightDef.textContent = item.def;
    }

    speakSpotlightWord() {
        const item = SPOTLIGHT_VOCAB[this.spotlightIndex];
        if (item && item.word) {
            soundManager.speakEnglish(item.word);
        }
    }

    updateSidebars() {
        const totalScore = this.progress.totalScore || 0;
        let totalCompleted = 0;
        let specialCleared = false;
        let anyTierCompleted = false;

        ['basic', 'intermediate', 'advanced'].forEach(lvl => {
            const list = this.progress.completed[lvl] || [];
            totalCompleted += list.length;
            if (list.includes(11)) specialCleared = true;
            if (list.length >= 10) anyTierCompleted = true;
        });

        // Rank & Level calculation
        let rankName = 'Novice Explorer';
        let rankSub = 'Level 1 • Adventurer';
        let avatar = '🌱';
        let currentLevelBase = 0;
        let nextLevelBase = 300;

        if (totalScore >= 3500) {
            rankName = 'Grand Archmage';
            rankSub = 'Level 5 • Paragon';
            avatar = '👑';
            currentLevelBase = 3500;
            nextLevelBase = 5000;
        } else if (totalScore >= 2000) {
            rankName = 'Master of Syntax';
            rankSub = 'Level 4 • Grand Master';
            avatar = '🐉';
            currentLevelBase = 2000;
            nextLevelBase = 3500;
        } else if (totalScore >= 1000) {
            rankName = 'Lexicon Sorcerer';
            rankSub = 'Level 3 • Specialist';
            avatar = '🧙‍♂️';
            currentLevelBase = 1000;
            nextLevelBase = 2000;
        } else if (totalScore >= 400) {
            rankName = 'Grammar Knight';
            rankSub = 'Level 2 • Adept';
            avatar = '⚡';
            currentLevelBase = 400;
            nextLevelBase = 1000;
        }

        const expSpan = nextLevelBase - currentLevelBase;
        const currentExpInLevel = Math.max(0, totalScore - currentLevelBase);
        const percent = Math.min(100, Math.max(10, Math.round((currentExpInLevel / expSpan) * 100)));

        if (this.sidebarAvatar) this.sidebarAvatar.textContent = avatar;
        if (this.sidebarRankName) this.sidebarRankName.textContent = rankName;
        if (this.sidebarRankLevel) this.sidebarRankLevel.textContent = rankSub;
        if (this.sidebarExpFill) this.sidebarExpFill.style.width = `${percent}%`;
        if (this.sidebarExpText) this.sidebarExpText.textContent = `${totalScore} EXP`;
        if (this.sidebarNextExpText) this.sidebarNextExpText.textContent = `${nextLevelBase} EXP`;

        // Update Achievements
        const achievements = [
            {
                id: 'first_win',
                icon: '🌟',
                title: 'First Victory',
                desc: 'Clear your 1st stage challenge',
                unlocked: totalCompleted >= 1
            },
            {
                id: 'streak_3',
                icon: '🔥',
                title: 'Streak Prodigy',
                desc: 'Achieve a 3x combo streak',
                unlocked: (this.progress.maxCombo || 0) >= 3
            },
            {
                id: 'secret_bonus',
                icon: '⭐',
                title: 'Secret Hunter',
                desc: 'Clear any Secret Bonus Stage',
                unlocked: specialCleared
            },
            {
                id: 'tier_master',
                icon: '👑',
                title: 'Tier Champion',
                desc: 'Complete all 10 stages in a tier',
                unlocked: anyTierCompleted
            },
            {
                id: 'score_1000',
                icon: '🧠',
                title: 'Lexicon Master',
                desc: 'Accumulate 1,000+ Total Score',
                unlocked: totalScore >= 1000
            }
        ];

        if (this.sidebarAchievements) {
            this.sidebarAchievements.innerHTML = achievements.map(ach => `
                <div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${ach.icon}</div>
                    <div class="achievement-details">
                        <h4>${ach.title}</h4>
                        <p>${ach.desc}</p>
                    </div>
                    <span class="achievement-status-badge">${ach.unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
            `).join('');
        }

        // Vault counts in right sidebar
        if (this.vaultCountReveal) this.vaultCountReveal.textContent = this.inventory.reveal;
        if (this.vaultCountHeal) this.vaultCountHeal.textContent = this.inventory.heal;
        if (this.vaultCountSkip) this.vaultCountSkip.textContent = this.inventory.skip;
    }

    setupAutoplayAudio() {
        const tryStartAudio = () => {
            if (!this.hasStartedAudio) {
                this.hasStartedAudio = true;
                soundManager.init();
                soundManager.startBGM();
            }
        };

        try {
            soundManager.init();
            soundManager.startBGM();
        } catch (e) {}

        ['click', 'touchstart', 'keydown', 'mousedown'].forEach(evt => {
            window.addEventListener(evt, tryStartAudio, { once: true, passive: true });
        });
    }

    bindEvents() {
        // Press Enter to submit answer
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.checkAnswer();
            }
        });

        // Volume Slider Control
        if (this.bgmVolumeSlider) {
            this.bgmVolumeSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                const volumeRatio = val / 100;
                soundManager.setBGMVolume(volumeRatio);

                if (this.volumePercent) {
                    this.volumePercent.textContent = `${val}%`;
                }

                if (this.btnSoundToggle) {
                    if (val === 0) {
                        this.btnSoundToggle.textContent = '🔇';
                    } else if (val < 50) {
                        this.btnSoundToggle.textContent = '🔉';
                    } else {
                        this.btnSoundToggle.textContent = '🔊';
                    }
                }
            });
        }

        // Mute / Unmute Button
        if (this.btnSoundToggle) {
            this.btnSoundToggle.addEventListener('click', () => {
                const muted = soundManager.toggleMute();
                if (muted) {
                    this.btnSoundToggle.textContent = '🔇';
                    if (this.bgmVolumeSlider) this.bgmVolumeSlider.value = 0;
                    if (this.volumePercent) this.volumePercent.textContent = '0%';
                } else {
                    this.btnSoundToggle.textContent = '🔊';
                    soundManager.setBGMVolume(0.7);
                    if (this.bgmVolumeSlider) this.bgmVolumeSlider.value = 70;
                    if (this.volumePercent) this.volumePercent.textContent = '70%';
                }
            });
        }

        // Reset progress button
        const resetBtn = document.getElementById('btnResetProgress');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAllData());
        }

        // Close modals when clicking the overlay backdrop outside of modal-content
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        });

        // Close modals when pressing Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Global Keyboard Shortcuts for 2-Player Duel Mode
        window.addEventListener('keydown', (e) => {
            if (!this.screenDuel || !this.screenDuel.classList.contains('active')) return;
            const key = e.key.toLowerCase();
            
            // Player 1: a, s, d, f
            if (['a', 's', 'd', 'f'].includes(key)) {
                const map = { 'a': 0, 's': 1, 'd': 2, 'f': 3 };
                this.handleDuelAnswer(1, map[key]);
            }
            // Player 2: h, j, k, l or 1,2,3,4
            if (['h', 'j', 'k', 'l'].includes(key)) {
                const map = { 'h': 0, 'j': 1, 'k': 2, 'l': 3 };
                this.handleDuelAnswer(2, map[key]);
            }
        });
    }

    switchScreen(screenName) {
        [
            this.screenLevelSelect,
            this.screenStageMap,
            this.screenGameplay,
            this.screenDuel,
            this.screenTimeAttack,
            this.screenEndless,
            this.screenBoss
        ].forEach(s => {
            if (s) s.classList.remove('active');
        });

        if (screenName === 'home' && this.screenLevelSelect) this.screenLevelSelect.classList.add('active');
        if (screenName === 'map' && this.screenStageMap) this.screenStageMap.classList.add('active');
        if (screenName === 'game' && this.screenGameplay) this.screenGameplay.classList.add('active');
        if (screenName === 'duel' && this.screenDuel) this.screenDuel.classList.add('active');
        if (screenName === 'timeattack' && this.screenTimeAttack) this.screenTimeAttack.classList.add('active');
        if (screenName === 'endless' && this.screenEndless) this.screenEndless.classList.add('active');
        if (screenName === 'boss' && this.screenBoss) this.screenBoss.classList.add('active');

        this.closeAllModals();
        if (screenName === 'home') {
            this.cleanupTimers();
            this.updateHomeStats();
        }
    }

    closeAllModals() {
        [
            this.modalStageClear,
            this.modalLevelVictory,
            this.modalGameOver,
            this.modalShop,
            this.modalCertificate,
            this.modalDuelVictory,
            this.modalTimeAttackSummary,
            this.modalBossVictory
        ].forEach(m => {
            if (m) m.classList.remove('active');
        });
    }

    cleanupTimers() {
        if (this.taTimer) { clearInterval(this.taTimer); this.taTimer = null; }
        if (this.bossTurnTimer) { clearInterval(this.bossTurnTimer); this.bossTurnTimer = null; }
        if (this.duelRoundTimer) { clearTimeout(this.duelRoundTimer); this.duelRoundTimer = null; }
    }

    // 1. Navigation: Level Select -> Stage Map
    selectLevel(levelKey) {
        soundManager.playClick();
        this.currentLevel = levelKey;
        const levelData = QUESTION_BANK[levelKey];

        const mapLevelBadge = document.getElementById('mapLevelBadge');
        const mapLevelTitle = document.getElementById('mapLevelTitle');
        const mapLevelDesc = document.getElementById('mapLevelDesc');

        mapLevelBadge.textContent = levelData.name.toUpperCase();
        mapLevelBadge.style.background = `${levelData.badgeColor}22`;
        mapLevelBadge.style.color = levelData.badgeColor;
        mapLevelBadge.style.border = `1px solid ${levelData.badgeColor}66`;

        mapLevelTitle.textContent = levelData.badgeName;
        mapLevelDesc.textContent = levelData.description;

        this.renderStageGrid();
        this.switchScreen('map');
    }

    renderStageGrid() {
        const grid = document.getElementById('stageGrid');
        grid.innerHTML = '';

        const levelData = QUESTION_BANK[this.currentLevel];
        const unlockedCount = this.progress.unlocked[this.currentLevel] || 1;
        const completedList = this.progress.completed[this.currentLevel] || [];

        levelData.stages.forEach((stg, index) => {
            const btn = document.createElement('button');
            btn.className = 'stage-btn';
            const stageNum = index + 1;
            const isUnlocked = stageNum <= unlockedCount;
            const isCompleted = completedList.includes(stageNum);
            const isBoss = stageNum === 10;
            const isSpecial = stg.isSpecial || stageNum === 11;

            if (isSpecial) {
                btn.classList.add('special-stage');
                if (isCompleted) {
                    btn.classList.add('completed', 'unlocked');
                    btn.innerHTML = `<span>⭐ BONUS STAGE</span><span class="stage-status-icon">✓ CLEARED</span>`;
                } else if (isUnlocked) {
                    btn.classList.add('unlocked');
                    btn.innerHTML = `<span>⭐ BONUS STAGE</span><span class="stage-status-icon">🔥 UNLOCKED</span>`;
                } else {
                    btn.classList.add('locked');
                    btn.innerHTML = `<span>⭐ BONUS STAGE</span><span class="stage-status-icon">🔒 LOCKED</span>`;
                }
            } else if (isCompleted) {
                btn.classList.add('completed', 'unlocked');
                btn.innerHTML = `<span>${stageNum}</span><span class="stage-status-icon">✓</span>`;
            } else if (isUnlocked) {
                btn.classList.add('unlocked');
                btn.innerHTML = `<span>${stageNum}</span>${isBoss ? '<span class="boss-icon">👑</span>' : '<span class="stage-status-icon">●</span>'}`;
            } else {
                btn.classList.add('locked');
                btn.innerHTML = `<span>${stageNum}</span><span class="stage-status-icon">🔒</span>`;
            }

            if (isUnlocked) {
                btn.onclick = () => this.startStage(index);
            }

            grid.appendChild(btn);
        });
    }

    goToHome() {
        soundManager.playClick();
        this.updateHomeStats();
        this.switchScreen('home');
    }

    goToStageMap() {
        soundManager.playClick();
        this.renderStageGrid();
        this.switchScreen('map');
    }

    // 2. Start Stage
    startStage(stageIndex) {
        soundManager.playClick();
        this.currentStageIndex = stageIndex;
        this.lives = 3;
        this.hintUsed = false;
        this.updateHearts();
        this.hideFeedback();
        this.hideHint();
        this.updatePowerupBadges();

        const stageData = QUESTION_BANK[this.currentLevel].stages[stageIndex];
        const isSpecial = stageData.isSpecial || stageData.stage === 11;
        
        this.gameStageLabel.textContent = isSpecial ? '⭐ SPECIAL BONUS' : `Stage ${stageData.stage}/10`;
        this.questionTypeTag.textContent = stageData.type.toUpperCase().replace(/_/g, ' ');
        this.questionPrompt.textContent = stageData.prompt;
        this.questionDisplaySlot.textContent = stageData.display;
        this.hintText.textContent = stageData.hint;

        this.userInput.value = '';
        this.userInput.className = 'user-text-input';
        this.updateScoreComboUI();

        this.switchScreen('game');
        setTimeout(() => this.userInput.focus(), 300);
    }

    updateHearts() {
        for (let i = 1; i <= 3; i++) {
            const heart = document.getElementById(`heart${i}`);
            if (i <= this.lives) {
                heart.classList.remove('lost');
            } else {
                heart.classList.add('lost');
            }
        }
    }

    updateScoreComboUI() {
        this.gameScoreDisplay.textContent = `Score: ${this.score}`;
        if (this.combo > 1) {
            this.gameComboDisplay.textContent = `🔥 ${this.combo}x STREAK`;
            this.gameComboDisplay.classList.add('active');
        } else {
            this.gameComboDisplay.classList.remove('active');
        }
    }

    // ==========================================
    // AUDIO READING (Full Question vs Target Word)
    // ==========================================
    speakFullPrompt() {
        const stageData = QUESTION_BANK[this.currentLevel].stages[this.currentStageIndex];
        if (stageData && stageData.prompt) {
            // Clean prompt of markdown stars or brackets for clear speech
            const cleanText = stageData.prompt.replace(/[*_~\[\]➔]/g, ' ');
            soundManager.speakEnglish(
                cleanText,
                () => {
                    if (this.btnReadPrompt) this.btnReadPrompt.classList.add('speaking');
                },
                () => {
                    if (this.btnReadPrompt) this.btnReadPrompt.classList.remove('speaking');
                }
            );
        }
    }

    speakCurrentPrompt() {
        const stageData = QUESTION_BANK[this.currentLevel].stages[this.currentStageIndex];
        if (stageData && stageData.audioText) {
            soundManager.speakEnglish(
                stageData.audioText,
                () => {
                    if (this.btnAudioSpeak) this.btnAudioSpeak.classList.add('speaking');
                },
                () => {
                    if (this.btnAudioSpeak) this.btnAudioSpeak.classList.remove('speaking');
                }
            );
        }
    }

    useHint() {
        if (this.hintUsed) return;
        this.hintUsed = true;
        soundManager.playHint();
        this.hintBox.classList.add('show');
    }

    hideHint() {
        this.hintBox.classList.remove('show');
    }

    // ==========================================
    // POWER-UP INVENTORY SYSTEM
    // ==========================================
    updatePowerupBadges() {
        if (this.badgePowerReveal) this.badgePowerReveal.textContent = this.inventory.reveal;
        if (this.badgePowerHeal) this.badgePowerHeal.textContent = this.inventory.heal;
        if (this.badgePowerSkip) this.badgePowerSkip.textContent = this.inventory.skip;

        if (this.btnPowerReveal) this.btnPowerReveal.disabled = (this.inventory.reveal <= 0);
        if (this.btnPowerSkip) this.btnPowerSkip.disabled = (this.inventory.skip <= 0);
        
        // Keep heal button active so player can click it or see why
        if (this.btnPowerHeal) {
            this.btnPowerHeal.disabled = (this.inventory.heal <= 0);
            if (this.lives < 3 && this.inventory.heal > 0) {
                this.btnPowerHeal.classList.add('heal-active');
            } else {
                this.btnPowerHeal.classList.remove('heal-active');
            }
        }

        if (this.vaultCountReveal) this.vaultCountReveal.textContent = this.inventory.reveal;
        if (this.vaultCountHeal) this.vaultCountHeal.textContent = this.inventory.heal;
        if (this.vaultCountSkip) this.vaultCountSkip.textContent = this.inventory.skip;
    }

    usePowerupReveal() {
        if (this.inventory.reveal <= 0) return;
        this.inventory.reveal -= 1;
        this.updatePowerupBadges();
        soundManager.playPowerup();

        const stageData = QUESTION_BANK[this.currentLevel].stages[this.currentStageIndex];
        const fullAnswer = stageData.answer;
        const currentVal = this.userInput.value || '';

        // Fill in starting characters of correct answer
        const revealLength = Math.min(fullAnswer.length, Math.max(2, currentVal.length + 1));
        this.userInput.value = fullAnswer.substring(0, revealLength);
        this.userInput.focus();
        this.showFeedback(true, '✨ POWER-UP ACTIVATED!', `Revealed first ${revealLength} letters of the secret answer!`);
    }

    usePowerupHeal() {
        if (this.inventory.heal <= 0) {
            this.showFeedback(false, '⚠️ NO HEARTS LEFT', 'Clear more stages to earn bonus Heart power-ups!');
            soundManager.playWrong();
            return;
        }

        if (this.lives >= 3) {
            this.showFeedback(false, '💖 FULL HEALTH (3/3)', 'Your hearts are already full! Use this when you make a mistake to recover life.');
            soundManager.playHint();
            return;
        }

        this.inventory.heal -= 1;
        this.lives = Math.min(3, this.lives + 1);
        this.updateHearts();
        this.updatePowerupBadges();
        soundManager.playPowerup();
        this.showFeedback(true, '💖 EXTRA LIFE RESTORED!', `Recovered 1 heart life! Current HP: ${this.lives}/3 ❤️`);
    }

    reviveWithHeart() {
        if (this.inventory.heal <= 0) return;
        this.inventory.heal -= 1;
        this.lives = 1;
        this.updateHearts();
        this.updatePowerupBadges();
        this.closeAllModals();
        soundManager.playPowerup();
        this.showFeedback(true, '💖 REVIVED!', 'Emergency revival successful! You have 1 heart remaining.');
        setTimeout(() => this.userInput.focus(), 300);
    }

    usePowerupSkip() {
        if (this.inventory.skip <= 0) return;
        this.inventory.skip -= 1;
        this.updatePowerupBadges();
        soundManager.playPowerup();

        const stageData = QUESTION_BANK[this.currentLevel].stages[this.currentStageIndex];
        this.userInput.value = stageData.answer;
        this.checkAnswer();
    }

    // ==========================================
    // 3. ANSWER CHECKING LOGIC
    // ==========================================
    normalizeAnswer(str) {
        return (str || '')
            .trim()
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s+/g, " ");
    }

    checkAnswer() {
        const stageData = QUESTION_BANK[this.currentLevel].stages[this.currentStageIndex];
        const userVal = this.normalizeAnswer(this.userInput.value);
        if (!userVal) {
            this.userInput.focus();
            return;
        }

        const validAnswers = [
            this.normalizeAnswer(stageData.answer),
            ...(stageData.alternatives || []).map(a => this.normalizeAnswer(a))
        ];

        const isCorrect = validAnswers.includes(userVal);

        if (isCorrect) {
            this.handleCorrect(stageData);
        } else {
            this.handleWrong(stageData);
        }
    }

    handleCorrect(stageData) {
        this.combo += 1;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        const isSpecial = stageData.isSpecial || stageData.stage === 11;
        const baseScore = isSpecial ? 250 : 100;
        const comboBonus = (this.combo - 1) * 35;
        const hintPenalty = this.hintUsed ? 30 : 0;
        const earned = Math.max(50, baseScore + comboBonus - hintPenalty);

        this.score += earned;
        this.progress.totalScore += earned;
        if (this.maxCombo > (this.progress.maxCombo || 0)) {
            this.progress.maxCombo = this.maxCombo;
        }

        // Rewards for clearing stages: gain extra power-ups & coins!
        const coinEarned = isSpecial ? 50 : (20 + Math.min(this.combo * 5, 25));
        this.addCoins(coinEarned);

        if (stageData.stage === 5 || stageData.stage === 10) {
            this.inventory.reveal += 1;
            this.inventory.heal += 1;
            this.addCoins(100);
            this.updatePowerupBadges();
        }

        const stageNum = stageData.stage;
        const completedArr = this.progress.completed[this.currentLevel];
        if (!completedArr.includes(stageNum)) {
            completedArr.push(stageNum);
        }

        const totalStagesInTier = QUESTION_BANK[this.currentLevel].stages.length;
        const nextStageNum = stageNum + 1;
        if (nextStageNum <= totalStagesInTier && this.progress.unlocked[this.currentLevel] < nextStageNum) {
            this.progress.unlocked[this.currentLevel] = nextStageNum;
        }

        this.saveProgress();
        this.updateScoreComboUI();

        // 🌟 1. Play SFX & Fireworks Audio
        soundManager.playCorrect();
        setTimeout(() => soundManager.playFirework(), 200);
        if (this.combo > 1) {
            setTimeout(() => soundManager.playCombo(this.combo), 400);
        }

        // 🌟 2. Trigger Animated Mascot Running Celebration
        this.triggerCharacterCelebration();

        // 🌟 3. Launch Fireworks & Confetti
        this.launchFireworksBurst(isSpecial ? 6 : 3);
        this.fireConfetti(isSpecial ? 100 : 70);

        this.userInput.classList.add('correct-pulse');
        this.showFeedback(true, isSpecial ? '⭐ SPECIAL BONUS CLEARED! (+50 🪙)' : `🎉 CORRECT ANSWER! (+${coinEarned} 🪙)`, `${stageData.explanation || ''}`);

        setTimeout(() => {
            if (this.currentStageIndex === totalStagesInTier - 1) {
                this.showLevelVictory();
            } else {
                this.showStageClearModal(earned);
            }
        }, 1600);
    }

    handleWrong(stageData) {
        this.combo = 0;
        this.lives -= 1;
        this.updateHearts();
        this.updateScoreComboUI();
        this.updatePowerupBadges();

        soundManager.playWrong();
        this.userInput.classList.add('wrong-shake');
        setTimeout(() => {
            this.userInput.classList.remove('wrong-shake');
        }, 400);

        if (this.lives > 0) {
            this.showFeedback(false, '❌ NOT QUITE RIGHT!', 'Check spelling, click "💡 Get Hint", or use "🔤 Reveal Letter" / "💖 +1 Heart" power-up.');
            this.userInput.select();
        } else {
            // Game Over
            const failElem = document.getElementById('modalGameOverAnswer');
            if (failElem) {
                failElem.innerHTML = `<strong>📝 Correct Answer:</strong> <span style="color:#fbbf24; font-weight:900;">${stageData.answer}</span><br><br>${stageData.explanation || ''}`;
            }

            const reviveBtn = document.getElementById('btnReviveWithHeart');
            if (reviveBtn) {
                reviveBtn.style.display = this.inventory.heal > 0 ? 'block' : 'none';
            }

            setTimeout(() => {
                this.modalGameOver.classList.add('active');
            }, 600);
        }
    }

    showFeedback(isCorrect, title, desc) {
        this.feedbackBox.className = `feedback-box ${isCorrect ? 'correct' : 'wrong'}`;
        this.feedbackTitle.textContent = title;
        this.feedbackDesc.textContent = desc;
    }

    hideFeedback() {
        this.feedbackBox.className = 'feedback-box';
    }

    showStageClearModal(earned) {
        document.getElementById('modalEarnedScore').textContent = `+${earned}`;
        document.getElementById('modalComboCount').textContent = `${this.combo}x`;
        const stageData = QUESTION_BANK[this.currentLevel].stages[this.currentStageIndex];
        const explElem = document.getElementById('modalStageExplanation');
        if (explElem) {
            explElem.innerHTML = `<strong>💡 Knowledge & Insights:</strong><br>${stageData.explanation || ''}`;
        }
        this.modalStageClear.classList.add('active');
    }

    closeAllModals() {
        const modals = [
            this.modalStageClear,
            this.modalLevelVictory,
            this.modalGameOver,
            this.modalShop,
            this.modalCertificate,
            this.modalDuelVictory,
            this.modalTimeAttackSummary,
            this.modalBossVictory
        ];
        modals.forEach(m => {
            if (m) m.classList.remove('active');
        });
    }

    nextStage() {
        soundManager.playClick();
        this.closeAllModals();
        const totalStages = QUESTION_BANK[this.currentLevel].stages.length;
        if (this.currentStageIndex < totalStages - 1) {
            this.startStage(this.currentStageIndex + 1);
        } else {
            this.goToStageMap();
        }
    }

    retryStage() {
        soundManager.playClick();
        this.closeAllModals();
        this.startStage(this.currentStageIndex);
    }

    showLevelVictory() {
        soundManager.playVictory();
        this.launchFireworksBurst(6);
        this.fireConfetti(140);
        const levelData = QUESTION_BANK[this.currentLevel];
        document.getElementById('victoryLevelName').textContent = `Magnificent! You have conquered all stages including the Secret Bonus of the ${levelData.name} tier!`;
        document.getElementById('victoryTotalScore').textContent = this.score;
        this.modalLevelVictory.classList.add('active');
    }

    // ==========================================
    // 4. ANIMATED VICTORY CHARACTER CELEBRATION
    // ==========================================
    triggerCharacterCelebration() {
        if (!this.characterOverlay) return;

        const quotes = [
            'WOOHOO! 🚀',
            'PERFECT! 🔥',
            'STAGE CLEAR! 🌟',
            'UNSTOPPABLE! ⚡',
            'GENIUS! 🧠',
            'EXCELLENT! ✨'
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        const runner = document.createElement('div');
        runner.className = 'victory-runner-container running';
        runner.innerHTML = `
            <div class="runner-speech-bubble">${quote}</div>
            <div class="runner-avatar-box">
                <svg class="runner-sprite" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 45 C15 35, 5 65, 12 78 C22 72, 32 60, 35 52 Z" fill="#ec4899">
                        <animate attributeName="d" values="M25 45 C15 35, 5 65, 12 78 C22 72, 32 60, 35 52 Z; M25 45 C10 25, 2 55, 8 72 C20 65, 30 55, 35 52 Z; M25 45 C15 35, 5 65, 12 78 C22 72, 32 60, 35 52 Z" dur="0.25s" repeatCount="indefinite" />
                    </path>
                    <circle cx="50" cy="48" r="22" fill="#6366f1" stroke="#3b82f6" stroke-width="3"/>
                    <polygon points="50,38 53,44 60,45 55,50 56,57 50,53 44,57 45,50 40,45 47,44" fill="#fbbf24" />
                    <rect x="30" y="32" width="40" height="8" rx="4" fill="#f43f5e"/>
                    <circle cx="50" cy="36" r="4" fill="#fbbf24"/>
                    <ellipse cx="43" cy="46" rx="4.5" ry="6" fill="#ffffff"/>
                    <ellipse cx="57" cy="46" rx="4.5" ry="6" fill="#ffffff"/>
                    <circle cx="44" cy="46" r="2.5" fill="#0f172a"/>
                    <circle cx="58" cy="46" r="2.5" fill="#0f172a"/>
                    <path d="M43 56 Q50 64 57 56" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
                    <line x1="42" y1="68" x2="30" y2="86" stroke="#f43f5e" stroke-width="6" stroke-linecap="round">
                        <animate attributeName="x2" values="30; 58; 30" dur="0.2s" repeatCount="indefinite"/>
                        <animate attributeName="y2" values="86; 74; 86" dur="0.2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="58" y1="68" x2="70" y2="74" stroke="#f43f5e" stroke-width="6" stroke-linecap="round">
                        <animate attributeName="x2" values="70; 42; 70" dur="0.2s" repeatCount="indefinite"/>
                        <animate attributeName="y2" values="74; 86; 74" dur="0.2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="32" y1="48" x2="18" y2="30" stroke="#818cf8" stroke-width="5" stroke-linecap="round">
                        <animate attributeName="y2" values="30; 24; 30" dur="0.2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="68" y1="48" x2="82" y2="30" stroke="#818cf8" stroke-width="5" stroke-linecap="round">
                        <animate attributeName="y2" values="30; 24; 30" dur="0.2s" repeatCount="indefinite"/>
                    </line>
                </svg>
                <div class="runner-sparkles">✨💨</div>
            </div>
        `;

        this.characterOverlay.appendChild(runner);

        setTimeout(() => {
            if (runner.parentNode) {
                runner.parentNode.removeChild(runner);
            }
        }, 2300);
    }

    // ==========================================
    // 5. FIREWORKS & CONFETTI ENGINE
    // ==========================================
    setupFireworksAndConfetti() {
        this.canvas = document.getElementById('confettiCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.fireworks = [];

        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    launchFireworksBurst(count = 3) {
        if (!this.canvas) return;
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#fbbf24', '#a855f7'];

        for (let b = 0; b < count; b++) {
            setTimeout(() => {
                const targetX = this.canvas.width * (0.2 + Math.random() * 0.6);
                const targetY = this.canvas.height * (0.15 + Math.random() * 0.35);
                const burstColor = colors[Math.floor(Math.random() * colors.length)];

                this.fireworks.push({
                    x: targetX + (Math.random() * 80 - 40),
                    y: this.canvas.height,
                    targetY: targetY,
                    vy: -14 - Math.random() * 4,
                    color: burstColor,
                    exploded: false
                });

                if (!this.isAnimatingFX) {
                    this.animateFX();
                }
            }, b * 220);
        }
    }

    explodeFirework(x, y, baseColor) {
        const particleCount = 45;
        const colors = [baseColor, '#ffffff', '#fbbf24', '#38bdf8'];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
                vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
                size: Math.random() * 3.5 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: 0,
                rotSpeed: 0,
                opacity: 1,
                decay: Math.random() * 0.018 + 0.015,
                isSparkle: true
            });
        }
    }

    fireConfetti(count = 70) {
        if (!this.canvas) return;
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.canvas.width / 2 + (Math.random() * 240 - 120),
                y: this.canvas.height / 2 + (Math.random() * 120 - 60),
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 18,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: Math.random() * 0.015 + 0.012,
                isSparkle: false
            });
        }

        if (!this.isAnimatingFX) {
            this.animateFX();
        }
    }

    animateFX() {
        this.isAnimatingFX = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Update & Draw Fireworks Rockets
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.y += fw.vy;

            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = fw.color;
            this.ctx.shadowColor = fw.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            if (fw.y <= fw.targetY || fw.vy >= 0) {
                this.explodeFirework(fw.x, fw.y, fw.color);
                this.fireworks.splice(i, 1);
            }
        }

        // 2. Update & Draw Confetti & Explosion Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.isSparkle ? 0.12 : 0.35;
            p.vx *= 0.98;
            p.rotation += p.rotSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.globalAlpha = p.opacity;

            if (p.isSparkle) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 8;
                this.ctx.fill();
            } else {
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0 || this.fireworks.length > 0) {
            requestAnimationFrame(() => this.animateFX());
        } else {
            this.isAnimatingFX = false;
        }
    }

    // ==========================================
    // 6. CUTE ROAMING MASCOT INTERACTIONS
    // ==========================================
    initMascots() {
        this.mascotLeft = document.getElementById('mascotLeft');
        this.mascotRight = document.getElementById('mascotRight');
        this.mascotSpeechLeft = document.getElementById('mascotSpeechLeft');
        this.mascotSpeechRight = document.getElementById('mascotSpeechRight');
        this.mascotSparkleLeft = document.getElementById('mascotSparkleLeft');
        this.mascotSparkleRight = document.getElementById('mascotSparkleRight');

        this.mascotPetCounts = { left: 0, right: 0 };

        this.mascotLeftQuotes = [
            'Meow! 🐾 Welcome Adventurer! ✨',
            'English is fun! Let\'s go! 🚀',
            'Purr~ Click me again! ฅ^•ﻌ•^ฅ',
            'You have incredible potential! 🌟',
            'Master every stage, Champion! 🎮',
            'Meow-velous reflexes! 🐱💖',
            'Keep your streak on fire! 🔥',
            'High Five! 🐾 +Energy Boost!'
        ];

        this.mascotRightQuotes = [
            'Let\'s Go! ⚡ High Score Time!',
            'Woof! You can do it! 🚀⭐',
            'Keep that combo streak alive! 🔥',
            '100% Accuracy incoming! 🎯',
            'Believe in yourself! Woof! 🐾',
            'Super Explorer energy! 🐾✨',
            'Grammar Knight in the making! 🛡️',
            'Double Points incoming! 🏆⚡'
        ];

        this.mascotLeftTimer = null;
        this.mascotRightTimer = null;

        // Auto greeting speech bubble on initial load
        setTimeout(() => {
            this.showMascotBubble('left', 'Meow! 🐾 Welcome Adventurer!', 3200);
            setTimeout(() => {
                this.showMascotBubble('right', 'Let\'s Go! ⚡ High Score!', 3200);
            }, 1400);
        }, 800);
    }

    showMascotBubble(side, text, duration = 3200) {
        const bubble = side === 'left' ? this.mascotSpeechLeft : this.mascotSpeechRight;
        if (!bubble) return;

        bubble.textContent = text;
        bubble.classList.add('active');

        const timerKey = side === 'left' ? 'mascotLeftTimer' : 'mascotRightTimer';
        if (this[timerKey]) clearTimeout(this[timerKey]);

        this[timerKey] = setTimeout(() => {
            bubble.classList.remove('active');
        }, duration);
    }

    interactMascot(side) {
        soundManager.playMascotPet(side);

        const isLeft = (side === 'left');
        const mascotEl = isLeft ? this.mascotLeft : this.mascotRight;
        const sparkleEl = isLeft ? this.mascotSparkleLeft : this.mascotSparkleRight;
        const quotes = isLeft ? this.mascotLeftQuotes : this.mascotRightQuotes;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        this.mascotPetCounts[side] = (this.mascotPetCounts[side] || 0) + 1;

        // Easter Egg: Every 4 clicks gives +5 Gold Coins gift!
        if (this.mascotPetCounts[side] % 4 === 0) {
            this.addCoins(5);
            soundManager.playCoin();
            this.showMascotBubble(side, `🎁 Mascot Gift! +5 Coins 🪙`, 3600);
            this.fireConfetti(35);
        } else {
            this.showMascotBubble(side, randomQuote, 3400);
            this.fireConfetti(15);
        }

        // Visual Sparkle Pop with random dynamic emojis
        if (sparkleEl) {
            const sparkleEmojis = isLeft 
                ? ['✨💖🐾', '🌸🐱✨', '💫💖🐾', '🌟🐱💎'] 
                : ['⭐🔥🎉', '🌟🐶🚀', '⚡💎⭐', '🐾🔥✨'];
            sparkleEl.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
            
            sparkleEl.classList.remove('pop');
            void sparkleEl.offsetWidth; // Force reflow
            sparkleEl.classList.add('pop');
            setTimeout(() => sparkleEl.classList.remove('pop'), 650);
        }

        // Aerial 360 Spin Flip with scale bounce
        if (mascotEl) {
            mascotEl.classList.remove('spin-flip');
            void mascotEl.offsetWidth; // Force reflow
            mascotEl.classList.add('spin-flip');
            setTimeout(() => {
                mascotEl.classList.remove('spin-flip');
            }, 780);
        }
    }

    // ==========================================
    // 7. 🛒 ARCADE SHOP, THEMES & MASCOT WARDROBE
    // ==========================================
    openShop() {
        soundManager.playClick();
        this.updateShopUI();
        if (this.modalShop) this.modalShop.classList.add('active');
    }

    switchShopTab(tabName) {
        soundManager.playClick();
        const tabs = document.querySelectorAll('.shop-tab-btn');
        const panes = document.querySelectorAll('.shop-tab-pane');
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        if (tabName === 'powerups') {
            tabs[0]?.classList.add('active');
            document.getElementById('shopTabPowerups')?.classList.add('active');
        } else if (tabName === 'themes') {
            tabs[1]?.classList.add('active');
            document.getElementById('shopTabThemes')?.classList.add('active');
        } else if (tabName === 'hats') {
            tabs[2]?.classList.add('active');
            document.getElementById('shopTabHats')?.classList.add('active');
        }
    }

    updateShopUI() {
        this.updateCoinDisplays();
        const ownedReveal = document.getElementById('shopOwnedReveal');
        const ownedHeal = document.getElementById('shopOwnedHeal');
        const ownedSkip = document.getElementById('shopOwnedSkip');

        if (ownedReveal) ownedReveal.textContent = this.inventory.reveal;
        if (ownedHeal) ownedHeal.textContent = this.inventory.heal;
        if (ownedSkip) ownedSkip.textContent = this.inventory.skip;

        // Update Theme Buttons
        const themes = ['cyberpunk', 'synthwave', 'emerald', 'pastel', 'midnight'];
        themes.forEach(theme => {
            const btn = document.getElementById(`btnTheme${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
            if (!btn) return;

            const isUnlocked = (this.progress.unlockedThemes || ['cyberpunk']).includes(theme);
            const isEquipped = (this.progress.equippedTheme === theme);

            if (isEquipped) {
                btn.className = 'shop-theme-action-btn equipped';
                btn.textContent = '✓ Equipped';
                btn.disabled = true;
            } else if (isUnlocked) {
                btn.className = 'shop-theme-action-btn';
                btn.textContent = 'Equip';
                btn.disabled = false;
            } else {
                btn.className = 'shop-theme-action-btn';
                const costs = { synthwave: 300, emerald: 300, pastel: 400, midnight: 500 };
                btn.textContent = `🪙 ${costs[theme] || 300} Unlock`;
                btn.disabled = false;
            }
        });

        // Update Hat Buttons
        const hats = ['none', 'wizard', 'crown', 'goggles', 'halo', 'pirate'];
        hats.forEach(hat => {
            const btn = document.getElementById(`btnHat${hat.charAt(0).toUpperCase() + hat.slice(1)}`);
            if (!btn) return;

            const isUnlocked = (this.progress.unlockedHats || ['none']).includes(hat);
            const isEquipped = (this.progress.equippedHat === hat);

            if (isEquipped) {
                btn.className = 'shop-hat-action-btn equipped';
                btn.textContent = '✓ Equipped';
                btn.disabled = true;
            } else if (isUnlocked) {
                btn.className = 'shop-hat-action-btn';
                btn.textContent = 'Equip';
                btn.disabled = false;
            } else {
                btn.className = 'shop-hat-action-btn';
                const costs = { wizard: 250, crown: 400, goggles: 200, halo: 300, pirate: 250 };
                btn.textContent = `🪙 ${costs[hat] || 250} Unlock`;
                btn.disabled = false;
            }
        });
    }

    buyItem(type, cost) {
        if ((this.progress.coins || 0) < cost) {
            soundManager.playWrong();
            alert('Not enough coins! Clear more stages or win challenges to earn coins 🪙');
            return;
        }

        this.progress.coins -= cost;
        this.inventory[type] = (this.inventory[type] || 0) + 1;
        this.saveProgress();
        this.updatePowerupBadges();
        this.updateShopUI();
        soundManager.playPowerup();
        this.fireConfetti(30);
    }

    applyTheme(themeId, save = true) {
        document.body.dataset.theme = themeId;
        this.progress.equippedTheme = themeId;
        if (save) {
            this.saveProgress();
            this.updateShopUI();
            soundManager.playClick();
        }
    }

    buyOrEquipTheme(themeId, cost) {
        const unlocked = this.progress.unlockedThemes || ['cyberpunk'];
        if (unlocked.includes(themeId)) {
            this.applyTheme(themeId);
            return;
        }

        if ((this.progress.coins || 0) < cost) {
            soundManager.playWrong();
            alert('Not enough coins to unlock this theme! 🪙');
            return;
        }

        this.progress.coins -= cost;
        unlocked.push(themeId);
        this.progress.unlockedThemes = unlocked;
        this.applyTheme(themeId);
        soundManager.playVictory();
        this.fireConfetti(50);
    }

    equipHat(hatId, save = true) {
        this.progress.equippedHat = hatId;
        this.renderMascotHats();
        if (save) {
            this.saveProgress();
            this.updateShopUI();
            soundManager.playClick();
        }
    }

    buyOrEquipHat(hatId, cost) {
        const unlocked = this.progress.unlockedHats || ['none'];
        if (unlocked.includes(hatId)) {
            this.equipHat(hatId);
            return;
        }

        if ((this.progress.coins || 0) < cost) {
            soundManager.playWrong();
            alert('Not enough coins to unlock this wardrobe accessory! 🪙');
            return;
        }

        this.progress.coins -= cost;
        unlocked.push(hatId);
        this.progress.unlockedHats = unlocked;
        this.equipHat(hatId);
        soundManager.playVictory();
        this.fireConfetti(50);
    }

    renderMascotHats() {
        const hatId = this.progress.equippedHat || 'none';
        ['mascotLeft', 'mascotRight'].forEach(mId => {
            const mascotEl = document.getElementById(mId);
            if (!mascotEl) return;

            let hatContainer = mascotEl.querySelector('.mascot-equipped-hat');
            if (!hatContainer) {
                hatContainer = document.createElement('div');
                hatContainer.className = 'mascot-equipped-hat';
                mascotEl.appendChild(hatContainer);
            }

            hatContainer.style.position = 'absolute';
            hatContainer.style.top = '-20px';
            hatContainer.style.left = '50%';
            hatContainer.style.transform = 'translateX(-50%)';
            hatContainer.style.fontSize = '2.2rem';
            hatContainer.style.pointerEvents = 'none';
            hatContainer.style.zIndex = '15';
            hatContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';

            const emojis = {
                none: '',
                wizard: '🧙‍♂️',
                crown: '👑',
                goggles: '🥽',
                halo: '😇',
                pirate: '🏴‍☠️'
            };

            hatContainer.textContent = emojis[hatId] || '';
        });
    }

    // ==========================================
    // 8. 📜 SHAREABLE DIGITAL CERTIFICATE
    // ==========================================
    openCertificate() {
        soundManager.playClick();
        this.closeAllModals();
        if (this.modalCertificate) this.modalCertificate.classList.add('active');
        this.renderCertificateCanvas();
    }

    renderCertificateCanvas() {
        const canvas = document.getElementById('certificateCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const nameInput = document.getElementById('certPlayerNameInput');
        const playerName = (nameInput && nameInput.value.trim()) || 'Punnawit Janthamrong';

        const w = 1200;
        const h = 800;
        canvas.width = w;
        canvas.height = h;

        // 1. Deep Obsidian & Midnight Navy Radial Gradient Background
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, 680);
        bgGrad.addColorStop(0, '#10172a');
        bgGrad.addColorStop(0.55, '#0b1120');
        bgGrad.addColorStop(1, '#030712');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Faint Golden Guilloche Security Pattern / Geometric Rings
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.035)';
        ctx.lineWidth = 1.2;
        for (let r = 80; r <= 560; r += 45) {
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Diamond Lattice Watermark
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.025)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 60; x < w - 60; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 60);
            ctx.lineTo(x + (h - 120), h - 60);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, 60);
            ctx.lineTo(x - (h - 120), h - 60);
            ctx.stroke();
        }
        ctx.restore();

        // 3. Triple Royal Gold Luxury Filigree Borders
        // Outer Heavy Gold Border
        const borderGrad = ctx.createLinearGradient(0, 0, w, h);
        borderGrad.addColorStop(0, '#fef08a');
        borderGrad.addColorStop(0.25, '#d97706');
        borderGrad.addColorStop(0.5, '#fbbf24');
        borderGrad.addColorStop(0.75, '#b45309');
        borderGrad.addColorStop(1, '#fde68a');

        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 6;
        ctx.strokeRect(26, 26, w - 52, h - 52);

        // Middle Thin Pinstripe
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(36, 36, w - 72, h - 72);

        // Inner Dashed Gold Border
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(48, 48, w - 96, h - 96);
        ctx.restore();

        // 4. Ornate Corner Fleurons & Rosettes
        const drawCornerFleuron = (cx, cy, angle) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((angle * Math.PI) / 180);

            // Bracket Lines
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 32);
            ctx.lineTo(0, 0);
            ctx.lineTo(32, 0);
            ctx.stroke();

            // Center rosette
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(8, 8, 4, 0, Math.PI * 2);
            ctx.fill();

            // Diamond accent
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(12, 8);
            ctx.lineTo(8, 16);
            ctx.lineTo(4, 8);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        };

        drawCornerFleuron(56, 56, 0);
        drawCornerFleuron(w - 56, 56, 90);
        drawCornerFleuron(w - 56, h - 56, 180);
        drawCornerFleuron(56, h - 56, 270);

        // 5. Institutional Crest & University Header
        ctx.textAlign = 'center';
        
        // Stars & Crown Crest
        ctx.fillStyle = '#fbbf24';
        ctx.font = '22px Outfit, sans-serif';
        ctx.fillText('✦  ⭐  👑  ⭐  ✦', w / 2, 82);

        // University Name
        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 15px Inter, sans-serif';
        ctx.letterSpacing = '5px';
        ctx.fillText('CHANDRAKASEM RAJABHAT UNIVERSITY', w / 2, 112);

        // Faculty Name
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12.5px Inter, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('FACULTY OF MULTIMEDIA AND E-SPORTS • ARCADE ACADEMIC BOARD', w / 2, 134);

        // 6. Main Certificate Category Title
        const titleGrad = ctx.createLinearGradient(w / 2 - 250, 0, w / 2 + 250, 0);
        titleGrad.addColorStop(0, '#fde68a');
        titleGrad.addColorStop(0.5, '#fbbf24');
        titleGrad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = titleGrad;
        ctx.font = '900 34px Outfit, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
        ctx.shadowBlur = 12;
        ctx.fillText('CERTIFICATE OF MASTERY & PROFICIENCY', w / 2, 182);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 13.5px Inter, sans-serif';
        ctx.letterSpacing = '6px';
        ctx.fillText('IN ENGLISH LANGUAGE & ADVANCED TRIVIA', w / 2, 208);

        // Ornate Center Divider (─── ◆ ───)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 240, 226);
        ctx.lineTo(w / 2 - 24, 226);
        ctx.moveTo(w / 2 + 24, 226);
        ctx.lineTo(w / 2 + 240, 226);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(w / 2, 220);
        ctx.lineTo(w / 2 + 8, 226);
        ctx.lineTo(w / 2, 232);
        ctx.lineTo(w / 2 - 8, 226);
        ctx.closePath();
        ctx.fill();

        // 7. Citation Intro
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 500 18px Inter, sans-serif';
        ctx.letterSpacing = '0px';
        ctx.fillText('This official credential is proudly awarded to', w / 2, 268);

        // 8. Recipient Name with Glow & Metallic Gradient
        const nameGrad = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0);
        nameGrad.addColorStop(0, '#67e8f9');
        nameGrad.addColorStop(0.5, '#ffffff');
        nameGrad.addColorStop(1, '#67e8f9');

        ctx.fillStyle = nameGrad;
        ctx.font = '900 44px Outfit, sans-serif';
        ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
        ctx.shadowBlur = 18;
        ctx.fillText(playerName, w / 2, 330);
        ctx.shadowBlur = 0;

        // Name Underline with Golden Wing Ends
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 180, 348);
        ctx.lineTo(w / 2 + 180, 348);
        ctx.stroke();

        // 9. Honor Citation Statement
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 16px Inter, sans-serif';
        ctx.fillText('for demonstrating outstanding grammatical precision, expansive vocabulary comprehension,', w / 2, 388);
        ctx.fillText('and conquering multiple interactive quests with exemplary speed, focus, and deductive reasoning.', w / 2, 412);

        // 10. 3 Luxury Metric Badges (EXP, Rank, Mastery)
        let totalCompleted = 0;
        ['basic', 'intermediate', 'advanced'].forEach(lvl => {
            totalCompleted += (this.progress.completed[lvl] || []).length;
        });
        const totalScore = this.progress.totalScore || 0;

        let rankTitle = 'Novice Explorer 🌱';
        if (totalScore >= 3000) rankTitle = 'Grand Archmage 🌟';
        else if (totalScore >= 1800) rankTitle = 'Master Lexicon ⚔️';
        else if (totalScore >= 600) rankTitle = 'Grammar Knight 🛡️';

        const badgeY = 448;
        const badgeW = 260;
        const badgeH = 68;
        const badgeGap = 24;
        const startX = w / 2 - (badgeW * 1.5 + badgeGap);

        const stats = [
            { icon: '🏆', label: 'TOTAL EXP SCORE', val: `${totalScore} PTS`, color: '#fbbf24' },
            { icon: '⭐', label: 'RANK ACHIEVEMENT', val: rankTitle, color: '#38bdf8' },
            { icon: '🎯', label: 'QUESTS MASTERED', val: `${totalCompleted} / 33 STAGES`, color: '#34d399' }
        ];

        stats.forEach((st, i) => {
            const bx = startX + i * (badgeW + badgeGap);
            
            // Badge Glass Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1.2;
            
            ctx.beginPath();
            ctx.roundRect(bx, badgeY, badgeW, badgeH, 12);
            ctx.fill();
            ctx.stroke();

            // Badge Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '700 11px Inter, sans-serif';
            ctx.letterSpacing = '1.5px';
            ctx.fillText(st.label, bx + badgeW / 2, badgeY + 24);

            // Badge Value
            ctx.fillStyle = st.color;
            ctx.font = '800 18px Outfit, sans-serif';
            ctx.letterSpacing = '0px';
            ctx.fillText(st.val, bx + badgeW / 2, badgeY + 52);
        });

        // 11. Bottom Official Verification, Embossed Gold Seal & Signature
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const randomId = Math.floor(100000 + (totalScore * 7) % 900000);

        // Left Column: Verification & Date
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('VERIFICATION TOKEN', 75, 660);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 13px monospace';
        ctx.fillText(`EQ-CRU-2026-${randomId}`, 75, 680);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 12.5px Inter, sans-serif';
        ctx.fillText(`Date Issued: ${dateStr}`, 75, 706);
        ctx.fillText('Issuing Authority: CRU Language Guild', 75, 726);

        // Center Column: 3D Embossed Royal Gold Seal
        const sealX = w / 2;
        const sealY = 675;

        // Crimson Ribbon Tails
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(sealX - 22, sealY + 20);
        ctx.lineTo(sealX - 34, sealY + 70);
        ctx.lineTo(sealX - 18, sealY + 58);
        ctx.lineTo(sealX - 4, sealY + 70);
        ctx.lineTo(sealX - 10, sealY + 20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sealX + 10, sealY + 20);
        ctx.lineTo(sealX + 4, sealY + 70);
        ctx.lineTo(sealX + 18, sealY + 58);
        ctx.lineTo(sealX + 34, sealY + 70);
        ctx.lineTo(sealX + 22, sealY + 20);
        ctx.closePath();
        ctx.fill();

        // Outer Scalloped Gold Medal Rosette
        const rosettePoints = 32;
        const outerR = 48;
        const innerR = 42;
        ctx.fillStyle = borderGrad;
        ctx.beginPath();
        for (let p = 0; p < rosettePoints * 2; p++) {
            const r = p % 2 === 0 ? outerR : innerR;
            const a = (p * Math.PI) / rosettePoints;
            const px = sealX + Math.cos(a) * r;
            const py = sealY + Math.sin(a) * r;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner Gold Rings
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '22px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', sealX, sealY + 7);

        // Right Column: Academic Signature Line
        ctx.textAlign = 'right';
        ctx.fillStyle = '#64748b';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('AUTHORIZED SIGNATURE', w - 75, 642);

        // Stylized Calligraphic Signature Representation
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w - 220, 672);
        ctx.bezierCurveTo(w - 200, 650, w - 175, 685, w - 150, 660);
        ctx.bezierCurveTo(w - 130, 640, w - 110, 680, w - 80, 665);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w - 240, 688);
        ctx.lineTo(w - 75, 688);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 13px Inter, sans-serif';
        ctx.fillText('Punnawit Janthamrong', w - 75, 708);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 11.5px Inter, sans-serif';
        ctx.fillText('Chief Academic Assessor & Guildmaster', w - 75, 726);
    }

    downloadCertificate() {
        soundManager.playClick();
        const canvas = document.getElementById('certificateCanvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `EnglishQuest_Master_Certificate_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        soundManager.playFirework();
        this.fireConfetti(70);
    }

    printCertificate() {
        soundManager.playClick();
        window.print();
    }

    // ==========================================
    // 9. 👥 2-PLAYER LOCAL DUEL MODE (SPLIT-SCREEN)
    // ==========================================
    startDuelMode() {
        soundManager.playClick();
        this.cleanupTimers();
        this.duelScoreP1 = 0;
        this.duelScoreP2 = 0;
        this.duelP1Locked = false;
        this.duelP2Locked = false;

        const p1ScoreEl = document.getElementById('duelScoreP1');
        const p2ScoreEl = document.getElementById('duelScoreP2');
        if (p1ScoreEl) p1ScoreEl.textContent = '0';
        if (p2ScoreEl) p2ScoreEl.textContent = '0';

        this.switchScreen('duel');
        this.nextDuelRound();
    }

    nextDuelRound() {
        this.duelP1Locked = false;
        this.duelP2Locked = false;

        const zoneP1 = document.getElementById('duelZoneP1');
        const zoneP2 = document.getElementById('duelZoneP2');
        if (zoneP1) zoneP1.classList.remove('locked-out');
        if (zoneP2) zoneP2.classList.remove('locked-out');

        const notice = document.getElementById('duelBuzzerNotice');
        if (notice) notice.textContent = '';

        // Pick random question with 4 options
        this.duelCurrentQuestion = getRandomQuestionWithChoices();

        const typeTag = document.getElementById('duelQuestionType');
        const promptEl = document.getElementById('duelQuestionPrompt');
        const displayEl = document.getElementById('duelQuestionDisplay');

        if (typeTag) typeTag.textContent = (this.duelCurrentQuestion.type || 'DUEL').toUpperCase().replace(/_/g, ' ');
        if (promptEl) promptEl.textContent = this.duelCurrentQuestion.prompt;
        if (displayEl) displayEl.textContent = this.duelCurrentQuestion.display || '⚡ BE QUICK!';

        this.renderDuelOptions();
    }

    renderDuelOptions() {
        const optsP1 = document.getElementById('duelOptionsP1');
        const optsP2 = document.getElementById('duelOptionsP2');
        if (!optsP1 || !optsP2 || !this.duelCurrentQuestion) return;

        const keyHintsP1 = ['[A]', '[S]', '[D]', '[F]'];
        const keyHintsP2 = ['[H]', '[J]', '[K]', '[L]'];

        optsP1.innerHTML = this.duelCurrentQuestion.choices.map((choice, idx) => `
            <button class="duel-opt-btn" onclick="game.handleDuelAnswer(1, ${idx})">
                <span>${choice}</span>
                <span class="duel-key-hint">${keyHintsP1[idx]}</span>
            </button>
        `).join('');

        optsP2.innerHTML = this.duelCurrentQuestion.choices.map((choice, idx) => `
            <button class="duel-opt-btn" onclick="game.handleDuelAnswer(2, ${idx})">
                <span>${choice}</span>
                <span class="duel-key-hint">${keyHintsP2[idx]}</span>
            </button>
        `).join('');
    }

    handleDuelAnswer(playerNum, choiceIndex) {
        if (!this.duelCurrentQuestion) return;
        if (playerNum === 1 && this.duelP1Locked) return;
        if (playerNum === 2 && this.duelP2Locked) return;

        const chosen = this.duelCurrentQuestion.choices[choiceIndex];
        const isCorrect = (chosen === this.duelCurrentQuestion.correctAnswer);
        const notice = document.getElementById('duelBuzzerNotice');

        if (isCorrect) {
            soundManager.playCorrect();
            soundManager.playFirework();
            if (playerNum === 1) {
                this.duelScoreP1 += 1;
                const p1ScoreEl = document.getElementById('duelScoreP1');
                if (p1ScoreEl) p1ScoreEl.textContent = this.duelScoreP1;
                if (notice) {
                    notice.style.color = '#38bdf8';
                    notice.textContent = `⚡ PLAYER 1 scored! (+1 Point)`;
                }
            } else {
                this.duelScoreP2 += 1;
                const p2ScoreEl = document.getElementById('duelScoreP2');
                if (p2ScoreEl) p2ScoreEl.textContent = this.duelScoreP2;
                if (notice) {
                    notice.style.color = '#f43f5e';
                    notice.textContent = `🔥 PLAYER 2 scored! (+1 Point)`;
                }
            }

            // Check match win
            if (this.duelScoreP1 >= 5 || this.duelScoreP2 >= 5) {
                this.endDuelMatch(this.duelScoreP1 >= 5 ? 1 : 2);
                return;
            }

            // Next round after 1 second
            this.duelRoundTimer = setTimeout(() => this.nextDuelRound(), 1000);
        } else {
            // Wrong answer: 2-second lock out!
            soundManager.playDuelBuzz();
            if (playerNum === 1) {
                this.duelP1Locked = true;
                const zone = document.getElementById('duelZoneP1');
                if (zone) zone.classList.add('locked-out');
                if (notice) {
                    notice.style.color = '#f43f5e';
                    notice.textContent = `⚠️ Player 1 Locked Out for 2s!`;
                }
                setTimeout(() => {
                    this.duelP1Locked = false;
                    if (zone) zone.classList.remove('locked-out');
                }, 2000);
            } else {
                this.duelP2Locked = true;
                const zone = document.getElementById('duelZoneP2');
                if (zone) zone.classList.add('locked-out');
                if (notice) {
                    notice.style.color = '#f43f5e';
                    notice.textContent = `⚠️ Player 2 Locked Out for 2s!`;
                }
                setTimeout(() => {
                    this.duelP2Locked = false;
                    if (zone) zone.classList.remove('locked-out');
                }, 2000);
            }
        }
    }

    endDuelMatch(winnerNum) {
        soundManager.playVictory();
        this.fireConfetti(120);

        const iconEl = document.getElementById('duelWinnerIcon');
        const titleEl = document.getElementById('duelWinnerTitle');
        const subEl = document.getElementById('duelWinnerSubtitle');
        const p1Sum = document.getElementById('duelSummaryP1');
        const p2Sum = document.getElementById('duelSummaryP2');

        if (p1Sum) p1Sum.textContent = this.duelScoreP1;
        if (p2Sum) p2Sum.textContent = this.duelScoreP2;

        if (winnerNum === 1) {
            if (iconEl) iconEl.textContent = '⚡';
            if (titleEl) { titleEl.style.color = '#38bdf8'; titleEl.textContent = 'PLAYER 1 WINS!'; }
            if (subEl) subEl.textContent = 'Lightning fast! Player 1 reached 5 points first.';
            this.progress.highScores.duelWinsP1 = (this.progress.highScores.duelWinsP1 || 0) + 1;
        } else {
            if (iconEl) iconEl.textContent = '🔥';
            if (titleEl) { titleEl.style.color = '#f43f5e'; titleEl.textContent = 'PLAYER 2 WINS!'; }
            if (subEl) subEl.textContent = 'Fierce reflexes! Player 2 reached 5 points first.';
            this.progress.highScores.duelWinsP2 = (this.progress.highScores.duelWinsP2 || 0) + 1;
        }

        this.addCoins(50); // Winner coin reward
        this.saveProgress();
        this.closeAllModals();
        if (this.modalDuelVictory) this.modalDuelVictory.classList.add('active');
    }

    // ==========================================
    // 10. ⏱️ TIME ATTACK MODE (60s SPEEDRUN)
    // ==========================================
    startTimeAttack() {
        soundManager.playClick();
        this.cleanupTimers();
        this.taTimeRemaining = 60.0;
        this.taScore = 0;
        this.taCombo = 0;
        this.taSolved = 0;

        this.switchScreen('timeattack');
        this.nextTaQuestion();

        // 100ms interval timer loop
        this.taTimer = setInterval(() => {
            this.taTimeRemaining = Math.max(0, this.taTimeRemaining - 0.1);
            const secEl = document.getElementById('timeAttackSeconds');
            const fillEl = document.getElementById('timeAttackFill');
            const pillEl = document.getElementById('timeAttackPill');

            if (secEl) secEl.textContent = `${this.taTimeRemaining.toFixed(1)}s`;
            if (fillEl) fillEl.style.width = `${Math.min(100, (this.taTimeRemaining / 60) * 100)}%`;

            if (this.taTimeRemaining <= 10) {
                if (pillEl) pillEl.classList.add('urgent');
                if (Math.floor(this.taTimeRemaining * 10) % 10 === 0) soundManager.playTick();
            } else {
                if (pillEl) pillEl.classList.remove('urgent');
            }

            if (this.taTimeRemaining <= 0) {
                this.endTimeAttack();
            }
        }, 100);
    }

    nextTaQuestion() {
        this.taCurrentQuestion = getRandomQuestionWithChoices();
        const typeEl = document.getElementById('taTypeTag');
        const promptEl = document.getElementById('taPrompt');
        const displayEl = document.getElementById('taDisplaySlot');
        const grid = document.getElementById('taChoicesGrid');

        if (typeEl) typeEl.textContent = (this.taCurrentQuestion.type || 'SPEED CHALLENGE').toUpperCase().replace(/_/g, ' ');
        if (promptEl) promptEl.textContent = this.taCurrentQuestion.prompt;
        if (displayEl) displayEl.textContent = this.taCurrentQuestion.display || '_ _ _ _';

        if (grid) {
            grid.innerHTML = (this.taCurrentQuestion && this.taCurrentQuestion.choices) ? this.taCurrentQuestion.choices.map((choice, idx) => `
                <button class="ta-choice-btn" onclick="game.handleTaAnswer(${idx})">
                    ${choice}
                </button>
            `).join('') : '';
        }
    }

    handleTaAnswer(choiceIndex) {
        if (!this.taCurrentQuestion || this.taTimeRemaining <= 0) return;
        const chosen = this.taCurrentQuestion.choices[choiceIndex];
        const isCorrect = (chosen === this.taCurrentQuestion.correctAnswer);

        if (isCorrect) {
            this.taSolved += 1;
            this.taCombo += 1;
            this.taTimeRemaining = Math.min(90, this.taTimeRemaining + 3.0); // +3s bonus!
            const earned = 100 + (this.taCombo * 20);
            this.taScore += earned;

            soundManager.playCorrect();
            if (this.taCombo > 1) soundManager.playCombo(this.taCombo);

            // Show +3s bonus notice
            const notice = document.getElementById('taBonusNotice');
            if (notice) {
                notice.classList.add('show');
                setTimeout(() => notice.classList.remove('show'), 800);
            }

            const scoreDisp = document.getElementById('taScoreDisplay');
            const comboDisp = document.getElementById('taComboDisplay');
            if (scoreDisp) scoreDisp.textContent = `Score: ${this.taScore}`;
            if (comboDisp) comboDisp.textContent = `🔥 ${this.taCombo}x`;

            this.nextTaQuestion();
        } else {
            this.taCombo = 0;
            this.taTimeRemaining = Math.max(0, this.taTimeRemaining - 2.0); // -2s penalty
            soundManager.playWrong();
            const comboDisp = document.getElementById('taComboDisplay');
            if (comboDisp) comboDisp.textContent = `🔥 0x`;
            this.nextTaQuestion();
        }
    }

    endTimeAttack() {
        this.cleanupTimers();
        soundManager.playVictory();
        this.fireConfetti(80);

        const coinEarned = Math.floor(this.taScore / 10);
        this.addCoins(coinEarned);

        if (this.taScore > (this.progress.highScores.timeAttack || 0)) {
            this.progress.highScores.timeAttack = this.taScore;
        }
        this.saveProgress();

        const scoreEl = document.getElementById('taSummaryScore');
        const solvedEl = document.getElementById('taSummarySolved');
        const coinsEl = document.getElementById('taSummaryCoins');

        if (scoreEl) scoreEl.textContent = this.taScore;
        if (solvedEl) solvedEl.textContent = `${this.taSolved} Words`;
        if (coinsEl) coinsEl.textContent = `+${coinEarned} 🪙`;

        this.closeAllModals();
        if (this.modalTimeAttackSummary) this.modalTimeAttackSummary.classList.add('active');
    }

    // ==========================================
    // 11. ♾️ ENDLESS SURVIVAL MODE
    // ==========================================
    startEndless() {
        soundManager.playClick();
        this.cleanupTimers();
        this.endlessWave = 1;
        this.endlessScore = 0;
        this.endlessLives = 3;

        this.updateEndlessHearts();
        this.switchScreen('endless');
        this.nextEndlessWave();
    }

    updateEndlessHearts() {
        for (let i = 1; i <= 3; i++) {
            const h = document.getElementById(`endlessHeart${i}`);
            if (h) {
                if (i <= this.endlessLives) h.classList.remove('lost');
                else h.classList.add('lost');
            }
        }
    }

    nextEndlessWave() {
        // Difficulty tier scales with wave
        let tier = 'basic';
        if (this.endlessWave >= 10) tier = 'advanced';
        else if (this.endlessWave >= 5) tier = 'intermediate';

        this.endlessCurrentQuestion = getRandomQuestionWithChoices(tier);

        const waveLabel = document.getElementById('endlessWaveLabel');
        const scoreDisp = document.getElementById('endlessScoreDisplay');
        const typeEl = document.getElementById('endlessTypeTag');
        const promptEl = document.getElementById('endlessPrompt');
        const displayEl = document.getElementById('endlessDisplaySlot');
        const grid = document.getElementById('endlessChoicesGrid');

        if (waveLabel) waveLabel.textContent = `Wave ${this.endlessWave} ♾️`;
        if (scoreDisp) scoreDisp.textContent = `Score: ${this.endlessScore}`;
        if (typeEl) typeEl.textContent = `WAVE ${this.endlessWave} • ${tier.toUpperCase()}`;
        if (promptEl) promptEl.textContent = this.endlessCurrentQuestion.prompt;
        if (displayEl) displayEl.textContent = this.endlessCurrentQuestion.display || '_ _ _ _';

        if (grid) {
            grid.innerHTML = this.endlessCurrentQuestion.choices.map((choice, idx) => `
                <button class="ta-choice-btn" onclick="game.handleEndlessAnswer(${idx})">
                    ${choice}
                </button>
            `).join('');
        }
    }

    handleEndlessAnswer(choiceIndex) {
        if (!this.endlessCurrentQuestion) return;
        const chosen = this.endlessCurrentQuestion.choices[choiceIndex];
        const isCorrect = (chosen === this.endlessCurrentQuestion.correctAnswer);

        if (isCorrect) {
            this.endlessWave += 1;
            this.endlessScore += 150;
            this.addCoins(15);
            soundManager.playCorrect();

            // Every 5 waves: restore 1 heart + gift random powerup!
            if (this.endlessWave % 5 === 0) {
                this.endlessLives = Math.min(3, this.endlessLives + 1);
                this.updateEndlessHearts();
                this.inventory.reveal += 1;
                this.updatePowerupBadges();
                soundManager.playPowerup();
                this.fireConfetti(40);
            }

            this.nextEndlessWave();
        } else {
            this.endlessLives -= 1;
            this.updateEndlessHearts();
            soundManager.playWrong();

            if (this.endlessLives <= 0) {
                this.endEndless();
            } else {
                this.nextEndlessWave();
            }
        }
    }

    endEndless() {
        if (this.endlessWave > (this.progress.highScores.endless || 0)) {
            this.progress.highScores.endless = this.endlessWave;
        }
        this.saveProgress();
        alert(`♾️ ENDLESS SURVIVAL COMPLETE!\n\nYou survived up to Wave ${this.endlessWave} with a total score of ${this.endlessScore} pts!`);
        this.goToHome();
    }

    // ==========================================
    // 12. 🐉 BOSS BATTLE MODE (LEXICON DRAGON)
    // ==========================================
    startBossBattle() {
        soundManager.playClick();
        this.cleanupTimers();
        this.bossMaxHp = 1000;
        this.bossHp = 1000;
        this.bossLives = 3;

        this.updateBossHearts();
        this.switchScreen('boss');
        this.nextBossTurn();
    }

    updateBossHearts() {
        for (let i = 1; i <= 3; i++) {
            const h = document.getElementById(`bossHeart${i}`);
            if (h) {
                if (i <= this.bossLives) h.classList.remove('lost');
                else h.classList.add('lost');
            }
        }
    }

    updateBossHpBar() {
        const hpText = document.getElementById('bossHpText');
        const hpFill = document.getElementById('bossHpFill');
        if (hpText) hpText.textContent = `${Math.max(0, this.bossHp)} / ${this.bossMaxHp}`;
        if (hpFill) hpFill.style.width = `${Math.max(0, (this.bossHp / this.bossMaxHp) * 100)}%`;
    }

    nextBossTurn() {
        if (this.bossTurnTimer) clearInterval(this.bossTurnTimer);
        this.bossTurnSeconds = 15;

        this.bossCurrentQuestion = getRandomQuestionWithChoices('advanced');

        const secEl = document.getElementById('bossTurnSeconds');
        if (secEl) secEl.textContent = `${this.bossTurnSeconds}s`;

        const tagEl = document.getElementById('bossQuestionTag');
        const promptEl = document.getElementById('bossPrompt');
        const displayEl = document.getElementById('bossDisplaySlot');
        const grid = document.getElementById('bossChoicesGrid');

        if (tagEl) tagEl.textContent = '⚔️ DRAGON TRIAL';
        if (promptEl) promptEl.textContent = this.bossCurrentQuestion.prompt;
        if (displayEl) displayEl.textContent = this.bossCurrentQuestion.display || '⚔️ CAST SPELL';

        if (grid) {
            grid.innerHTML = this.bossCurrentQuestion.choices.map((choice, idx) => `
                <button class="boss-attack-btn" onclick="game.handleBossAttack(${idx})">
                    ⚡ CAST: ${choice}
                </button>
            `).join('');
        }

        this.updateBossHpBar();

        // 1-second turn timer
        this.bossTurnTimer = setInterval(() => {
            this.bossTurnSeconds -= 1;
            const sec = document.getElementById('bossTurnSeconds');
            if (sec) sec.textContent = `${this.bossTurnSeconds}s`;

            if (this.bossTurnSeconds <= 0) {
                clearInterval(this.bossTurnTimer);
                this.bossAttackPlayer('⌛ Time ran out! The Dragon unleashed a fiery breath!');
            }
        }, 1000);
    }

    handleBossAttack(choiceIndex) {
        if (!this.bossCurrentQuestion || this.bossHp <= 0) return;
        if (this.bossTurnTimer) clearInterval(this.bossTurnTimer);

        const chosen = this.bossCurrentQuestion.choices[choiceIndex];
        const isCorrect = (chosen === this.bossCurrentQuestion.correctAnswer);

        if (isCorrect) {
            const damage = 250;
            this.bossHp -= damage;
            this.updateBossHpBar();
            soundManager.playBossDamage();
            soundManager.playFirework();
            this.fireConfetti(40);

            // Boss Visual Shake
            const visual = document.getElementById('bossVisual');
            if (visual) {
                visual.style.transform = 'scale(0.9) rotate(-6deg)';
                setTimeout(() => visual.style.transform = 'scale(1) rotate(0deg)', 400);
            }

            if (this.bossHp <= 0) {
                this.endBossBattle(true);
            } else {
                setTimeout(() => this.nextBossTurn(), 1200);
            }
        } else {
            this.bossAttackPlayer('❌ Spell fizzled! The Dragon retaliated with a tail swipe!');
        }
    }

    bossAttackPlayer(msg) {
        soundManager.playBossRoar();
        this.bossLives -= 1;
        this.updateBossHearts();

        alert(msg);

        if (this.bossLives <= 0) {
            this.endBossBattle(false);
        } else {
            setTimeout(() => this.nextBossTurn(), 800);
        }
    }

    endBossBattle(isWin) {
        this.cleanupTimers();
        if (isWin) {
            soundManager.playVictory();
            this.launchFireworksBurst(10);
            this.fireConfetti(150);
            this.addCoins(300);
            this.progress.highScores.bossDefeated = (this.progress.highScores.bossDefeated || 0) + 1;
            this.progress.totalScore += 1000;
            this.saveProgress();
            this.closeAllModals();
            if (this.modalBossVictory) this.modalBossVictory.classList.add('active');
        } else {
            soundManager.playGameOver();
            this.closeAllModals();
            if (this.modalGameOver) {
                const title = this.modalGameOver.querySelector('.game-over-title');
                if (title) title.innerText = '🐉 Defeated by Dragon!';
                this.modalGameOver.classList.add('active');
            }
        }
    }
}

// Instantiate global game engine
const game = new EnglishQuizGame();
if (typeof window !== 'undefined') {
    window.game = game;
    window.EnglishQuizGame = EnglishQuizGame;
}




