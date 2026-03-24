console.log("Átomos (Neural Edition) script loaded.");

let atomosParticles = [];
let globalEnergy = 1.0;
let quantumGravity = 1.0;
let universeMode = false;
let atomosIsActive = false;

const PERIODIC_TABLE = [
    { n: 0, name: "Neutrônio (Vazio)", symbol: "n" },
    { n: 1, name: "Hidrogênio", symbol: "H" },
    { n: 2, name: "Hélio", symbol: "He" },
    { n: 3, name: "Lítio", symbol: "Li" },
    { n: 4, name: "Berílio", symbol: "Be" },
    { n: 5, name: "Boro", symbol: "B" },
    { n: 6, name: "Carbono", symbol: "C" },
    { n: 7, name: "Nitrogênio", symbol: "N" },
    { n: 8, name: "Oxigênio", symbol: "O" },
    { n: 9, name: "Flúor", symbol: "F" },
    { n: 10, name: "Neônio", symbol: "Ne" }
];

function sendToNeuralViewer(message) {
    const iframe = document.getElementById('atomos-iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, '*');
    }
}

function atomosAddParticle(type) {
    let p = { type: type, mass: type === 'electron' ? 0.005 : 1.0 };
    atomosParticles.push(p);
    
    // Trigger a pulse
    sendToNeuralViewer({ type: 'PULSE' });
    
    updateAtomosHUD();
}

function atomosSpawnAtom() {
    const elId = document.getElementById('atomos-element-select').value;
    const config = {
        'H': { p: 1, n: 0, e: 1 },
        'He': { p: 2, n: 2, e: 2 },
        'Li': { p: 3, n: 4, e: 3 },
        'C': { p: 6, n: 6, e: 6 },
        'O': { p: 8, n: 8, e: 8 }
    };
    const data = config[elId];
    if (!data) return;

    for (let i = 0; i < data.p; i++) atomosAddParticle('proton');
    for (let i = 0; i < data.n; i++) atomosAddParticle('neutron');
    for (let i = 0; i < data.e; i++) atomosAddParticle('electron');
    
    // Morph formation
    sendToNeuralViewer({ type: 'MORPH' });
}

function atomosBigBang() {
    atomosReset();
    for (let i = 0; i < 15; i++) atomosAddParticle('proton');
    for (let i = 0; i < 15; i++) atomosAddParticle('neutron');
    for (let i = 0; i < 15; i++) atomosAddParticle('electron');
    
    sendToNeuralViewer({ type: 'MORPH' });
}

function atomosReset() {
    atomosParticles = [];
    updateAtomosHUD();
}

function atomosUpdateEnergy(val) {
    globalEnergy = parseFloat(val);
}

function atomosUpdateGravity(val) {
    quantumGravity = parseFloat(val);
}

function atomosToggleUniverse() {
    universeMode = !universeMode;
    const btn = document.getElementById('btn-universe');
    if (btn) {
        btn.textContent = `Modo Universo: ${universeMode ? "ON" : "OFF"}`;
        btn.style.color = universeMode ? "var(--neon-cyan)" : "#fff";
    }
}

function updateAtomosHUD() {
    let pCount = 0;
    let nCount = 0;
    let eCount = 0;
    let totalMass = 0;

    atomosParticles.forEach(p => {
        if (p.type === 'proton') pCount++;
        if (p.type === 'neutron') nCount++;
        if (p.type === 'electron') eCount++;
        totalMass += p.mass;
    });

    // Send density mapping
    // Density ranges from 0.1 to 1.0 based on particles
    let density = Math.min(1.0, 0.1 + (totalMass / 30.0));
    sendToNeuralViewer({ type: 'SET_DENSITY', value: density });

    // Switch theme based on element charge
    let netCharge = pCount - eCount;
    if (netCharge > 0) {
        sendToNeuralViewer({ type: 'SET_THEME', value: 1 }); // Fire/Red
    } else if (netCharge < 0) {
        sendToNeuralViewer({ type: 'SET_THEME', value: 2 }); // Cyan/Green
    } else {
        sendToNeuralViewer({ type: 'SET_THEME', value: 0 }); // Purple/Blue
    }

    // Logic from previous code...
    let atomicNum = Math.min(pCount, PERIODIC_TABLE.length - 1);
    const element = PERIODIC_TABLE[atomicNum] || { name: "Desconhecido", symbol: "?" };

    document.getElementById('hud-element-name').textContent = `${element.name} (${element.symbol})`;
    document.getElementById('hud-protons').textContent = pCount;
    document.getElementById('hud-neutrons').textContent = nCount;
    document.getElementById('hud-electrons').textContent = eCount;
    document.getElementById('hud-charge').textContent = (netCharge > 0 ? "+" : "") + netCharge;
    
    const mass_u = pCount + nCount;
    document.getElementById('hud-mass').textContent = mass_u;

    const U_TO_KG = 1.660539e-27;
    const mass_kg = mass_u * U_TO_KG;
    const C_SQUARED = 8.987551787368176e+16;
    const energy_joules = mass_kg * C_SQUARED;
    const MEV_TO_JOULES = 1.602e-13;
    const bindingEnergyJ = (8 * mass_u) * MEV_TO_JOULES;

    const formatSci = (num) => {
        if (num === 0) return "0";
        const exp = Math.floor(Math.log10(num));
        const mantissa = (num / Math.pow(10, exp)).toFixed(2);
        return `${mantissa} × 10^${exp}`;
    };

    document.getElementById('hud-mass-kg').textContent = formatSci(mass_kg);
    document.getElementById('hud-energy-joules').textContent = formatSci(energy_joules);
    const bindingEl = document.getElementById('hud-binding-energy');
    if (bindingEl) bindingEl.textContent = formatSci(bindingEnergyJ);

    const stabilityEl = document.getElementById('hud-stability');
    if (pCount === 0 && nCount > 0) {
        stabilityEl.textContent = "Nêutrons Livres Decaindo";
        stabilityEl.className = "stability-warning unstable";
    } else if (pCount > 0) {
        const ratio = (nCount / pCount);
        let isStable = pCount === 1 ? (ratio <= 2) : (ratio >= 0.8 && ratio <= 1.5);
        if (pCount > 10) isStable = false;

        if (isStable) {
            stabilityEl.textContent = "Núcleo Estável";
            stabilityEl.className = "stability-warning";
        } else {
            stabilityEl.textContent = "INSTÁVEL - Rádioativo";
            stabilityEl.className = "stability-warning unstable";
            if (Math.random() < 0.05 * globalEnergy) causeDecay();
        }
    } else {
        stabilityEl.textContent = "Vazio Quântico";
        stabilityEl.className = "stability-warning";
    }
}

function causeDecay() {
    const nucleons = atomosParticles.filter(p => p.type === 'proton' || p.type === 'neutron');
    if (nucleons.length > 0) {
        const idx = atomosParticles.indexOf(nucleons[Math.floor(Math.random() * nucleons.length)]);
        if (idx !== -1) {
            atomosParticles.splice(idx, 1);
            updateAtomosHUD(); // force update when atom decays
        }
        sendToNeuralViewer({ type: 'PULSE' });
    }
}

setInterval(() => {
    const win = document.getElementById('win-atomos');
    if (win) {
        const isOpen = win.classList.contains('active');
        if (isOpen && !atomosIsActive) {
            atomosIsActive = true;
            sendToNeuralViewer({ type: 'PAUSE', value: false });
        } else if (!isOpen && atomosIsActive) {
            atomosIsActive = false;
            sendToNeuralViewer({ type: 'PAUSE', value: true });
        }
        
        if (atomosIsActive && universeMode) {
            if (Math.random() < 0.05 * globalEnergy && atomosParticles.length < 50) {
                const types = ['proton', 'neutron', 'electron'];
                atomosAddParticle(types[Math.floor(Math.random() * types.length)]);
            }
        }
    }
}, 500);
