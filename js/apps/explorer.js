// --- EXPLORER APP LOGIC (Item 3 - File Manager) ---
const ExplorerApp = {
    container: null,
    files: [
        { name: 'relatório_v2.pdf', type: 'doc', icon: '📄' },
        { name: 'senhas_nao_abrir.txt', type: 'doc', icon: '📝' },
        { name: 'foto_praia.jpg', type: 'img', icon: '🖼️' },
        { name: 'screenshot.png', type: 'img', icon: '📸' },
        { name: 'synthwave_mix.mp3', type: 'music', icon: '🎵' },
        { name: 'sistema32', type: 'folder', icon: '📁' }
    ],

    init: function () {
        this.container = document.getElementById('explorer-files');
        if (!this.container) return;

        this.renderFiles(this.files);
    },

    renderFiles: function (filesList) {
        this.container.innerHTML = '';
        filesList.forEach(file => {
            const el = document.createElement('div');
            el.style.width = '80px';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.cursor = 'pointer';
            el.style.textAlign = 'center';
            el.style.padding = '5px';
            el.style.borderRadius = '8px';
            el.style.transition = 'background 0.2s';

            el.onmouseover = () => el.style.background = 'rgba(255,255,255,0.1)';
            el.onmouseout = () => el.style.background = 'transparent';
            el.onclick = () => this.openFile(file);

            el.innerHTML = `
                <div style="font-size: 30px; margin-bottom:5px;">${file.icon}</div>
                <div style="font-size: 11px; word-break: break-all; color: var(--text-main);">${file.name}</div>
            `;
            this.container.appendChild(el);
        });
    },

    openFile: function (file) {
        if (file.type === 'doc') {
            if (window.openWindow) window.openWindow('win-text-editor');
            const ta = document.getElementById('editor-textarea');
            if (ta) ta.value = `### Conteúdo de ${file.name} ###\n\nIsso é uma simulação do arquivo.`;
        } else if (file.type === 'img') {
            alert(`Abrindo imagem ${file.name} visualizador simulado...`);
        } else if (file.type === 'folder') {
            alert("Acesso Negado ou Pasta Vazia simulada.");
        } else {
            alert(`Abrindo arquivo: ${file.name}`);
        }
    }
};

window.ExplorerApp = ExplorerApp;
setTimeout(() => ExplorerApp.init(), 1000);
