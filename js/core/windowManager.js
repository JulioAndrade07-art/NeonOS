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
