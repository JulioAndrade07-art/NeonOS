// --- THEME & WALLPAPER SYSTEM LOGIC ---
const ThemeManager = {
    init: function () {
        this.loadTheme();

        // Listen to system changes (Item 9)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const isDark = e.matches;
            if (!localStorage.getItem('neon_theme_overridden')) {
                const theme = isDark ? 'default' : 'neon-light';
                document.documentElement.setAttribute('data-theme', theme);
            }
        });
    },

    loadTheme: function () {
        // Detecção de preferência de sistema ou localstorage
        const savedTheme = localStorage.getItem('neon_theme');
        if (savedTheme === 'neon-light' || (!savedTheme && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'neon-light');
        } else if (savedTheme === 'synthwave') {
            document.documentElement.setAttribute('data-theme', 'synthwave');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    },

    setTheme: function (themeName) {
        localStorage.setItem('neon_theme_overridden', 'true');
        localStorage.setItem('neon_theme', themeName);
        if (themeName === 'neon-light') {
            document.documentElement.setAttribute('data-theme', 'neon-light');
        } else if (themeName === 'synthwave') {
            document.documentElement.setAttribute('data-theme', 'synthwave');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    },

    toggleTheme: function () {
        const current = document.documentElement.getAttribute('data-theme');
        if (current === 'neon-light') {
            this.setTheme('default');
        } else {
            this.setTheme('neon-light');
        }
    }
};

window.sysToggleTheme = () => ThemeManager.toggleTheme();
ThemeManager.init();
