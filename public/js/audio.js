/**
 * ULTRA-SMOOTH VELVET LO-FI AUDIO ENGINE (RELAXING & MELLOW)
 * - Warm Electric Piano (Rhodes / Neo-Soul Chords) using pure Sine & Mellow Triangles
 * - Butter-smooth Lowpass filtering (Zero harsh high-frequencies / Non-fatiguing)
 * - Dreamy chord progressions (Fmaj9 -> Em7 -> Dm9 -> Cmaj9)
 * - Intelligent Audio Ducking for English TTS with Fail-Safe Auto-Recovery
 */

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isBgmPlaying = false;
        this.isDucked = false;
        this.bgmGain = null;
        this.sfxGain = null;
        this.masterCompressor = null;
        this.bgmTimer = null;
        this.watchdogTimer = null;
        this.duckTimeout = null;
        this.bgmVolume = 0.70;
        this.synth = window.speechSynthesis || null;
        this.currentChordIndex = 0;

        try {
            const savedVol = localStorage.getItem('EQA_VOLUME');
            if (savedVol !== null) {
                this.bgmVolume = parseFloat(savedVol);
            }
        } catch (e) {}
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();

                // Gentle warm compressor for soft, balanced output
                this.masterCompressor = this.ctx.createDynamicsCompressor();
                this.masterCompressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
                this.masterCompressor.knee.setValueAtTime(8, this.ctx.currentTime);
                this.masterCompressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
                this.masterCompressor.attack.setValueAtTime(0.02, this.ctx.currentTime);
                this.masterCompressor.release.setValueAtTime(0.4, this.ctx.currentTime);
                this.masterCompressor.connect(this.ctx.destination);
                
                // Master SFX Gain
                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
                this.sfxGain.connect(this.masterCompressor);

                // Master BGM Gain
                this.bgmGain = this.ctx.createGain();
                this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.bgmVolume, this.ctx.currentTime);
                this.bgmGain.connect(this.masterCompressor);

                this.startWatchdog();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setBGMVolume(val) {
        this.bgmVolume = Math.max(0, Math.min(1, val));
        this.isMuted = (this.bgmVolume === 0);

        try {
            localStorage.setItem('EQA_VOLUME', this.bgmVolume.toString());
        } catch (e) {}

        if (this.ctx && this.bgmGain) {
            const now = this.ctx.currentTime;
            this.bgmGain.gain.cancelScheduledValues(now);
            const target = this.isMuted ? 0 : (this.isDucked ? this.bgmVolume * 0.1 : this.bgmVolume);
            this.bgmGain.gain.linearRampToValueAtTime(target, now + 0.08);
        }
    }

    // ==========================================
    // 🎹 ULTRA-SMOOTH LO-FI CHILL RHODES BGM
    // ==========================================
    startBGM() {
        this.init();
        if (this.isBgmPlaying) return;
        this.isBgmPlaying = true;
        this.playNextBGMChord();
    }

    startWatchdog() {
        if (this.watchdogTimer) clearInterval(this.watchdogTimer);
        this.watchdogTimer = setInterval(() => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.isBgmPlaying && !this.bgmTimer) {
                this.playNextBGMChord();
            }
        }, 3500);
    }

    playNextBGMChord() {
        if (!this.isBgmPlaying || !this.ctx) return;

        // Dreamy, Warm & Cozy Chord Progression:
        // 1. Fmaj9  [F3, A3, C4, E4, G4]
        // 2. Em9    [E3, G3, B3, D4, F#4]
        // 3. Dm9    [D3, F3, A3, C4, E4]
        // 4. Cmaj9  [C3, E3, G3, B3, D4]
        const chords = [
            [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
            [164.81, 196.00, 246.94, 293.66, 369.99], // Em9
            [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
            [130.81, 164.81, 196.00, 246.94, 293.66]  // Cmaj9
        ];

        const bassNotes = [87.31, 82.41, 73.42, 65.41]; // F2, E2, D2, C2
        const chord = chords[this.currentChordIndex];
        const bass = bassNotes[this.currentChordIndex];
        const duration = 4.2; // Smooth 4.2 seconds per chord
        const now = this.ctx.currentTime;

        // 1. Velvet Electric Piano (Warm pure Sine + Detuned soft Triangle)
        chord.forEach((freq, idx) => {
            // Main warm tone
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine'; // Pure, mellow, zero harsh harmonics
            osc.frequency.setValueAtTime(freq, now);

            // Gentle lowpass filter for velvety warm tone (450Hz cutoff)
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(380 + idx * 40, now);
            filter.Q.setValueAtTime(0.7, now);

            // Soft blooming attack and long gentle release
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.085, now + 0.8);
            gain.gain.linearRampToValueAtTime(0.065, now + duration - 0.6);
            gain.gain.linearRampToValueAtTime(0, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(now);
            osc.stop(now + duration + 0.2);

            // Subtle chorus layer for lush width
            const chorusOsc = this.ctx.createOscillator();
            const chorusGain = this.ctx.createGain();
            chorusOsc.type = 'triangle';
            chorusOsc.frequency.setValueAtTime(freq * 1.002, now); // +2 cents detune

            chorusGain.gain.setValueAtTime(0, now);
            chorusGain.gain.linearRampToValueAtTime(0.025, now + 0.9);
            chorusGain.gain.linearRampToValueAtTime(0, now + duration);

            chorusOsc.connect(filter);
            filter.connect(chorusGain);
            chorusGain.connect(this.bgmGain);

            chorusOsc.start(now);
            chorusOsc.stop(now + duration + 0.2);
        });

        // 2. Warm Round Sub-Bass (Deep, cozy, non-intrusive)
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'sine'; // Deep acoustic-like sine bass
        bassOsc.frequency.setValueAtTime(bass, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(180, now);

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.20, now + 0.5);
        bassGain.gain.linearRampToValueAtTime(0.14, now + duration - 0.5);
        bassGain.gain.linearRampToValueAtTime(0, now + duration);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + duration + 0.2);

        // 3. Delicate Lullaby Bell Note (Occasional soothing sparkle, very soft)
        const bellTime = now + 1.2;
        const bellFreq = chord[chord.length - 1] * 1.5;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        const bellFilter = this.ctx.createBiquadFilter();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bellFreq, bellTime);

        bellFilter.type = 'lowpass';
        bellFilter.frequency.setValueAtTime(500, bellTime);

        bellGain.gain.setValueAtTime(0, bellTime);
        bellGain.gain.linearRampToValueAtTime(0.03, bellTime + 0.1);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 1.8);

        bellOsc.connect(bellFilter);
        bellFilter.connect(bellGain);
        bellGain.connect(this.bgmGain);

        bellOsc.start(bellTime);
        bellOsc.stop(bellTime + 1.9);

        this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

        // Schedule next chord seamlessly
        this.bgmTimer = setTimeout(() => {
            this.bgmTimer = null;
            if (this.isBgmPlaying) {
                this.playNextBGMChord();
            }
        }, (duration - 0.25) * 1000);
    }

    pauseBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // Audio Ducking: Smoothly low while speaking
    duckBGM() {
        this.isDucked = true;
        if (!this.ctx || !this.bgmGain) return;
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.bgmVolume * 0.08, now + 0.25);
    }

    // Smoothly restore volume
    restoreBGM() {
        this.isDucked = false;
        if (this.duckTimeout) {
            clearTimeout(this.duckTimeout);
            this.duckTimeout = null;
        }
        if (!this.ctx || !this.bgmGain || this.isMuted) return;
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.5);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ctx && this.bgmGain) {
            const now = this.ctx.currentTime;
            this.bgmGain.gain.cancelScheduledValues(now);
            this.bgmGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.bgmVolume, now + 0.1);
        }
        return this.isMuted;
    }

    // ==========================================
    // SFX EFFECTS (Smooth & Crisp)
    // ==========================================
    playClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    playCorrect() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + idx * 0.06;
            const duration = 0.3;

            osc.type = 'sine'; // Mellow warm chime
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    playFirework() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const whistle = this.ctx.createOscillator();
        const whistleGain = this.ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(350, now);
        whistle.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

        whistleGain.gain.setValueAtTime(0.15, now);
        whistleGain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        whistle.connect(whistleGain);
        whistleGain.connect(this.sfxGain);
        whistle.start(now);
        whistle.stop(now + 0.25);

        const expTime = now + 0.22;
        const burst = this.ctx.createOscillator();
        const burstGain = this.ctx.createGain();
        burst.type = 'triangle';
        burst.frequency.setValueAtTime(160, expTime);
        burst.frequency.exponentialRampToValueAtTime(40, expTime + 0.4);

        burstGain.gain.setValueAtTime(0.4, expTime);
        burstGain.gain.exponentialRampToValueAtTime(0.01, expTime + 0.4);

        burst.connect(burstGain);
        burstGain.connect(this.sfxGain);
        burst.start(expTime);
        burst.stop(expTime + 0.4);
    }

    playPowerup() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.04;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    playWrong() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.22);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }

    playCombo(streak) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const baseFreq = 440 + Math.min(streak * 70, 850);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playHint() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [659.25, 880, 1174.66];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + idx * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    playVictory() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const melody = [
            { f: 523.25, d: 0.16 },
            { f: 659.25, d: 0.16 },
            { f: 783.99, d: 0.16 },
            { f: 1046.50, d: 0.55 }
        ];

        let timeOffset = 0;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + timeOffset;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(item.f, startTime);

            gain.gain.setValueAtTime(0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.d);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + item.d);

            timeOffset += item.d * 0.85;
        });
    }

    // ==========================================
    // TEXT-TO-SPEECH (Smart Ducking)
    // ==========================================
    speakEnglish(text, onStart, onEnd) {
        if (!this.synth || !text) return;
        this.synth.cancel();

        this.duckBGM();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.88;
        utterance.pitch = 1.0;

        const voices = this.synth.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
        if (enVoice) {
            utterance.voice = enVoice;
        }

        let isCompleted = false;
        const finishSpeech = () => {
            if (isCompleted) return;
            isCompleted = true;
            this.restoreBGM();
            if (typeof onEnd === 'function') onEnd();
        };

        utterance.onstart = () => {
            if (typeof onStart === 'function') onStart();
        };

        utterance.onend = finishSpeech;
        utterance.onerror = finishSpeech;

        const words = text.split(/\s+/).length;
        const maxDurationMs = Math.max(2500, (words * 450) + 1500);
        if (this.duckTimeout) clearTimeout(this.duckTimeout);
        this.duckTimeout = setTimeout(finishSpeech, maxDurationMs);

        this.synth.speak(utterance);
    }
}

const soundManager = new SoundEffects();
