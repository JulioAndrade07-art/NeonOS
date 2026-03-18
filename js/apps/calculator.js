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
        const result = new Function('return ' + expression)();
        calcCurrentInput = Number.isFinite(result) ? String(result) : 'Erro';
    } catch (e) {
        calcCurrentInput = 'Erro';
    }
    calcShouldResetDisplay = true;
    calcUpdateDisplay();
    calcAddToHistory(expression, calcCurrentInput);
}

function calcAddToHistory(expression, result) {
    const list = document.getElementById('calc-historyList');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
        <div class="hist-exp">${expression}</div>
        <div class="hist-res">${result}</div>
    `;
    list.prepend(div);
}

document.addEventListener('keydown', (event) => {
    const calcWin = document.getElementById('win-calc');
    if (calcWin && calcWin.classList.contains('active') && window.currentActiveWindowId === 'win-calc') {
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

// Exports to window so HTML onClick works (Since we are splitting scripts without transpiler)
window.calcAppendNumber = calcAppendNumber;
window.calcAppendOperator = calcAppendOperator;
window.calcClearDisplay = calcClearDisplay;
window.calcDeleteLast = calcDeleteLast;
window.calcCalculate = calcCalculate;
window.calcToggleHistory = () => document.getElementById('calc-historyPanel')?.classList.toggle('active');
window.calcClearHistory = () => { const list = document.getElementById('calc-historyList'); if (list) list.innerHTML = ''; };
