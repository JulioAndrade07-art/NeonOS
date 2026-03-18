// --- CORE INITIALIZATION & UI (Start Menu/Clock/Demo) ---

// --- CLOCK LOGIC ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

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

document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const btn = document.querySelector('.start-btn');
    if (!menu || !btn) return;
    if (!menu.classList.contains('active')) return;

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
        if (btn) btn.classList.remove('active');
    }
});
window.toggleStartMenu = toggleStartMenu;

// --- CUSTOM JS DEMO LOGIC ---
window.runDemoAction = function () {
    const container = document.getElementById('custom-container');
    const time = new Date().toLocaleTimeString();

    const alertBox = document.createElement('div');
    alertBox.style.marginTop = "10px";
    alertBox.style.padding = "5px";
    alertBox.style.borderLeft = "3px solid var(--neon-blue)";
    alertBox.style.background = "rgba(0, 212, 255, 0.1)";
    alertBox.innerHTML = `<strong>Ação Executada:</strong> Código customizado rodou às ${time}`;

    container.appendChild(alertBox);
    container.scrollTop = container.scrollHeight;
};

// Open welcome window on load is now handled by boot.js
window.addEventListener('load', () => {
    // Other initializations can go here
});
