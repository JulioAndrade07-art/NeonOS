// Átomos Application Logic
console.log("Átomos script loaded.");

let atomosScene, atomosCamera, atomosRenderer;
let atomosParticles = [];
let atomosAnimationID;
let atomosIsActive = false;

// Settings
let globalEnergy = 1.0;
let quantumGravity = 1.0;
let universeMode = false;

// Physics Constants
const FORCE_ELECTROMAGNETIC = 0.8;
const FORCE_STRONG_NUCLEAR = 5.0; // Increased to hold nucleus together tightly
const NUCLEON_RADIUS = 0.5;
const INTERACTION_RADIUS = 15;

// Elements Table up to ~Atomic Number 10 for demo (simplified)
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

// Initialize Three.js Environment
function initAtomos() {
    const container = document.getElementById('atomos-container');
    if (!container) return;

    // Wait slightly to ensure container is fully visible and has dimensions
    setTimeout(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        atomosScene = new THREE.Scene();
        atomosScene.background = new THREE.Color(0x020205);

        // Add some space dust/fog
        atomosScene.fog = new THREE.FogExp2(0x020205, 0.02);

        atomosCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        atomosCamera.position.z = 20;

        atomosRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        atomosRenderer.setSize(width, height);
        atomosRenderer.setPixelRatio(window.devicePixelRatio);

        // Additive blending looks better with glow but simple renderer is fine if additive blending on sprites

        container.innerHTML = '';
        container.appendChild(atomosRenderer.domElement);

        // Resize handler using ResizeObserver to detect CSS resizing of the window
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const w = entry.contentRect.width;
                const h = entry.contentRect.height;
                if (w > 0 && h > 0) {
                    atomosCamera.aspect = w / h;
                    atomosCamera.updateProjectionMatrix();
                    atomosRenderer.setSize(w, h);
                }
            }
        });
        resizeObserver.observe(container);

        // Add some ambient particles (quantum field)
        createQuantumField();

        atomosIsActive = true;
        animateAtomos();

        // Setup Drag & Drop
        initAtomosInteraction(container);

    }, 100);
}

// Helper to create radial gradient textures for glowing particles
function createParticleTexture(colorInt) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Draw gradient
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    const colorStr = '#' + colorInt.toString(16).padStart(6, '0');

    gradient.addColorStop(0, '#ffffff'); // pure white center
    gradient.addColorStop(0.2, colorStr); // core color
    gradient.addColorStop(0.5, colorStr + '88'); // faded color
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // transparent edge

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Shared Materials (Optimized)
const matProton = new THREE.SpriteMaterial({
    map: createParticleTexture(0xff3333),
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const matNeutron = new THREE.SpriteMaterial({
    map: createParticleTexture(0x999999),
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const matElectron = new THREE.SpriteMaterial({
    map: createParticleTexture(0x3399ff),
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

function createQuantumField() {
    // Generate a subtle background star/dust field
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 500; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100 - 20; // push mostly back
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x221144, size: 0.5, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(geometry, material);
    atomosScene.add(points);
}

class Particle {
    constructor(type, x, y, z) {
        this.type = type; // 'proton', 'neutron', 'electron'
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        let material;
        if (type === 'proton') {
            this.mass = 1.0;
            this.charge = 1.0;
            material = matProton;
        } else if (type === 'neutron') {
            this.mass = 1.0;
            this.charge = 0;
            material = matNeutron;
        } else if (type === 'electron') {
            this.mass = 0.005; // much lighter
            this.charge = -1.0;
            material = matElectron;
        }

        this.sprite = new THREE.Sprite(material);

        // Scale based on mass (electrons are smaller)
        const s = type === 'electron' ? 0.3 : 1.0;
        this.sprite.scale.set(s, s, s);

        // Save reference back to this class instance for raycasting
        this.sprite.userData.particle = this;

        this.sprite.position.copy(this.position);
        atomosScene.add(this.sprite);
    }

    update(dt) {
        // Simple Euler integration
        this.velocity.add(this.acceleration.clone().multiplyScalar(dt));

        // Apply damping (quantum friction) to stabilize orbits and clusters
        this.velocity.multiplyScalar(0.96);

        this.position.add(this.velocity.clone().multiplyScalar(dt));
        this.sprite.position.copy(this.position);

        // Reset acceleration
        this.acceleration.set(0, 0, 0);

        // Keep bounds
        const bound = 25;
        if (this.position.length() > bound && !this.isBeingDragged) {
            // gently push back
            this.acceleration.add(this.position.clone().normalize().multiplyScalar(-0.05 * globalEnergy));
        }
    }
}

function atomosAddParticle(type, startPos = null, startVel = null) {
    if (!atomosScene) return;

    // Spawn near center or at specific pos
    let pX = (Math.random() - 0.5) * 2;
    let pY = (Math.random() - 0.5) * 2;
    let pZ = (Math.random() - 0.5) * 2;

    if (startPos) {
        pX = startPos.x; pY = startPos.y; pZ = startPos.z;
    }

    const p = new Particle(type, pX, pY, pZ);

    // Give initial push
    if (startVel) {
        p.velocity.copy(startVel);
    } else if (type === 'electron') {
        p.velocity.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
    }

    atomosParticles.push(p);
    playSoundEffect('spawn');
    return p;
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

    // Pick a random spawn cluster position slightly away from center
    const clusterCenter = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    );

    for (let i = 0; i < data.p; i++) {
        atomosAddParticle('proton', clusterCenter.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5))));
    }
    for (let i = 0; i < data.n; i++) {
        atomosAddParticle('neutron', clusterCenter.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5))));
    }
    for (let i = 0; i < data.e; i++) {
        // electrons further out
        let ePos = clusterCenter.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3));
        let eVel = new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
        atomosAddParticle('electron', ePos, eVel);
    }
}

function atomosBigBang() {
    if (!atomosScene) return;

    // Clear existing
    atomosParticles.forEach(p => atomosScene.remove(p.sprite));
    atomosParticles = [];

    // Create a burst
    const numP = 15;
    const numN = 15;
    const numE = 15;

    for (let i = 0; i < numP; i++) atomosAddParticle('proton');
    for (let i = 0; i < numN; i++) atomosAddParticle('neutron');
    for (let i = 0; i < numE; i++) atomosAddParticle('electron');

    // Explosive velocity and scattered positions
    atomosParticles.forEach(p => {
        // Spawn them already spread out a bit to break the nuclear force radius
        p.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);

        // Massive outwards velocity
        p.velocity.copy(p.position).normalize().multiplyScalar(20 + Math.random() * 20);
    });

    playSoundEffect('explosion');
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
        if (universeMode) {
            btn.style.borderColor = "var(--neon-cyan)";
            btn.style.color = "var(--neon-cyan)";
            btn.style.textShadow = "0 0 8px var(--neon-cyan)";
        } else {
            btn.style.borderColor = "var(--glass-border)";
            btn.style.color = "#fff";
            btn.style.textShadow = "none";
        }
    }
}

// Simple Physics Step
function computePhysics(dt) {
    if (!dt) return;
    // Modify dt by global energy
    dt *= globalEnergy;

    // --- PHASE 1: Analyze Nucleus & Shells ---
    // Separate particles
    const nucleons = atomosParticles.filter(p => !p.isBeingDragged && (p.type === 'proton' || p.type === 'neutron'));
    const electrons = atomosParticles.filter(p => !p.isBeingDragged && p.type === 'electron');
    const dragged = atomosParticles.filter(p => p.isBeingDragged);

    let centerOfMass = new THREE.Vector3();
    let nucleusMass = 0;

    // We calculate CoM mainly based on nucleons (they contain 99.9% of mass)
    let activeNucleons = nucleons.length > 0 ? nucleons : dragged.filter(p => p.type !== 'electron');

    if (activeNucleons.length > 0) {
        activeNucleons.forEach(p => {
            if (p && p.position) {
                centerOfMass.add(p.position.clone().multiplyScalar(p.mass || 1.0));
                nucleusMass += (p.mass || 1.0);
            }
        });
        if (nucleusMass > 0) {
            centerOfMass.divideScalar(nucleusMass);
        }
    }

    // --- PHASE 2: Strong Nuclear Binding (Spring System) ---
    // To prevent the "exploding" nucleus bug, we use a damped spring model 
    // to tightly pack nucleons around their collective center of mass.
    // Base radius formula from PDF: R = R_0 * A^(1/3) -> approximated visually here
    const coreTargetRadius = Math.pow(activeNucleons.length || 1, 1 / 3) * (NUCLEON_RADIUS * 0.8);

    activeNucleons.forEach(p => {
        if (!p || !p.position) return;
        const diff = centerOfMass.clone().sub(p.position);
        const dist = diff.length();
        let springForce = 0;

        let isBound = true;
        // Pull towards center if outside core radius, push away slightly if perfectly identical pos to spread them
        if (dist > coreTargetRadius) {
            if (dist < 15.0) { // Limit strong force to close range
                springForce = FORCE_STRONG_NUCLEAR * quantumGravity * (dist - coreTargetRadius);
            } else {
                springForce = 0; // Particle escaped
                isBound = false;
            }
        } else if (dist < 0.1) {
            // Push apart micro-collisions
            springForce = -5.0 * quantumGravity;
        }

        if (dist > 0.001 && springForce !== 0) {
            const dir = diff.clone().normalize();
            p.acceleration.add(dir.multiplyScalar(springForce / p.mass));
        }

        // Add additional dampening to nucleons to keep nucleus "frozen" relative to itself
        if (isBound) {
            p.velocity.multiplyScalar(0.7);
        } else {
            p.velocity.multiplyScalar(0.99); // Let them fly with low friction
        }
    });

    // Handle dragged particles (Nucleus follows dragged proton)
    dragged.forEach(dp => {
        if (dp && dp.position && dp.type !== 'electron' && activeNucleons.length > 0) {
            // Strong force pulls the whole nucleus towards the dragged particle's position extremely fast
            const diff = dp.position.clone().sub(centerOfMass);
            if (diff.length() > 0.1) {
                const magneticPull = diff.multiplyScalar(FORCE_STRONG_NUCLEAR * 10 * quantumGravity);
                activeNucleons.forEach(n => {
                    if (n && n.acceleration) n.acceleration.add(magneticPull.clone().divideScalar(n.mass || 1.0));
                });
            }
        }
    });

    // --- PHASE 3: Bohr Model Electron Shells (Quantized Orbits) ---
    // Capacities from PDF Tabela V: K=2, L=8, M=18, N=32
    const shellCapacities = [2, 8, 18, 32, 50];
    const BASE_ORBIT_RADIUS = 3.0; // r_0

    let currentShell = 0;
    let shellCount = 0;

    electrons.forEach((e, index) => {
        // Assign to shell
        if (shellCount >= shellCapacities[currentShell]) {
            currentShell++;
            shellCount = 0;
        }
        shellCount++;

        // r_n = r_0 * n^2 (Bohr radius formula)
        // using n = currentShell + 1
        const n = currentShell + 1;

        // Visual adjustment: n^2 gets too big, let's use a softer multiplier for UI limits
        const targetRadius = BASE_ORBIT_RADIUS + (n * 1.5);

        // Apply Centripetal & Restoring forces to keep in orbit
        if (nucleusMass > 0) {
            const diff = centerOfMass.clone().sub(e.position);
            const dist = diff.length();

            if (dist > 0.01) {
                const dirToCenter = diff.clone().normalize();

                // Spring force to keep EXACTLY at shell radius
                const radialDiff = dist - targetRadius;
                // If too far, pull in. If too close, push out. (Electromagnetic/Quantum balance)
                const restoringForce = 15.0 * radialDiff;

                e.acceleration.add(dirToCenter.clone().multiplyScalar(restoringForce / e.mass));

                // Add Tangential velocity for exactly circular orbit
                // Cross product of direction to center and 'UP' vector usually gives a tangent
                // To make a sphere of orbits, we randomize the normal plane per electron based on its ID

                const upVector = new THREE.Vector3(
                    Math.sin(index),
                    Math.cos(index * 1.3),
                    Math.sin(index * 2.1)
                ).normalize();

                let tangent = new THREE.Vector3().crossVectors(dirToCenter, upVector);
                if (tangent.lengthSq() < 0.001) {
                    tangent.set(0, 1, 0); // Fallback if vectors are parallel
                } else {
                    tangent.normalize();
                }

                // Desired orbital speed (faster for inner shells)
                const orbitSpeed = (10.0 / n) * quantumGravity;
                const desiredVelocity = tangent.multiplyScalar(orbitSpeed);

                // Correct velocity smoothly
                e.velocity.lerp(desiredVelocity, 0.1);
            }
        } else {
            // Free roaming electrons if no nucleus
            e.velocity.multiplyScalar(0.98);
        }
    });

    // --- PHASE 4: Global Quantum Gravity ---
    // Pulls the entire atom structure very slowly to the 0,0,0 center so it doesn't leave the screen
    atomosParticles.forEach(p => {
        if (!p.isBeingDragged) {
            p.acceleration.add(p.position.clone().normalize().multiplyScalar(-0.15 * quantumGravity));
        }
    });

    // Ignore physics update for particles being dragged by user
    for (let i = 0; i < atomosParticles.length; i++) {
        if (!atomosParticles[i].isBeingDragged) {
            atomosParticles[i].update(dt);
        }
    }
}

// Find the main nucleus to update HUD
function updateAtomosHUD() {
    let pCount = 0;
    let nCount = 0;
    let eCount = 0;

    // Simple grouping: count nucleons within a bounding radius of the center of mass
    let centerOfMass = new THREE.Vector3();
    let totalMass = 0;

    atomosParticles.forEach(p => {
        if (p.type === 'proton') pCount++;
        if (p.type === 'neutron') nCount++;
        if (p.type === 'electron') eCount++;

        centerOfMass.add(p.position.clone().multiplyScalar(p.mass));
        totalMass += p.mass;
    });

    if (totalMass > 0) {
        centerOfMass.divideScalar(totalMass);
    }

    // Physics Constants from the text
    const C = 299792458; // m/s
    const C_SQUARED = Math.pow(C, 2); // 8.987551787368176e+16
    const U_TO_KG = 1.660539e-27; // 1 atomic mass unit = 1.66 x 10^-27 kg
    const MEV_TO_JOULES = 1.602e-13; // 1 MeV = 1.602 x 10^-13 J

    // Determine element (atomic number = protons)
    let atomicNum = Math.min(pCount, PERIODIC_TABLE.length - 1);
    const element = PERIODIC_TABLE[atomicNum] ? PERIODIC_TABLE[atomicNum] : { name: "Desconhecido", symbol: "?" };

    // Update DOM
    if (document.getElementById('hud-element-name')) {
        document.getElementById('hud-element-name').textContent = `${element.name} (${element.symbol})`;
        document.getElementById('hud-protons').textContent = pCount;
        document.getElementById('hud-neutrons').textContent = nCount;
        document.getElementById('hud-electrons').textContent = eCount;

        const netCharge = pCount - eCount;
        document.getElementById('hud-charge').textContent = (netCharge > 0 ? "+" : "") + netCharge;

        // Mass and Energy Calculations
        const mass_u = pCount + nCount;
        document.getElementById('hud-mass').textContent = mass_u;

        // Convert to kg
        const mass_kg = mass_u * U_TO_KG;

        // E = mc^2
        const energy_joules = mass_kg * C_SQUARED;

        // Formatting scientific notation for UI
        const formatSci = (num) => {
            if (num === 0) return "0";
            const exp = Math.floor(Math.log10(num));
            const mantissa = (num / Math.pow(10, exp)).toFixed(2);
            return `${mantissa} × 10^${exp}`;
        };

        const kgEl = document.getElementById('hud-mass-kg');
        if (kgEl) kgEl.textContent = formatSci(mass_kg);

        const eJoulesEl = document.getElementById('hud-energy-joules');
        if (eJoulesEl) eJoulesEl.textContent = formatSci(energy_joules);

        // Stability & Binding Energy calculation (≈ 8 MeV per nucleon)
        const stabilityEl = document.getElementById('hud-stability');
        const bindingEl = document.getElementById('hud-binding-energy');
        let bindingEnergyJ = 0;

        if (pCount === 0 && nCount > 0) {
            stabilityEl.textContent = "Nêutrons Livres Decaindo";
            stabilityEl.className = "stability-warning unstable";
        } else if (pCount > 0) {
            // Approximation for binding energy: ~8 MeV per nucleon for stable ones
            const totalNucleons = pCount + nCount;
            // E_binding (Joules)
            bindingEnergyJ = (8 * totalNucleons) * MEV_TO_JOULES;

            // Very simplified stability curve (N/Z ratio)
            const ratio = (nCount / pCount);
            let isStable = true;

            if (pCount === 1) {
                isStable = (ratio <= 2); // H, D, T(unstable but close enough)
            } else {
                isStable = (ratio >= 0.8 && ratio <= 1.5);
            }

            if (pCount > 10) isStable = false; // Cap at max for demo

            if (isStable) {
                stabilityEl.textContent = "Núcleo Estável";
                stabilityEl.className = "stability-warning";
            } else {
                stabilityEl.textContent = "INSTÁVEL - Rádioativo";
                stabilityEl.className = "stability-warning unstable";

                // Nuclear Decay! (Eject particle if strongly unstable)
                if (Math.random() < 0.05 * globalEnergy) {
                    causeDecay();
                }
            }
        } else {
            stabilityEl.textContent = "Vazio Quântico";
            stabilityEl.className = "stability-warning";
        }

        if (bindingEl) bindingEl.textContent = formatSci(bindingEnergyJ);
    }
}

function causeDecay() {
    // Eject a random nucleon
    const nucleons = atomosParticles.filter(p => p.type === 'proton' || p.type === 'neutron');
    if (nucleons.length > 0) {
        // Pick random
        const p = nucleons[Math.floor(Math.random() * nucleons.length)];
        // Explosive velocity outwards
        p.velocity.add(p.position.clone().normalize().multiplyScalar(15));

        // Visual flash (could add a light)
        playSoundEffect('decay');
    }
}

function playSoundEffect(type) {
    // Placeholder for actual web audio api. Just relying on visuals for now, 
    // but leaving hook if user wants audio later.
}

let lastTime = performance.now();
let hudTimer = 0;

function animateAtomos() {
    if (!atomosIsActive) return;
    atomosAnimationID = requestAnimationFrame(animateAtomos);

    const now = performance.now();
    let dt = (now - lastTime) / 1000.0;
    if (dt > 0.1) dt = 0.1; // clamp dt to prevent physics explosions on lag
    lastTime = now;

    // Universe mode continuous generation
    if (universeMode && Math.random() < 0.02 * globalEnergy && atomosParticles.length < 50) {
        const types = ['proton', 'neutron', 'electron'];
        atomosAddParticle(types[Math.floor(Math.random() * types.length)]);
    }

    computePhysics(dt);

    // Update HUD 4 times a second
    hudTimer += dt;
    if (hudTimer > 0.25) {
        updateAtomosHUD();
        hudTimer = 0;
    }

    // Slowly rotate camera slowly for cinematic feel
    if (atomosCamera && atomosScene && !isDraggingAtom) {
        const timer = Date.now() * 0.0001;
        atomosCamera.position.x = Math.cos(timer) * 25;
        atomosCamera.position.z = Math.sin(timer) * 25;
        atomosCamera.lookAt(atomosScene.position);
    }

    if (atomosCamera && atomosScene) {
        atomosRenderer.render(atomosScene, atomosCamera);
    }

    // DEBUG HACK TO SCREEN
    let dbg = document.getElementById('debug-atomos');
    if (!dbg) {
        dbg = document.createElement('div');
        dbg.id = 'debug-atomos';
        dbg.style.position = 'absolute';
        dbg.style.top = '10px';
        dbg.style.left = '10px';
        dbg.style.color = '#fff';
        dbg.style.background = 'rgba(0,0,0,0.8)';
        dbg.style.zIndex = 9999;
        document.getElementById('atomos-container').appendChild(dbg);
    }
    if (atomosParticles.length > 0) {
        const p = atomosParticles[0];
        dbg.innerHTML = `P0: pos(${p.position.x.toFixed(2)}, ${p.position.y.toFixed(2)}, ${p.position.z.toFixed(2)}) vel(${p.velocity.x.toFixed(2)})`;
    } else {
        dbg.innerHTML = `P0: No particles.`;
    }
}

// --- Interaction / Dragging Logic ---
let isDraggingAtom = false;
let draggedParticle = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const dragIntersection = new THREE.Vector3();
const dragOffset = new THREE.Vector3();

function initAtomosInteraction(container) {
    container.addEventListener('mousedown', onAtomMouseDown, false);
    container.addEventListener('mousemove', onAtomMouseMove, false);
    container.addEventListener('mouseup', onAtomMouseUp, false);
    container.addEventListener('mouseleave', onAtomMouseUp, false);
}

function onAtomMouseDown(event) {
    event.preventDefault();
    const rect = atomosRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, atomosCamera);

    // Only raycast against sprites
    const sprites = atomosParticles.map(p => p.sprite);
    const intersects = raycaster.intersectObjects(sprites);

    if (intersects.length > 0) {
        // Grab the first particle hit (usually nucleon)
        draggedParticle = intersects[0].object.userData.particle;
        draggedParticle.isBeingDragged = true;
        isDraggingAtom = true;

        // Setup mathematical plane facing camera for dragging
        dragPlane.setFromNormalAndCoplanarPoint(
            atomosCamera.getWorldDirection(dragPlane.normal),
            draggedParticle.position
        );

        // Disable HUD click-through briefly
        document.getElementById('atomos-container').style.cursor = 'grabbing';

        const intersectPoint = raycaster.ray.intersectPlane(dragPlane, dragIntersection);
        if (intersectPoint) {
            dragOffset.copy(intersectPoint).sub(draggedParticle.position);
        }
    }
}

function onAtomMouseMove(event) {
    if (!isDraggingAtom || !draggedParticle) return;

    event.preventDefault();
    const rect = atomosRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

    const intersectPoint = raycaster.ray.intersectPlane(dragPlane, dragIntersection);
    if (intersectPoint) {
        // Move the grabbed particle
        const newPos = intersectPoint.clone().sub(dragOffset);
        draggedParticle.position.copy(newPos);
        draggedParticle.sprite.position.copy(newPos);

        // If grabbing a nucleon, gently pull the rest of the atom with it?
        // Simple version: it pulls nucleons strongly via the physics engine because they are close
        // We just move the single particle, and the strong nuclear force will drag the rest of the nucleus instantly.
    }
}

function onAtomMouseUp(event) {
    if (isDraggingAtom && draggedParticle) {
        draggedParticle.isBeingDragged = false;

        // Slingshot velocity based on last movement
        // (Just providing 0 velocity is fine, physics engine will re-engage)
        draggedParticle = null;
        isDraggingAtom = false;
        document.getElementById('atomos-container').style.cursor = 'default';
    }
}

// Hook into NeonOS window active state logic
// We need to check if the window is open to pause/resume
setInterval(() => {
    const win = document.getElementById('win-atomos');
    if (win) {
        const isOpen = win.classList.contains('active');

        // If it was just opened and not active, init it
        if (isOpen && !atomosScene) {
            initAtomos();
        }

        // Pause / Resume rendering
        if (isOpen && !atomosIsActive && atomosScene) {
            atomosIsActive = true;
            lastTime = performance.now();
            animateAtomos();
        } else if (!isOpen && atomosIsActive) {
            atomosIsActive = false;
            cancelAnimationFrame(atomosAnimationID);
        }
    }
}, 500);
