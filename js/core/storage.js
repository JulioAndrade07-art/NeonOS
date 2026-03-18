// --- STORAGE MANAGEMENT LOGIC ---
const StorageManager = {
    save: function (key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    },
    load: function (key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage', e);
            return defaultValue;
        }
    },
    remove: function (key) {
        localStorage.removeItem(key);
    }
};

window.StorageManager = StorageManager;
