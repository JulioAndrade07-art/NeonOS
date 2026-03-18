// --- INTELLIGENT TEXT EDITOR LOGIC ---
const EditorApp = {
    area: null,
    wordCount: null,
    charCount: null,
    status: null,

    init: function () {
        this.area = document.getElementById('editor-area');
        this.wordCount = document.getElementById('word-count');
        this.charCount = document.getElementById('char-count');
        this.status = document.getElementById('editor-status');

        if (!this.area) return;

        // Load saved content using StorageManager
        const saved = window.StorageManager.load('neon_editor_content', '');
        if (saved) {
            this.area.innerHTML = saved;
            this.updateStats();
        }

        this.area.addEventListener('input', () => {
            window.StorageManager.save('neon_editor_content', this.area.innerHTML);
            this.status.textContent = 'Salvando...';
            setTimeout(() => { this.status.textContent = 'Salvo'; }, 1000);
            this.updateStats();
        });

        this.area.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') { e.preventDefault(); this.exec('bold'); }
                if (e.key === 'i') { e.preventDefault(); this.exec('italic'); }
            }
        });

        // Escape key to exit focus mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const win = document.getElementById('win-text-editor');
                if (win && win.classList.contains('focus-mode')) {
                    this.toggleFocus();
                }
            }
        });
    },

    exec: function (command, value = null) {
        document.execCommand(command, false, value);
        this.area.focus();
        this.updateStats();
    },

    toggleFocus: function () {
        const win = document.getElementById('win-text-editor');
        win.classList.toggle('focus-mode');

        if (!document.querySelector('.focus-hint')) {
            const hint = document.createElement('div');
            hint.className = 'focus-hint';
            hint.textContent = 'Clique no ícone de olho ou pressione ESC para sair';
            document.body.appendChild(hint);
        }
    },

    updateStats: function () {
        if (!this.area) return;
        const text = this.area.innerText || '';
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;

        if (this.wordCount) this.wordCount.textContent = `${words} palavras`;
        if (this.charCount) this.charCount.textContent = `${chars} caracteres`;
    }
};

window.editorExec = (cmd, val) => EditorApp.exec(cmd, val);
window.editorToggleFocus = () => EditorApp.toggleFocus();
window.editorUpdateStats = () => EditorApp.updateStats();

setTimeout(() => EditorApp.init(), 100);
