// --- WINDOW MANAGEMENT LOGIC ---

// Bring window to front
let maxZIndex = 100;
let currentActiveWindowId = null;

function focusWindow(windowElement) {
    maxZIndex++;
    windowElement.style.zIndex = maxZIndex;
    currentActiveWindowId = windowElement.id;
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    // Toggle logic: Se a janela tiver um Toggle Switch, force-o visualmente a ficar "ligado/checked".
    const toggleInput = win.querySelector('.neon-toggle-wrap input[type="checkbox"]');
    if (toggleInput) {
        toggleInput.checked = true;
    }

    if (!win.classList.contains('active')) {
        win.classList.add('active');
    }
    focusWindow(win);
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.classList.remove('active');
        if (currentActiveWindowId === id) {
            currentActiveWindowId = null;
        }

        // Sincronizar UI se fechado via atalho externo (não direto pelo toggle)
        const toggleInput = win.querySelector('.neon-toggle-wrap input[type="checkbox"]');
        if (toggleInput) {
            toggleInput.checked = false;
        }
    }
}

// Lógica local para Toggle via GUI
function sysToggleWindow(id, checkbox) {
    if (checkbox && !checkbox.checked) {
        // Se desmarcado (App off)
        closeWindow(id);
    } else if (checkbox && checkbox.checked) {
        // Se ativado (App On - menos comum clicar fechar p reabrir mas garante reatividade)
        openWindow(id);
    }
}

// --- DRAG AND DROP LOGIC (Vanilla JS) ---
let isDragging = false;
let currentWindow = null;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Attach events to all window headers
document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', dragStart);
});

// Global mouse events to handle dragging smoothly even if mouse leaves window
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    // Find the parent window
    currentWindow = e.target.closest('.window');
    if (!currentWindow) return;

    // Bring to front
    focusWindow(currentWindow);

    // Calculate offset
    // We need to account for the current transform translate values
    // But since we use top/left for movement once dragging starts, let's switch strategies.
    // Strategy: Get current visual position (getBoundingClientRect) relative to window

    const rect = currentWindow.getBoundingClientRect();

    // Where did we click relative to the window's top-left?
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;

    isDragging = true;
    currentWindow.classList.add('dragging');
}

function drag(e) {
    if (isDragging && currentWindow) {
        e.preventDefault();

        // Calculate new position
        const currentX = e.clientX - initialX;
        const currentY = e.clientY - initialY;

        // Important: When we start dragging, we override the centering transform
        // by setting fixed top/left and changing transform to 'none' or simple scale.

        // However, our CSS has transform: translate(-50%, -50%). 
        // It's cleaner to remove that transform logic once we start dragging manually
        // OR calculate with it.
        // Simplest way: Set transform to none (or scale 1) and use exact top/left coordinates.

        currentWindow.style.transform = "scale(1)";
        currentWindow.style.left = `${currentX}px`;
        currentWindow.style.top = `${currentY}px`;
        currentWindow.style.margin = "0"; // Remove potential margins if any
    }
}

function dragEnd(e) {
    if (!isDragging) return;

    initialX = null;
    initialY = null;
    isDragging = false;

    if (currentWindow) {
        currentWindow.classList.remove('dragging');
        currentWindow = null;
    }
}

// --- CUSTOM JS DEMO LOGIC ---
function runDemoAction() {
    const container = document.getElementById('custom-container');
    const time = new Date().toLocaleTimeString();

    // Create a simple futuristic alert
    const alertBox = document.createElement('div');
    alertBox.style.marginTop = "10px";
    alertBox.style.padding = "5px";
    alertBox.style.borderLeft = "3px solid var(--neon-blue)";
    alertBox.style.background = "rgba(0, 212, 255, 0.1)";
    alertBox.innerHTML = `<strong>Ação Executada:</strong> Código customizado rodou às ${time}`;

    container.appendChild(alertBox);

    // Auto scroll
    container.scrollTop = container.scrollHeight;
}

// --- CLOCK LOGIC ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock(); // Initial call

// --- CALCULATOR LOGIC ---
let calcCurrentInput = '0';
let calcShouldResetDisplay = false;

function calcUpdateDisplay() {
    const display = document.getElementById('calc-display');
    if (display) {
        display.value = calcCurrentInput;
        display.scrollLeft = display.scrollWidth;
    }
}

function calcAppendNumber(num) {
    if (calcCurrentInput === '0' || calcShouldResetDisplay) {
        calcCurrentInput = num;
        calcShouldResetDisplay = false;
    } else {
        calcCurrentInput += num;
    }
    calcUpdateDisplay();
}

function calcAppendOperator(operator) {
    if (calcShouldResetDisplay) calcShouldResetDisplay = false;
    const lastChar = calcCurrentInput.slice(-1);
    if (['+', '-', '*', '/', '%'].includes(lastChar)) {
        calcCurrentInput = calcCurrentInput.slice(0, -1) + operator;
    } else {
        calcCurrentInput += operator;
    }
    calcUpdateDisplay();
}

function calcClearDisplay() {
    calcCurrentInput = '0';
    calcUpdateDisplay();
}

function calcDeleteLast() {
    if (calcCurrentInput.length > 1) {
        calcCurrentInput = calcCurrentInput.slice(0, -1);
    } else {
        calcCurrentInput = '0';
    }
    calcUpdateDisplay();
}

function calcCalculate() {
    const expression = calcCurrentInput;

    try {
        // Using Function constructor as a slightly safer eval alias for simple math
        // But eval is generally discouraged. However for a simple local calculator it's ok-ish.
        const result = new Function('return ' + expression)();

        // Handle invalid numeric outcomes (Infinity/NaN), e.g. division by zero
        calcCurrentInput = Number.isFinite(result) ? String(result) : 'Erro';
    } catch (e) {
        calcCurrentInput = 'Erro';
    }
    calcShouldResetDisplay = true;
    calcUpdateDisplay();

    // Add to history
    calcAddToHistory(expression, calcCurrentInput);
}

function calcAddToHistory(expression, result) {
    const list = document.getElementById('calc-historyList');
    if (!list) return;

    // Create item
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
                <div class="hist-exp">${expression}</div>
                <div class="hist-res">${result}</div>
            `;
    // Prepend
    list.prepend(div);
}

function calcToggleHistory() {
    const panel = document.getElementById('calc-historyPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function calcClearHistory() {
    const list = document.getElementById('calc-historyList');
    if (list) list.innerHTML = '';
}

// Global Keydown for Calculator (only works if we assume it's the main focus or check visibility)
document.addEventListener('keydown', (event) => {
    const calcWin = document.getElementById('win-calc');
    if (calcWin && calcWin.classList.contains('active') && currentActiveWindowId === 'win-calc') {
        const key = event.key;
        if (/[0-9]/.test(key)) calcAppendNumber(key);
        if (['+', '-', '*', '/'].includes(key)) calcAppendOperator(key);
        if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calcCalculate();
        }
        if (key === 'Backspace') calcDeleteLast();
        if (key === 'Escape') calcClearDisplay();
        if (key === '.') calcAppendNumber('.');
    }
});


// --- SYSTEM MANAGEMENT LOGIC ---
// Simple Auth & Data simulation using LocalStorage

const sysDB = {
    getUsers: () => JSON.parse(localStorage.getItem('neon_users') || '[]'),
    saveUsers: (users) => localStorage.setItem('neon_users', JSON.stringify(users)),
    addUser: (user) => {
        const users = sysDB.getUsers();
        user.id = Date.now();
        users.push(user);
        sysDB.saveUsers(users);
    },
    deleteUser: (id) => {
        let users = sysDB.getUsers();
        users = users.filter(u => u.id != id);
        sysDB.saveUsers(users);
    }
};

// Seed initial admin user if empty
if (sysDB.getUsers().length === 0) {
    sysDB.addUser({
        name: 'Administrador',
        user: 'admin',
        pass: 'admin'
    });
}

let sysCurrentUser = null;

function sysShowLogin() {
    document.getElementById('mgmt-view-login').classList.remove('hidden');
    document.getElementById('mgmt-view-register').classList.add('hidden');
    document.getElementById('mgmt-view-dashboard').classList.add('hidden');
    document.getElementById('login-msg').textContent = '';
}

function sysShowRegister() {
    document.getElementById('mgmt-view-login').classList.add('hidden');
    document.getElementById('mgmt-view-register').classList.remove('hidden');
    document.getElementById('reg-msg').textContent = '';
}

function sysLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    const users = sysDB.getUsers();
    const valid = users.find(usr => usr.user === u && usr.pass === p);

    if (valid) {
        sysCurrentUser = valid;
        sysShowDashboard();
    } else {
        document.getElementById('login-msg').textContent = 'Credenciais inválidas!';
    }
}

function sysRegister() {
    const name = document.getElementById('reg-name').value;
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;

    if (!name || !user || !pass) {
        document.getElementById('reg-msg').textContent = 'Preencha todos os campos.';
        return;
    }

    // Check duplicate
    const users = sysDB.getUsers();
    if (users.find(u => u.user === user)) {
        document.getElementById('reg-msg').textContent = 'Usuário já existe.';
        return;
    }

    sysDB.addUser({
        name,
        user,
        pass
    });
    alert('Usuário cadastrado com sucesso!');
    sysShowLogin();
}

function sysLogout() {
    sysCurrentUser = null;
    sysShowLogin();
}

function sysShowDashboard() {
    document.getElementById('mgmt-view-login').classList.add('hidden');
    document.getElementById('mgmt-view-dashboard').classList.remove('hidden');
    document.getElementById('dash-user-display').textContent = `Logado como: ${sysCurrentUser.name}`;
    sysRenderUsers();
}

function sysSwitchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate
    const btn = document.querySelector(`.tab-btn[onclick*="'${tab}'"]`);
    if (btn) btn.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

function sysRenderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    const users = sysDB.getUsers();
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.user}</td>
            <td>
                <span class="action-link" onclick="sysDeleteUser(${u.id})">Excluir</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function sysDeleteUser(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        sysDB.deleteUser(id);
        sysRenderUsers();
    }
}

// Automation Script
function sysRunAutomation() {
    const btn = document.querySelector('.automation-card .mgmt-btn');
    const status = document.getElementById('auto-status');
    const progress = document.getElementById('auto-progress');
    const log = document.getElementById('auto-log');

    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Executando...';
    status.textContent = 'Em andamento';
    status.style.color = '#ff9900';
    log.innerHTML = '';
    progress.style.width = '0%';

    const steps = [
        "Inicializando script de manutenção...",
        "Verificando integridade do cache local...",
        "Otimizando índices do banco de dados...",
        "Removendo arquivos temporários...",
        "Comprimindo logs do sistema...",
        "Finalizando limpeza..."
    ];

    let step = 0;
    const interval = setInterval(() => {
        if (step >= steps.length) {
            clearInterval(interval);
            progress.style.width = '100%';
            status.textContent = 'Concluído';
            status.style.color = '#0f0';
            log.innerHTML += `<div>[SUCCESS] Manutenção finalizada com sucesso.</div>`;
            log.scrollTop = log.scrollHeight;
            btn.disabled = false;
            btn.textContent = 'Executar Script';
            return;
        }

        log.innerHTML += `<div>[INFO] ${steps[step]}</div>`;
        log.scrollTop = log.scrollHeight;
        progress.style.width = `${((step + 1) / steps.length) * 100}%`;
        step++;
    }, 800);
}

// --- START MENU LOGIC ---
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.querySelector('.start-btn');

    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        if (btn) btn.classList.remove('active');
    } else {
        menu.classList.add('active');
        if (btn) btn.classList.add('active');
    }
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const btn = document.querySelector('.start-btn');

    if (!menu.classList.contains('active')) return;

    // If click is NOT inside menu AND NOT inside start button
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
        if (btn) btn.classList.remove('active');
    }
});


// --- INTELLIGENT TEXT EDITOR LOGIC ---

function editorExec(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor-area').focus();
    editorUpdateStats();
}

function editorToggleFocus() {
    const win = document.getElementById('win-text-editor');
    win.classList.toggle('focus-mode');

    // Add hint if not exists
    if (!document.querySelector('.focus-hint')) {
        const hint = document.createElement('div');
        hint.className = 'focus-hint';
        hint.textContent = 'Clique no ícone de olho ou pressione ESC para sair';
        document.body.appendChild(hint);
    }
}

// Auto-save & Stats
const editorArea = document.getElementById('editor-area');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const editorStatus = document.getElementById('editor-status');

if (editorArea) {
    // Load saved content
    const saved = localStorage.getItem('neon_editor_content');
    if (saved) {
        editorArea.innerHTML = saved;
        editorUpdateStats();
    }

    editorArea.addEventListener('input', () => {
        // Save
        localStorage.setItem('neon_editor_content', editorArea.innerHTML);
        editorStatus.textContent = 'Salvando...';
        setTimeout(() => { editorStatus.textContent = 'Salvo'; }, 1000);

        editorUpdateStats();
    });

    editorArea.addEventListener('keydown', (e) => {
        // Shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') { e.preventDefault(); editorExec('bold'); }
            if (e.key === 'i') { e.preventDefault(); editorExec('italic'); }
        }
    });
}

function editorUpdateStats() {
    if (!editorArea) return;
    const text = editorArea.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;

    if (wordCountEl) wordCountEl.textContent = `${words} palavras`;
    if (charCountEl) charCountEl.textContent = `${chars} caracteres`;

    // Highlight buttons
    ['bold', 'italic', 'underline'].forEach(cmd => {
        // Simple check doesn't always work with execCommand state, but good enough for visual
        // We'll skip complex state checks for this simple version
    });
}

// Escape key to exit focus mode
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const win = document.getElementById('win-text-editor');
        if (win && win.classList.contains('focus-mode')) {
            editorToggleFocus();
        }
    }
});


// --- TASK SYSTEM LOGIC ---

let tasks = JSON.parse(localStorage.getItem('neon_tasks') || '[]');

function taskRender() {
    ['todo', 'doing', 'done'].forEach(status => {
        const list = document.getElementById(`list-${status}`);
        const count = document.getElementById(`count-${status}`);
        if (!list) return;

        list.innerHTML = '';
        const filtered = tasks.filter(t => t.status === status);
        count.textContent = filtered.length;

        filtered.forEach(t => {
            const card = document.createElement('div');
            card.className = `task-card priority-${t.priority}`;
            card.draggable = true;
            card.id = `task-${t.id}`;
            card.innerHTML = `
                <div class="task-title">${t.title}</div>
                <div class="task-meta">
                    <span>${new Date(t.date).toLocaleDateString()}</span>
                    <span class="delete-task" onclick="taskDelete(${t.id}, event)">🗑 expurgar</span>
                </div>
            `;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', t.id);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));

            list.appendChild(card);
        });
    });
}

function taskAllowDrop(e) {
    e.preventDefault();
}

function taskDrop(e, status) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id == id);
    if (task) {
        task.status = status;
        taskSave();
        taskRender();
    }
}

function taskShowAddModal() {
    document.getElementById('task-modal').classList.remove('hidden');
    document.getElementById('task-input-title').focus();
}

function taskCloseModal() {
    document.getElementById('task-modal').classList.add('hidden');
    document.getElementById('task-input-title').value = '';
}

function taskAddTask() {
    const title = document.getElementById('task-input-title').value;
    const priority = document.getElementById('task-input-priority').value;

    if (!title) return;

    tasks.push({
        id: Date.now(),
        title,
        priority,
        status: 'todo',
        date: new Date()
    });

    taskSave();
    taskRender();
    taskCloseModal();
}

function taskDelete(id, e) {
    if (e) e.stopPropagation();
    if (confirm('Deletar essa tarefa?')) {
        tasks = tasks.filter(t => t.id != id);
        taskSave();
        taskRender();
    }
}

function taskSave() {
    localStorage.setItem('neon_tasks', JSON.stringify(tasks));
}

// Initial Render
taskRender();


// --- SPOTIFY CLONE LOGIC ---
let spIsPlaying = false;
let spCurrentSong = { title: "Neon Vibes", artist: "Unknown Artist", duration: 200 };
let spProgress = 0;
let spInterval = null;

function spPlay(id) {
    const titles = ["Neon Vibes", "Daily Mix 1", "Coding Mode", "Top Brasil", "Midnight City", "Blinding Lights", "Nightcall"];
    const artists = ["Unknown", "Spotify", "Focus", "Charts", "M83", "The Weeknd", "Kavinsky"];

    spCurrentSong.title = titles[id] || "Unknown Song";
    spCurrentSong.artist = artists[id] || "Unknown Artist";

    document.getElementById('sp-current-track').textContent = spCurrentSong.title;
    document.getElementById('sp-current-artist').textContent = spCurrentSong.artist;

    spIsPlaying = true;
    spUpdateBtn();
    spStartTimer();
}

function spTogglePlay() {
    spIsPlaying = !spIsPlaying;
    spUpdateBtn();
    if (spIsPlaying) spStartTimer();
    else clearInterval(spInterval);
}

function spUpdateBtn() {
    const btn = document.getElementById('sp-play-btn');
    btn.textContent = spIsPlaying ? "⏸" : "▶";
}

function spStartTimer() {
    clearInterval(spInterval);
    spInterval = setInterval(() => {
        if (!spIsPlaying) return;
        spProgress += 0.5; // fake speed
        if (spProgress > 100) spProgress = 0;

        const bar = document.getElementById('sp-progress');
        if (bar) bar.style.width = spProgress + '%';
    }, 100);
}

// --- INITIAL SETUP ---

// Open welcome window on load with a slight delay for effect
window.addEventListener('load', () => {
    setTimeout(() => {
        openWindow('win-welcome');
    }, 500);
});


// --- RESOURCES APP LOGIC ---
function toggleResource(element) {
    if (!element) return;

    // Get current state
    const currentState = element.getAttribute('data-on');

    // If it's ON, just turn it OFF (always allowed)
    if (currentState === 'true') {
        element.setAttribute('data-on', 'false');
    } else {
        // If turning ON, check the others
        // "Pick Two" Logic: Can't have all 3
        const allSwitches = Array.from(document.querySelectorAll('#win-resources .switch-card'));
        const activeSwitches = allSwitches.filter(sw => sw.getAttribute('data-on') === 'true');

        if (activeSwitches.length >= 2) {
            // We already have 2 active. If we turn this one on, we must turn one off.
            // Requirement logic: "se tempo e energia tiver ligado, dinheio vira desligado"
            // Generalizing: Randomly pick one of the CURRENTLY ACTIVE to turn off.
            // Or prioritize? User said "when clicking money turns off some other".
            // Let's make it random for the joke effect, or cyclic.

            // Filter out the one we are clicking (it's not active yet)
            const otherActive = activeSwitches.filter(sw => sw !== element);

            if (otherActive.length > 0) {
                // Pick a random one to turn off
                const randomVictim = otherActive[Math.floor(Math.random() * otherActive.length)];
                randomVictim.setAttribute('data-on', 'false');
            }
        }

        // Turn the clicked one ON
        element.setAttribute('data-on', 'true');
    }
}


// --- CURRENCY CONVERTER APP LOGIC ---

const CurrencyApp = {
    // API Public provided by ExchangeRate-API (Open)
    // Docs: https://www.exchangerate-api.com/docs/free
    apiUrl: 'https://open.er-api.com/v6/latest/USD',

    // Cache settings (1 hour)
    cacheKey: 'neon_currency_rates',
    cacheDuration: 3600000,

    elements: {
        amount: null,
        from: null,
        to: null,
        result: null,
        status: null,
        statusText: null,
        rateInfo: null,
        swapBtn: null
    },

    rates: {},

    init: function () {
        // Cache DOM elements
        this.elements.amount = document.getElementById('curr-amount');
        this.elements.from = document.getElementById('curr-from');
        this.elements.to = document.getElementById('curr-to');
        this.elements.result = document.getElementById('curr-result');
        this.elements.status = document.getElementById('curr-status');
        this.elements.statusText = document.getElementById('curr-status-text');
        this.elements.rateInfo = document.getElementById('curr-rate-info');
        this.elements.swapBtn = document.getElementById('curr-swap-btn');

        if (!this.elements.amount) return; // Guard clause if elements missing

        // Event Listeners
        this.elements.amount.addEventListener('input', () => this.calculate());
        this.elements.from.addEventListener('change', () => this.calculate());
        this.elements.to.addEventListener('change', () => this.calculate());

        if (this.elements.swapBtn) {
            this.elements.swapBtn.addEventListener('click', () => {
                const temp = this.elements.from.value;
                this.elements.from.value = this.elements.to.value;
                this.elements.to.value = temp;
                this.calculate();
            });
        }

        // Initial Load
        this.loadRates();
    },

    loadRates: async function (force = false) {
        this.updateStatus('loading', 'Atualizando taxas...');

        // Check Cache
        const cached = localStorage.getItem(this.cacheKey);
        if (!force && cached) {
            const data = JSON.parse(cached);
            const now = Date.now();
            if (now - data.timestamp < this.cacheDuration) {
                console.log('[Currency] Using cached rates');
                this.rates = data.rates;
                this.updateStatus('success');
                this.calculate();
                return;
            }
        }

        // Fetch API
        try {
            console.log('[Currency] Fetching new rates...');
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();

            if (data.result === 'success') {
                this.rates = data.rates;

                // Save to cache
                localStorage.setItem(this.cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    rates: this.rates
                }));

                this.updateStatus('success');
                this.calculate();
            } else {
                throw new Error('API Error Data');
            }
        } catch (e) {
            console.error('[Currency] Error:', e);
            this.updateStatus('error', 'Erro de conex�o');
            // Try to use old cache if valid structure even if expired
            if (cached) {
                this.rates = JSON.parse(cached).rates;
                this.calculate();
            }
        }
    },

    calculate: function () {
        if (!this.rates || Object.keys(this.rates).length === 0) return;

        const amount = parseFloat(this.elements.amount.value);
        const from = this.elements.from.value;
        const to = this.elements.to.value;

        if (isNaN(amount)) {
            this.elements.result.textContent = '---';
            return;
        }

        // Logic: Convert FROM to USD, then USD to TO
        // Since base is USD:
        // rate(USD -> FROM) = rates[from]
        // rate(USD -> TO) = rates[to]
        // Value in USD = amount / rates[from]
        // Value in TO = Value in USD * rates[to]

        const rateFrom = this.rates[from];
        const rateTo = this.rates[to];

        if (!rateFrom || !rateTo) {
            this.elements.result.textContent = 'Erro moeda';
            return;
        }

        const result = (amount / rateFrom) * rateTo;

        // Formatting
        const currencySym = {
            'BRL': 'R$', 'USD': '$', 'EUR': '�', 'JPY': '�', 'GBP': '�'
        };
        const sym = currencySym[to] || to;

        this.elements.result.textContent = `${sym} ${result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Show exchange rate 1:1
        const oneUnitRate = (1 / rateFrom) * rateTo;
        this.elements.rateInfo.textContent = `1 ${from} = ${oneUnitRate.toFixed(4)} ${to}`;
    },

    updateStatus: function (state, text) {
        // Reset classes
        if (this.elements.status) {
            this.elements.status.className = 'status-indicator';

            // Add new class
            if (state === 'loading') this.elements.status.classList.add('status-loading');
            if (state === 'success') this.elements.status.classList.add('status-success');
            if (state === 'error') this.elements.status.classList.add('status-error');

            this.elements.statusText.textContent = text;
        }
    }
};

// Expose global function for update button
function currRefreshParams() {
    CurrencyApp.loadRates(true);
}

// Initialize when DOM is ready (or slightly delayed to ensure elements exist if injected)
setTimeout(() => {
    CurrencyApp.init();
}, 1000);

// --- THEME & WALLPAPER SYSTEM LOGIC ---
function sysLoadTheme() {
    const savedTheme = localStorage.getItem('neon_theme') || 'default';
    if (savedTheme === 'neon-light') {
        document.documentElement.setAttribute('data-theme', 'neon-light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function sysToggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'neon-light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('neon_theme', 'default');
    } else {
        document.documentElement.setAttribute('data-theme', 'neon-light');
        localStorage.setItem('neon_theme', 'neon-light');
    }
}

// Inicializa no script
sysLoadTheme();

// --- WALLPAPER APP LOGIC ---
const WallpaperApp = {
    // Estado do App
    state: {
        image: null,
        mode: 'cover',
        zoom: 100,
        posX: 50,
        posY: 50
    },

    // Referências do DOM
    el: {
        monitor: null,
        fileInput: null,
        modeSelect: null,
        zoomSlider: null,
        zoomVal: null
    },

    drag: {
        isDragging: false,
        startX: 0,
        startY: 0
    },

    init: function () {
        this.el.monitor = document.getElementById('wp-preview-monitor');
        this.el.fileInput = document.getElementById('wp-file-input');
        this.el.modeSelect = document.getElementById('wp-mode-select');
        this.el.zoomSlider = document.getElementById('wp-zoom-slider');
        this.el.zoomVal = document.getElementById('wp-zoom-val');

        if (!this.el.monitor) return; // Se a janela nao existir no DOM ignore.

        // Eventos de Controles
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

        // Eventos de Drag no Monitor (Arrastar Background)
        this.el.monitor.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.doDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        // Carregar persistência ao inicializar o OS
        this.loadSystemWallpaper();
    },

    handleFileUpload: function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            // Imagem Base64. Em um sistema de verdade faríamos parse do blob, 
            // no localStorage a base64 precisa ser controlada p não ultrapassar os 5mb de cota.
            // Para não quebrar por arquivos mto pesados, desenhar em um canvas é o ideal.

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Limitar tamanho para n estourar limite do localstorage
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Converter de votla pra base64 (jpeg leve para economizar espaco)
                this.state.image = canvas.toDataURL('image/jpeg', 0.85);

                // Reset Posição
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

        // Calcular delta em Porcentagem do monitor
        const rect = this.el.monitor.getBoundingClientRect();

        const deltaX = (e.clientX - this.drag.startX) / rect.width * 100;
        const deltaY = (e.clientY - this.drag.startY) / rect.height * 100;

        // Atualizar state local
        this.state.posX = Math.max(0, Math.min(100, this.state.posX - deltaX)); // inverted direction for intuitive grab
        this.state.posY = Math.max(0, Math.min(100, this.state.posY - deltaY));

        this.drag.startX = e.clientX;
        this.drag.startY = e.clientY;

        this.updatePreviewPosition();
    },

    stopDrag: function () {
        this.drag.isDragging = false;
    },

    updatePreview: function () {
        if (!this.state.image) return;

        this.el.monitor.style.backgroundImage = `url(${this.state.image})`;

        // Tamanho
        if (this.state.mode === 'cover' || this.state.mode === 'contain') {
            // O Zoom no cover/contain afeta escalando
            this.el.monitor.style.backgroundSize = `${this.state.zoom}%`;
            // Se mode estritamente cover mas com zoom 100%: 
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

        // Se o modo for esticar, drag não faz sentido.
        if (this.state.mode === '100% 100%') {
            this.el.monitor.style.backgroundPosition = '0 0';
            return;
        }

        this.el.monitor.style.backgroundPosition = `${this.state.posX}% ${this.state.posY}%`;
    },

    loadSystemWallpaper: function () {
        const saved = localStorage.getItem('neon_wallpaper');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state = data;

                // Sincronizar UI da janela (se abrir)
                if (this.el.modeSelect) this.el.modeSelect.value = data.mode;
                if (this.el.zoomSlider) this.el.zoomSlider.value = data.zoom;
                if (this.el.zoomVal) this.el.zoomVal.textContent = `${data.zoom}%`;

                this.updatePreview();

                // Aplicar ao sistema body real
                this.applyToSystem(data);
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
        if (data.zoom !== 100 && data.mode !== '100% 100%') {
            bgSize = `${data.zoom}%`;
        }
        docStyle.setProperty('--sys-wp-size', bgSize);
        docStyle.setProperty('--sys-wp-pos', `${data.posX}% ${data.posY}%`);
    }
};

// Exposição global das actions do HTML 
function sysWpReset() {
    WallpaperApp.state.posX = 50;
    WallpaperApp.state.posY = 50;
    WallpaperApp.state.zoom = 100;
    WallpaperApp.state.mode = 'cover';

    document.getElementById('wp-zoom-slider').value = 100;
    document.getElementById('wp-zoom-val').textContent = '100%';
    document.getElementById('wp-mode-select').value = 'cover';

    WallpaperApp.updatePreview();
}

function sysWpApply() {
    if (!WallpaperApp.state.image) {
        alert("Por favor, faça upload de uma imagem primeiro.");
        return;
    }

    // Salvar no localstorage
    localStorage.setItem('neon_wallpaper', JSON.stringify(WallpaperApp.state));

    // Atualizar background do SO
    WallpaperApp.applyToSystem(WallpaperApp.state);

    alert("Plano de Fundo aplicado!");
}

// Inicializa no script
setTimeout(() => {
    WallpaperApp.init();
}, 200);
