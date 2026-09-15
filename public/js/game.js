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

        this.initDOM();
        this.loadProgress();
        this.setupFireworksAndConfetti();
        this.bindEvents();
        this.setupAutoplayAudio();
        this.updatePowerupBadges();
        this.initSpotlight();
        this.updateSidebars();
    }

    initDOM() {
        // Screens
        this.screenLevelSelect = document.getElementById('screenLevelSelect');
        this.screenStageMap = document.getElementById('screenStageMap');
        this.screenGameplay = document.getElementById('screenGameplay');

        // Modals
        this.modalStageClear = document.getElementById('modalStageClear');
        this.modalLevelVictory = document.getElementById('modalLevelVictory');
        this.modalGameOver = document.getElementById('modalGameOver');

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
                this.progress = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load saved progress:', e);
        }
        this.updateHomeStats();
    }

    saveProgress() {
        try {
            localStorage.setItem('EQA_PROGRESS', JSON.stringify(this.progress));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
        this.updateHomeStats();
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all game progress, inventory and high scores?')) {
            this.progress = {
                totalScore: 0,
                maxCombo: 0,
                unlocked: { basic: 1, intermediate: 1, advanced: 1 },
                completed: { basic: [], intermediate: [], advanced: [] }
            };
            this.inventory = { reveal: 2, heal: 1, skip: 1 };
            this.saveProgress();
            this.updateHomeStats();
            this.updatePowerupBadges();
            soundManager.playClick();
        }
    }

    updateHomeStats() {
        if (!this.statTotalScore) return;
        this.statTotalScore.textContent = this.progress.totalScore;
        this.statMaxCombo.textContent = `${this.progress.maxCombo}x`;

        let totalCompleted = 0;
        ['basic', 'intermediate', 'advanced'].forEach(lvl => {
            totalCompleted += (this.progress.completed[lvl] || []).length;
        });
        this.statClearedStages.textContent = `${totalCompleted}/33`;

        this.updateSidebars();
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
    }

    switchScreen(screenName) {
        [this.screenLevelSelect, this.screenStageMap, this.screenGameplay].forEach(s => s.classList.remove('active'));
        if (screenName === 'home') this.screenLevelSelect.classList.add('active');
        if (screenName === 'map') this.screenStageMap.classList.add('active');
        if (screenName === 'game') this.screenGameplay.classList.add('active');
        this.closeAllModals();
    }

    closeAllModals() {
        [this.modalStageClear, this.modalLevelVictory, this.modalGameOver].forEach(m => m.classList.remove('active'));
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

        // Rewards for clearing stages: gain extra power-ups!
        if (stageData.stage === 5 || stageData.stage === 10) {
            this.inventory.reveal += 1;
            this.inventory.heal += 1;
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
        this.showFeedback(true, isSpecial ? '⭐ SPECIAL BONUS CLEARED!' : '🎉 CORRECT ANSWER!', `${stageData.explanation || ''}`);

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
}

// Instantiate global game engine
const game = new EnglishQuizGame();
