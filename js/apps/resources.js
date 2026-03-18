// --- RESOURCES APP LOGIC ---
function toggleResource(element) {
    if (!element) return;

    const currentState = element.getAttribute('data-on');

    if (currentState === 'true') {
        element.setAttribute('data-on', 'false');
    } else {
        const allSwitches = Array.from(document.querySelectorAll('#win-resources .switch-card'));
        const activeSwitches = allSwitches.filter(sw => sw.getAttribute('data-on') === 'true');

        if (activeSwitches.length >= 2) {
            const otherActive = activeSwitches.filter(sw => sw !== element);
            if (otherActive.length > 0) {
                const randomVictim = otherActive[Math.floor(Math.random() * otherActive.length)];
                randomVictim.setAttribute('data-on', 'false');
            }
        }
        element.setAttribute('data-on', 'true');
    }
}

window.toggleResource = toggleResource;
