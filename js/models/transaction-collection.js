// TransactionCollection Model - Manages collection of transactions (CRUD, filter, sort, stats)
import { Transaction } from './transaction.js';

export class TransactionCollection {
    constructor() { 
        this.transactions = []; 
    }
    
    /**
     * Adds new transaction to collection
     * @returns {Transaction} The added transaction instance
     */
    addTransaction(amount, date, category, subCategory, description) {
        const t = new Transaction(amount, date, category, subCategory, description);
        this.transactions.push(t);
        return t;
    }
    
    getAllTransactions() { return this.transactions; }
    
    /**
     * Finds transaction by ID
     */
    findById(id) { return this.transactions.find(t => t.id === id); }
    
    /**
     * Updates existing transaction by ID
     * @returns {boolean} true if updated
     */
    updateTransaction(id, amount, date, category, subCategory, description) {
        const t = this.findById(id);
        if (t) { 
            t.update(amount, date, category, subCategory, description); 
            return true; 
        }
        return false;
    }
    
    /**
     * Deletes transaction by ID
     * @returns {boolean} true if deleted
     */
    deleteTransaction(id) {
        const i = this.transactions.findIndex(t => t.id === id);
        if (i > -1) { 
            this.transactions.splice(i, 1); 
            return true; 
        }
        return false;
    }
    
    getTotalIncome() {
        // Sum amounts where category === 'income'
        return this.transactions.reduce((sum, t) => t.isIncome() ? sum + t.amount : sum, 0);
    }
    
    getTotalExpenses() {
        // Sum amounts where category === 'expense'
        return this.transactions.reduce((sum, t) => t.isExpense() ? sum + t.amount : sum, 0);
    }
    
    getNetBalance() { return this.getTotalIncome() - this.getTotalExpenses(); }
    
    /**
     * Filters transactions by criteria. 'all' skips filter.
     * @param {string} category 
     * @param {string} subCategory
     * @param {string} dateFrom 
     * @param {string} dateTo
     * @returns {Array<Transaction>} Filtered transactions
     */
    filterTransactions(category, subCategory, dateFrom, dateTo) {
        let filtered = [...this.transactions];
        if (category !== 'all') filtered = filtered.filter(t => t.category === category);
        if (subCategory !== 'all') filtered = filtered.filter(t => t.subCategory === subCategory);
        if (dateFrom) filtered = filtered.filter(t => t.date >= dateFrom);
        if (dateTo) filtered = filtered.filter(t => t.date <= dateTo);
        return filtered;
    }
    
    /**
     * Sorts transactions array by criteria
     */
    sortTransactions(transactions, sortBy) {
        const sorted = [...transactions];
        switch (sortBy) {
            case 'date Asc': sorted.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
            case 'amount_desc': sorted.sort((a, b) => b.amount - a.amount); break;
            case 'amount_asc': sorted.sort((a, b) => a.amount - b.amount); break;
            default: sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return sorted;
    }
    
    /**
     * Aggregates expenses by subCategory for pie chart
     * @returns {Object} {subCategory: totalAmount}
     */
    getExpensesByCategory() {
        const cat = {};
        this.transactions.filter(t => t.isExpense()).forEach(t => {
            cat[t.subCategory] = (cat[t.subCategory] || 0) + t.amount;
        });
        return cat;
    }
    
    /**
     * Aggregates income by subCategory for pie chart
     */
    getIncomeByCategory() {
        const cat = {};
        this.transactions.filter(t => t.isIncome()).forEach(t => {
            cat[t.subCategory] = (cat[t.subCategory] || 0) + t.amount;
        });
        return cat;
    }
    
    /**
     * Loads collection from JSON array from storage
     */
    loadFromArray(array) {
        this.transactions = array.map(item => Transaction.fromJSON(item));
    }
}
