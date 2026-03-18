// --- WALLPAPER APP LOGIC ---
const WallpaperApp = {
    state: {
        image: null,
        mode: 'cover',
        zoom: 100,
        posX: 50,
        posY: 50
    },

    el: {
        monitor: null,
        fileInput: null,
        modeSelect: null,
        zoomSlider: null,
        zoomVal: null
    },

    drag: { isDragging: false, startX: 0, startY: 0 },

    init: function () {
        this.el.monitor = document.getElementById('wp-preview-monitor');
        this.el.fileInput = document.getElementById('wp-file-input');
        this.el.modeSelect = document.getElementById('wp-mode-select');
        this.el.zoomSlider = document.getElementById('wp-zoom-slider');
        this.el.zoomVal = document.getElementById('wp-zoom-val');

        if (!this.el.monitor) return;

        this.el.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.el.modeSelect.addEventListener('change', (e) => {
            this.state.mode = e.target.value;
            this.updatePreview();
        });
        this.el.zoomSlider.addEventListener('input', (e) => {
            this.state.zoom = parseInt(e.target.value);
            this.el.zoomVal.textContent = `${this.state.zoom}%`;
            this.updatePreview();
        });

        this.el.monitor.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.doDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        this.loadSystemWallpaper();
    },

    handleFileUpload: function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                this.state.image = canvas.toDataURL('image/jpeg', 0.85);
                this.state.posX = 50;
                this.state.posY = 50;
                this.updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    startDrag: function (e) {
        if (!this.state.image) return;
        this.drag.isDragging = true;
        this.drag.startX = e.clientX;
        this.drag.startY = e.clientY;
    },

    doDrag: function (e) {
        if (!this.drag.isDragging) return;
        const rect = this.el.monitor.getBoundingClientRect();
        const deltaX = (e.clientX - this.drag.startX) / rect.width * 100;
        const deltaY = (e.clientY - this.drag.startY) / rect.height * 100;

        this.state.posX = Math.max(0, Math.min(100, this.state.posX - deltaX));
        this.state.posY = Math.max(0, Math.min(100, this.state.posY - deltaY));
        this.drag.startX = e.clientX;
        this.drag.startY = e.clientY;
        this.updatePreviewPosition();
    },

    stopDrag: function () { this.drag.isDragging = false; },

    updatePreview: function () {
        if (!this.state.image) return;
        this.el.monitor.style.backgroundImage = `url(${this.state.image})`;
        if (this.state.mode === 'cover' || this.state.mode === 'contain') {
            this.el.monitor.style.backgroundSize = `${this.state.zoom}%`;
            if (this.state.zoom === 100 && this.state.mode === 'cover') this.el.monitor.style.backgroundSize = 'cover';
            if (this.state.zoom === 100 && this.state.mode === 'contain') this.el.monitor.style.backgroundSize = 'contain';
        } else if (this.state.mode === '100% 100%') {
            this.el.monitor.style.backgroundSize = '100% 100%';
        } else if (this.state.mode === 'center') {
            this.el.monitor.style.backgroundSize = `${this.state.zoom}%`;
        }
        this.updatePreviewPosition();
    },

    updatePreviewPosition: function () {
        if (!this.state.image) return;
        if (this.state.mode === '100% 100%') {
            this.el.monitor.style.backgroundPosition = '0 0';
            return;
        }
        this.el.monitor.style.backgroundPosition = `${this.state.posX}% ${this.state.posY}%`;
    },

    loadSystemWallpaper: function () {
        const saved = window.StorageManager.load('neon_wallpaper');
        if (saved) {
            try {
                this.state = saved;
                if (this.el.modeSelect) this.el.modeSelect.value = saved.mode;
                if (this.el.zoomSlider) this.el.zoomSlider.value = saved.zoom;
                if (this.el.zoomVal) this.el.zoomVal.textContent = `${saved.zoom}%`;
                this.updatePreview();
                this.applyToSystem(saved);
            } catch (e) {
                console.error("Falha ao carregar wallpaper", e);
            }
        }
    },

    applyToSystem: function (data) {
        if (!data.image) return;
        const docStyle = document.documentElement.style;
        docStyle.setProperty('--sys-wallpaper', `url(${data.image})`);
        let bgSize = data.mode;
        if (data.zoom !== 100 && data.mode !== '100% 100%') bgSize = `${data.zoom}%`;
        docStyle.setProperty('--sys-wp-size', bgSize);
        docStyle.setProperty('--sys-wp-pos', `${data.posX}% ${data.posY}%`);
    }
};

window.sysWpReset = function () {
    WallpaperApp.state.posX = 50; WallpaperApp.state.posY = 50;
    WallpaperApp.state.zoom = 100; WallpaperApp.state.mode = 'cover';
    document.getElementById('wp-zoom-slider').value = 100;
    document.getElementById('wp-zoom-val').textContent = '100%';
    document.getElementById('wp-mode-select').value = 'cover';
    WallpaperApp.updatePreview();
};

window.sysWpApply = function () {
    if (!WallpaperApp.state.image) { alert("Faça upload de uma imagem."); return; }
    window.StorageManager.save('neon_wallpaper', WallpaperApp.state);
    WallpaperApp.applyToSystem(WallpaperApp.state);
    alert("Plano de Fundo aplicado!");
};

setTimeout(() => WallpaperApp.init(), 200);
