// --- CURRENCY CONVERTER APP LOGIC ---

const CurrencyApp = {
    apiUrl: 'https://open.er-api.com/v6/latest/USD',
    cacheKey: 'neon_currency_rates',
    cacheDuration: 3600000,

    elements: {
        amount: null, from: null, to: null, result: null,
        status: null, statusText: null, rateInfo: null, swapBtn: null
    },

    rates: {},

    init: function () {
        this.elements.amount = document.getElementById('curr-amount');
        this.elements.from = document.getElementById('curr-from');
        this.elements.to = document.getElementById('curr-to');
        this.elements.result = document.getElementById('curr-result');
        this.elements.status = document.getElementById('curr-status');
        this.elements.statusText = document.getElementById('curr-status-text');
        this.elements.rateInfo = document.getElementById('curr-rate-info');
        this.elements.swapBtn = document.getElementById('curr-swap-btn');

        if (!this.elements.amount) return;

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

        this.loadRates();
    },

    loadRates: async function (force = false) {
        this.updateStatus('loading', 'Atualizando taxas...');
        const cached = window.StorageManager.load(this.cacheKey);

        if (!force && cached) {
            const now = Date.now();
            if (now - cached.timestamp < this.cacheDuration) {
                this.rates = cached.rates;
                this.updateStatus('success');
                this.calculate();
                return;
            }
        }

        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            if (data.result === 'success') {
                this.rates = data.rates;
                window.StorageManager.save(this.cacheKey, { timestamp: Date.now(), rates: this.rates });
                this.updateStatus('success');
                this.calculate();
            } else {
                throw new Error('API Error Data');
            }
        } catch (e) {
            this.updateStatus('error', 'Erro de conexão');
            if (cached) {
                this.rates = cached.rates;
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

        const rateFrom = this.rates[from];
        const rateTo = this.rates[to];

        if (!rateFrom || !rateTo) {
            this.elements.result.textContent = 'Erro moeda';
            return;
        }

        const result = (amount / rateFrom) * rateTo;
        const currencySym = { 'BRL': 'R$', 'USD': '$', 'EUR': '€', 'JPY': '¥', 'GBP': '£' };
        const sym = currencySym[to] || to;

        this.elements.result.textContent = `${sym} ${result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const oneUnitRate = (1 / rateFrom) * rateTo;
        this.elements.rateInfo.textContent = `1 ${from} = ${oneUnitRate.toFixed(4)} ${to}`;
    },

    updateStatus: function (state, text) {
        if (this.elements.status) {
            this.elements.status.className = 'status-indicator';
            if (state === 'loading') this.elements.status.classList.add('status-loading');
            if (state === 'success') this.elements.status.classList.add('status-success');
            if (state === 'error') this.elements.status.classList.add('status-error');
            this.elements.statusText.textContent = text;
        }
    }
};

window.currRefreshParams = () => CurrencyApp.loadRates(true);

setTimeout(() => CurrencyApp.init(), 500);
