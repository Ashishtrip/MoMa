// Storage Utility Class - Handles localStorage persistence for transactions
export class Storage {
    static STORAGE_KEY = 'moma_transactions';
    
    /**
     * Saves transactions array to localStorage as JSON string.
     * @param {Array} transactions - Array of transaction JSON objects
     * @returns {boolean} true if saved successfully
     */
    static save(transactions) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    }
    
    /**
     * Loads transactions from localStorage, parses JSON, returns array.
     * @returns {Array} Array of parsed transaction objects or empty array on error/missing
     */
    static load() {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Storage load error:', e);
            return [];
        }
    }
}
