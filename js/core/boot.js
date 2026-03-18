// --- BOOT SCREEN & STARTUP ANIMATION (Items 12 & 5) ---
const BootSystem = {
    steps: [
        "Inicializando Kernel Quântico...",
        "Carregando módulos base: OK",
        "Montando sistema de arquivos virtual...",
        "Carregando configurações de usuário...",
        "Iniciando drivers de vídeo e WebGL...",
        "Sincronizando banco de dados local...",
        "[Aviso] Verificando integridade neural...",
        "Inicialização concluída. Bem-vindo(a) ao NeonOS."
    ],

    init: function () {
        const bootScreen = document.getElementById('boot-screen');
        const terminal = document.getElementById('boot-terminal');
        const progressBar = document.getElementById('boot-progress');

        if (!bootScreen || !window.StorageManager) return;

        // Se já bootou na sessão atual (SessionStorage envia p/ n encher o saco em f5)
        if (sessionStorage.getItem('neon_booted')) {
            bootScreen.style.display = 'none';
            if (window.openWindow) window.openWindow('win-welcome');
            return;
        }

        let stepIndex = 0;
        let progress = 0;

        const bootInterval = setInterval(() => {
            progress += Math.random() * 8 + 2; // Avança entre 2% e 10%
            if (progress > 100) progress = 100;

            progressBar.style.width = `${progress}%`;

            // Adiciona nova linha no terminal visual conforme progresso avança
            const expectedStep = Math.floor((progress / 100) * this.steps.length);
            if (expectedStep > stepIndex && stepIndex < this.steps.length) {
                const line = document.createElement('div');
                line.textContent = `> ${this.steps[stepIndex]}`;
                terminal.appendChild(line);
                stepIndex++;
            }

            if (progress === 100) {
                clearInterval(bootInterval);
                sessionStorage.setItem('neon_booted', 'true');

                // Fade out effects
                setTimeout(() => {
                    bootScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    bootScreen.style.opacity = '0';
                    bootScreen.style.transform = 'scale(1.1)';

                    setTimeout(() => {
                        bootScreen.style.display = 'none';
                        if (window.openWindow) window.openWindow('win-welcome');
                    }, 800);
                }, 500);
            }
        }, 150);
    }
};

window.addEventListener('load', () => {
    BootSystem.init();
});
