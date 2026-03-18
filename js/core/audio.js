// --- AUDIO & SOUND EFFECTS SYSTEM ---
const AudioSystem = {
    bgMusic: new Audio('https://cdn.pixabay.com/download/audio/2022/10/25/audio_2430030283.mp3?filename=synthwave-80s-127521.mp3'),
    sfxClick: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_7302f3a696.mp3?filename=button-click-electronic-101186.mp3'),
    sfxError: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_b2874130f4.mp3?filename=error-126627.mp3'),

    isMusicPlaying: false,
    sfxEnabled: true,

    init: function () {
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.2;
        this.sfxClick.volume = 0.3;
        this.sfxError.volume = 0.4;

        // Restore preferences
        const pref = window.StorageManager ? window.StorageManager.load('neon_audio_pref', { music: false, sfx: true }) : { music: false, sfx: true };
        this.sfxEnabled = pref.sfx;

        // Music can't auto-play without user interaction on modern browsers,
        // so we wait for the first click on desktop to start it if enabled.
        if (pref.music) {
            document.addEventListener('click', () => {
                if (!this.isMusicPlaying) {
                    this.toggleMusic(true);
                }
            }, { once: true });
        }

        // Add System Tray Toggle
        const tray = document.querySelector('.system-tray');
        if (tray) {
            const btn = document.createElement('div');
            btn.className = 'tray-item';
            btn.id = 'sys-audio-toggle';
            btn.style.cursor = 'pointer';
            btn.style.color = pref.music ? 'var(--neon-green)' : 'var(--text-muted)';
            btn.textContent = pref.music ? '🔈 ON' : '🔈 OFF';
            btn.onclick = () => this.toggleMusic();
            tray.prepend(btn);
        }

        // Attach SFX to all app-icons and buttons
        document.addEventListener('click', (e) => {
            if (this.sfxEnabled) {
                if (e.target.closest('.app-icon') || e.target.closest('button')) {
                    this.playClick();
                }
            }
        });
    },

    toggleMusic: function (forcePlay = false) {
        if (this.isMusicPlaying && !forcePlay) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
        } else {
            this.bgMusic.play().then(() => {
                this.isMusicPlaying = true;
            }).catch(e => console.log('Autoplay prevented'));
        }

        const btn = document.getElementById('sys-audio-toggle');
        if (btn) {
            btn.textContent = this.isMusicPlaying ? '🔈 ON' : '🔈 OFF';
            btn.style.color = this.isMusicPlaying ? 'var(--neon-cyan)' : 'var(--text-muted)';
        }

        if (window.StorageManager) {
            window.StorageManager.save('neon_audio_pref', { music: this.isMusicPlaying, sfx: this.sfxEnabled });
        }
    },

    playClick: function () {
        if (!this.sfxEnabled) return;
        this.sfxClick.currentTime = 0;
        this.sfxClick.play().catch(e => { });
    },

    playError: function () {
        if (!this.sfxEnabled) return;
        this.sfxError.currentTime = 0;
        this.sfxError.play().catch(e => { });
    }
};

window.AudioSystem = AudioSystem;
setTimeout(() => AudioSystem.init(), 1000);
