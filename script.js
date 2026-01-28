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

    // If already open, just focus and perhaps shake/highlight?
    // For now, check class:
    if (!win.classList.contains('active')) {
        win.classList.add('active');

        // Reset position if needed, or center it
        // We'll keep the CSS centering for the initial open
        // But if it was moved, we might want to respect that?
        // Let's reset to center for simplicity on re-open or keep last pos if visible.
        // Actually, CSS handles initial center. If we don't clear inline top/left, it remembers position.
        // A nice touch is to slightly offset if multiple open.
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
    try {
        // Safe evaluation (basic)
        // Check for division by zero
        if (calcCurrentInput.includes('/0')) {
            calcCurrentInput = 'Erro';
        } else {
            // Using Function constructor as a slightly safer eval alias for simple math
            // But eval is generally discouraged. However for a simple local calculator it's ok-ish.
            // Let's replace '×' with '*' and ' ÷' with '/' if we used symbols
            // But we used standard symbols in logic.
            const result = new Function('return ' + calcCurrentInput)();
            calcCurrentInput = String(result);
        }
    } catch (e) {
        calcCurrentInput = 'Erro';
    }
    calcShouldResetDisplay = true;
    calcUpdateDisplay();

    // Add to history
    calcAddToHistory();
}

function calcAddToHistory() {
    const list = document.getElementById('calc-historyList');
    if (!list) return;

    // Create item
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
                <div class="hist-res">${calcCurrentInput}</div>
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

// --- INITIAL SETUP ---
// Open welcome window on load with a slight delay for effect
window.addEventListener('load', () => {
    setTimeout(() => {
        openWindow('win-welcome');
    }, 500);
});
