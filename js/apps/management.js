// --- SYSTEM MANAGEMENT LOGIC ---

const sysDB = {
    getUsers: () => window.StorageManager.load('neon_users', []),
    saveUsers: (users) => window.StorageManager.save('neon_users', users),
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

    const users = sysDB.getUsers();
    if (users.find(u => u.user === user)) {
        document.getElementById('reg-msg').textContent = 'Usuário já existe.';
        return;
    }

    sysDB.addUser({ name, user, pass });
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

    const btn = document.querySelector(`.tab-btn[onclick*="'${tab}'"]`);
    if (btn) btn.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

function sysRenderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
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

// Map globals
window.sysShowLogin = sysShowLogin;
window.sysShowRegister = sysShowRegister;
window.sysLogin = sysLogin;
window.sysRegister = sysRegister;
window.sysLogout = sysLogout;
window.sysSwitchTab = sysSwitchTab;
window.sysDeleteUser = sysDeleteUser;
window.sysRunAutomation = sysRunAutomation;
