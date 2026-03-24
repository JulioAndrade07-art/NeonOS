// --- WINDOW MANAGEMENT LOGIC ---

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

    const dockItem = document.querySelector(`.dock-item[onclick*="'${id}'"]`);
    if (dockItem) {
        dockItem.classList.add('show');
    }
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

    const dockItem = document.querySelector(`.dock-item[onclick*="'${id}'"]`);
    if (dockItem) {
        dockItem.classList.remove('show');
    }
}

// Lógica local para Toggle via GUI
function sysToggleWindow(id, checkbox) {
    if (checkbox && !checkbox.checked) {
        closeWindow(id);
    } else if (checkbox && checkbox.checked) {
        openWindow(id);
    }
}

// --- DRAG AND DROP LOGIC (Vanilla JS) ---
let isDragging = false;
let currentWindow = null;
let initialX;
let initialY;

// Attach events to all window headers
document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', dragStart);
    // Touch support (mobile responsivity item 2)
    header.addEventListener('touchstart', dragStart, { passive: false });
});

// Global mouse events
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

// Touch events globally
document.addEventListener('touchmove', drag, { passive: false });
document.addEventListener('touchend', dragEnd);

function getClientX(e) {
    return e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
}
function getClientY(e) {
    return e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
}

function dragStart(e) {
    currentWindow = e.target.closest('.window');
    if (!currentWindow) return;

    if (currentWindow.classList.contains('maximized')) {
        currentWindow = null;
        return;
    }

    focusWindow(currentWindow);

    const rect = currentWindow.getBoundingClientRect();
    initialX = getClientX(e) - rect.left;
    initialY = getClientY(e) - rect.top;

    isDragging = true;
    currentWindow.classList.add('dragging');
}

function drag(e) {
    if (isDragging && currentWindow) {
        e.preventDefault();

        const currentX = getClientX(e) - initialX;
        const currentY = getClientY(e) - initialY;

        currentWindow.style.transform = "scale(1)";
        currentWindow.style.left = `${currentX}px`;
        currentWindow.style.top = `${currentY}px`;
        currentWindow.style.margin = "0";
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

// Global functions exports
window.openWindow = openWindow;
window.closeWindow = closeWindow;
window.sysToggleWindow = sysToggleWindow;

// --- MAXIMIZE & CONTEXT MENU INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Add Maximize buttons
    document.querySelectorAll('.window-controls').forEach(controls => {
        if (!controls.querySelector('.btn-maximize')) {
            const maxBtn = document.createElement('button');
            maxBtn.innerHTML = '🗖';
            maxBtn.title = 'Maximizar/Restaurar';
            maxBtn.className = 'btn-maximize';
            maxBtn.onmousedown = e => e.stopPropagation(); // Evitar arrastar ao clicar
            maxBtn.ontouchstart = e => e.stopPropagation();
            maxBtn.onclick = (e) => {
                e.stopPropagation();
                const win = e.target.closest('.window');
                if (win) win.classList.toggle('maximized');
            };
            controls.insertBefore(maxBtn, controls.firstChild);
        }
    });

    // 2. Taskbar Context Menu (Close App)
    const taskbar = document.getElementById('taskbar');
    if (taskbar) {
        taskbar.addEventListener('contextmenu', (e) => {
            const dockItem = e.target.closest('.dock-item');
            if (dockItem) {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, dockItem);
            }
        });
    }
});

function showContextMenu(x, y, dockItem) {
    const onclickStr = dockItem.getAttribute('onclick');
    if (!onclickStr) return;
    
    const winIdMatch = onclickStr.match(/'([^']+)'/);
    if (!winIdMatch) return;
    const winId = winIdMatch[1];
    
    let menu = document.getElementById('neon-context-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'neon-context-menu';
        document.body.appendChild(menu);
    }
    
    menu.innerHTML = `
        <div class="ctx-item" onclick="closeWindow('${winId}'); document.getElementById('neon-context-menu').classList.remove('active');">
            <span style="color: #ff3333; margin-right: 8px; font-weight: bold;">✕</span> Fechar App
        </div>
    `;
    
    // Manter menu dentro da tela
    if (x + 160 > window.innerWidth) x = window.innerWidth - 170;
    
    menu.style.left = `${x}px`;
    menu.style.top = `${y - 50}px`; 
    menu.classList.add('active');
}

// Fechar context menu ao clicar fora
document.addEventListener('click', (e) => {
    const menu = document.getElementById('neon-context-menu');
    if (menu && !menu.contains(e.target)) {
        menu.classList.remove('active');
    }
});
