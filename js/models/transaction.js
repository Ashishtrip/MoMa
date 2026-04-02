// Transaction Model Class - Single transaction entity with methods
export class Transaction {
    /**
     * Constructor for new transaction
     * @param {string|number} amount - Transaction amount
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} category - 'income' or 'expense'
     * @param {string} subCategory - Specific subcategory
     * @param {string} description - Optional description (max 100 chars)
     */
    constructor(amount, date, category, subCategory, description) {
        this.id = Date.now() + Math.random() * 1000 | 0; // Unique ID using timestamp + random
        this.amount = parseFloat(amount);
        this.date = date;
        this.category = category;
        this.subCategory = subCategory;
        this.description = description || '';
    }
    
    isIncome() { return this.category === 'income'; }
    isExpense() { return this.category === 'expense'; }
    
    /**
     * Updates transaction properties (used for edit)
     */
    update(amount, date, category, subCategory, description) {
        this.amount = parseFloat(amount);
        this.date = date;
        this.category = category;
        this.subCategory = subCategory;
        this.description = description || '';
    }
    
    toJSON() {
        return { id: this.id, amount: this.amount, date: this.date, category: this.category, subCategory: this.subCategory, description: this.description };
    }
    
    static fromJSON(json) {
        const t = new Transaction(json.amount, json.date, json.category, json.subCategory, json.description);
        t.id = json.id;
        return t;
    }
}
