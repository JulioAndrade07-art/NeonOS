// --- TERMINAL APP LOGIC (Item 6) ---
const TerminalApp = {
    history: [],
    historyIndex: 0,
    container: null,
    input: null,
    content: null,
    fs: {
        '/': ['home', 'bin', 'etc'],
        '/home': ['goiaba', 'guest'],
        '/home/goiaba': ['desktop', 'documents', 'secret.txt'],
    },
    currentPath: '/home/goiaba',

    commands: {
        'help': () => 'Comandos: help, clear, time, date, echo [texto], whoami, ls, pwd, cd [dir]',
        'clear': () => { TerminalApp.content.innerHTML = ''; return null; },
        'time': () => new Date().toLocaleTimeString(),
        'date': () => new Date().toLocaleDateString(),
        'echo': (args) => args.join(' '),
        'whoami': () => 'goiaba (SuperAdmin NeonOS)',
        'pwd': () => TerminalApp.currentPath,
        'ls': () => {
            const items = TerminalApp.fs[TerminalApp.currentPath];
            return items ? items.join('  ') : '';
        },
        'cd': (args) => {
            if (args.length === 0) { TerminalApp.currentPath = '/home/goiaba'; return ''; }
            const dir = args[0];
            if (dir === '..') {
                // simplify parent logic
                if (TerminalApp.currentPath === '/') return '';
                const parts = TerminalApp.currentPath.split('/');
                parts.pop();
                TerminalApp.currentPath = parts.join('/') || '/';
                return '';
            }
            const newPath = TerminalApp.currentPath === '/' ? `/${dir}` : `${TerminalApp.currentPath}/${dir}`;
            if (TerminalApp.fs[newPath] || TerminalApp.fs[TerminalApp.currentPath]?.includes(dir)) {
                TerminalApp.currentPath = newPath;
                if (!TerminalApp.fs[newPath]) TerminalApp.fs[newPath] = []; // mock creation
                return '';
            }
            return `cd: no such file or directory: ${dir}`;
        }
    },

    init: function () {
        this.container = document.getElementById('term-app-container');
        if (!this.container) return; // Se a view não estiver em index.html yet

        this.content = document.getElementById('term-content');
        this.input = document.getElementById('term-input');

        this.input.addEventListener('keydown', (e) => this.handleKey(e));

        // Focus input when clicking terminal area
        this.container.addEventListener('click', () => {
            this.input.focus();
        });

        this.printLine('NeonOS Terminal [Versão 2.1]');
        this.printLine('Digite "help" para ver os comandos.');
    },

    handleKey: function (e) {
        if (e.key === 'Enter') {
            const cmdText = this.input.value.trim();
            this.input.value = '';

            // Print command
            this.printLine(`<span style="color:var(--neon-green)">${this.currentPath} $</span> ${cmdText}`);

            if (cmdText) {
                this.history.push(cmdText);
                this.historyIndex = this.history.length;
                this.execute(cmdText);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    },

    execute: function (cmdStr) {
        const parts = cmdStr.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[cmd]) {
            const output = this.commands[cmd](args);
            if (output !== null) this.printLine(output);
        } else {
            this.printLine(`Comando no encontrado: ${cmd}`);
        }
    },

    printLine: function (text) {
        const div = document.createElement('div');
        div.innerHTML = text; // Permite colors
        this.content.appendChild(div);
        this.container.scrollTop = this.container.scrollHeight;
    }
};

window.TerminalApp = TerminalApp;
setTimeout(() => TerminalApp.init(), 600);
