// Storage Utility Class
class Storage {
    static STORAGE_KEY = 'moma_transactions';
    static save(transactions) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    }
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

// Transaction Model Class
class Transaction {
    constructor(amount, date, category, subCategory, description) {
        this.id = Date.now() + Math.random() * 1000 | 0;
        this.amount = parseFloat(amount);
        this.date = date;
        this.category = category;
        this.subCategory = subCategory;
        this.description = description || '';
    }
    isIncome() { return this.category === 'income'; }
    isExpense() { return this.category === 'expense'; }
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

// TransactionCollection Model
class TransactionCollection {
    constructor() { this.transactions = []; }
    addTransaction(amount, date, category, subCategory, description) {
        const t = new Transaction(amount, date, category, subCategory, description);
        this.transactions.push(t);
        return t;
    }
    getAllTransactions() { return this.transactions; }
    findById(id) { return this.transactions.find(t => t.id === id); }
    updateTransaction(id, amount, date, category, subCategory, description) {
        const t = this.findById(id);
        if (t) { t.update(amount, date, category, subCategory, description); return true; }
        return false;
    }
    deleteTransaction(id) {
        const i = this.transactions.findIndex(t => t.id === id);
        if (i > -1) { this.transactions.splice(i, 1); return true; }
        return false;
    }
    getTotalIncome() {
        return this.transactions.reduce((sum, t) => t.isIncome() ? sum + t.amount : sum, 0);
    }
    getTotalExpenses() {
        return this.transactions.reduce((sum, t) => t.isExpense() ? sum + t.amount : sum, 0);
    }
    getNetBalance() { return this.getTotalIncome() - this.getTotalExpenses(); }
    filterTransactions(category, subCategory, dateFrom, dateTo) {
        let filtered = [...this.transactions];
        if (category !== 'all') filtered = filtered.filter(t => t.category === category);
        if (subCategory !== 'all') filtered = filtered.filter(t => t.subCategory === subCategory);
        if (dateFrom) filtered = filtered.filter(t => t.date >= dateFrom);
        if (dateTo) filtered = filtered.filter(t => t.date <= dateTo);
        return filtered;
    }
    sortTransactions(transactions, sortBy) {
        const sorted = [...transactions];
        switch (sortBy) {
            case 'date_asc': sorted.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
            case 'amount_desc': sorted.sort((a, b) => b.amount - a.amount); break;
            case 'amount_asc': sorted.sort((a, b) => a.amount - b.amount); break;
            default: sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return sorted;
    }
    getExpensesByCategory() {
        const cat = {};
        this.transactions.filter(t => t.isExpense()).forEach(t => {
            cat[t.subCategory] = (cat[t.subCategory] || 0) + t.amount;
        });
        return cat;
    }
    getIncomeByCategory() {
        const cat = {};
        this.transactions.filter(t => t.isIncome()).forEach(t => {
            cat[t.subCategory] = (cat[t.subCategory] || 0) + t.amount;
        });
        return cat;
    }
    loadFromArray(array) {
        this.transactions = array.map(item => Transaction.fromJSON(item));
    }
}

// Validator Class
class Validator {
    static validateForm(amount, date, category, subCategory, description) {
        const errors = {};
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) errors.amount = 'Amount must be > 0';
        const d = new Date(date + 'T00:00');
        if (!date || d > new Date().setHours(0,0,0,0)) errors.date = 'Date cannot be future';
        if (!category) errors.category = 'Select category';
        if (!subCategory) errors.subCategory = 'Select sub-category';
        if (description && description.length > 100) errors.description = 'Max 100 chars';
        return errors;
    }
    static showFieldError(fieldId, errorId, msg) {
        const input = document.getElementById(fieldId), err = document.getElementById(errorId);
        if (input) input.classList.add('error');
        if (err) err.textContent = msg;
    }
    static clearFieldError(fieldId, errorId) {
        const input = document.getElementById(fieldId), err = document.getElementById(errorId);
        if (input) input.classList.remove('error');
        if (err) err.textContent = '';
    }
    static clearAllErrors() {
        ['amount', 'date', 'subCategory', 'description'].forEach(id => this.clearFieldError(id, id + 'Error'));
        document.querySelectorAll('input[name="category"]').forEach(r => r.classList.remove('error'));
        document.getElementById('categoryError').textContent = '';
    }
    static showCategoryError(msg) {
        document.querySelectorAll('input[name="category"]').forEach(r => r.classList.add('error'));
        document.getElementById('categoryError').textContent = msg;
    }
}

// CSVExporter Class
class CSVExporter {
    static export(transactions) {
        if (!transactions.length) return alert('No transactions to export');
        try {
            const headers = ['Date', 'Category', 'Sub-Category', 'Description', 'Amount'];
            const rows = transactions.map(t => [
                t.date, t.category, t.subCategory, t.description || '', t.isExpense() ? -t.amount : t.amount
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `moma-transactions-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (e) {
            console.error('CSV export error:', e);
            alert('Failed to export CSV file');
        }
    }
}

// Canvas ChartManager Class (Pure Canvas, no libs)
class ChartManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.centerX = 200;
        this.centerY = 200;
        this.radius = 180;
        this.currentChartType = 'expense';
    }
    capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : ''; }
    getColor(value, minV, maxV) {
        if (minV === maxV) return '#808080';
        const norm = (value - minV) / (maxV - minV);
        const grey = Math.round(224 - norm * 198);
        const hex = grey.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`;
    }
    drawPie(data) {
        if (!this.ctx || !data || !Object.keys(data).length) return;
        const keys = Object.keys(data), values = Object.values(data);
        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) return;
        const minV = Math.min(...values), maxV = Math.max(...values);
        let startAngle = -Math.PI / 2;
        this.ctx.clearRect(0, 0, 400, 400);
        keys.forEach((key, i) => {
            const sliceAngle = (values[i] / total) * 2 * Math.PI;
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, startAngle + sliceAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = this.getColor(values[i], minV, maxV);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            startAngle += sliceAngle;
        });
        this.drawLegend(keys, values);
    }
    drawLegend(keys, values) {
        const bgColor = '#000000';
        const textColor = '#ffffff';
        const borderColor = '#ffffff';
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(250, 20, 140, keys.length * 25 + 10);
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(250, 20, 140, keys.length * 25 + 10);
        keys.forEach((key, i) => {
            const minV = Math.min(...values), maxV = Math.max(...values);
            const color = this.getColor(values[i], minV, maxV);
            this.ctx.fillStyle = color;
            this.ctx.fillRect(255, 25 + i * 25, 15, 15);
            this.ctx.fillStyle = textColor;
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(`${this.capitalize(key)}: $${values[i].toFixed(2)}`, 275, 36 + i * 25);
        });
    }
    updateExpense(data) { this.currentChartType = 'expense'; this.drawPie(data); }
    updateIncome(data) { this.currentChartType = 'income'; this.drawPie(data); }
}

// UIView Class (DOM Manipulation)
class UIView {
    constructor() {
        this.transactionList = document.getElementById('transactionList');
        this.noTransactions = document.getElementById('noTransactions');
        this.totalIncomeEl = document.getElementById('totalIncome');
        this.totalExpenseEl = document.getElementById('totalExpense');
        this.netBalanceEl = document.getElementById('netBalance');
        this.modal = document.getElementById('transactionModal');
        this.chart = new ChartManager('expenseChart');
        this.subCategories = {
            income: ['salary', 'allowances', 'bonus', 'petty_cash'],
            expense: ['rent', 'food', 'shopping', 'entertainment']
        };
    }
    renderTransactions(transactions) {
        this.transactionList.innerHTML = '';
        if (!transactions.length) {
            this.noTransactions.style.display = 'block';
            return;
        }
        this.noTransactions.style.display = 'none';
        transactions.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(t.date)}</td>
                <td>${this.capitalize(t.category)}</td>
                <td>${this.capitalize(t.subCategory)}</td>
                <td>${t.description || '-'}</td>
                <td class="${t.isIncome() ? 'amount-income' : 'amount-expense'}">${t.isIncome() ? '+' : '-'}$${t.amount.toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning edit-btn" data-id="${t.id}">Edit</button>
                    <button class="btn btn-danger delete-btn" data-id="${t.id}">Delete</button>
                </td>`;
            this.transactionList.appendChild(row);
        });
    }
    renderSummary(income, expense, balance) {
        this.totalIncomeEl.textContent = `$${income.toFixed(2)}`;
        this.totalExpenseEl.textContent = `$${expense.toFixed(2)}`;
        this.netBalanceEl.textContent = `$${balance.toFixed(2)}`;
        this.netBalanceEl.style.color = balance < 0 ? '#ff6b6b' : '#90EE90';
    }
    renderExpenseChart(data) { this.chart.updateExpense(data); }
    renderIncomeChart(data) { this.chart.updateIncome(data); }
    showModal(isEdit = false) {
        this.modal.style.display = 'block';
        document.getElementById('modalTitle').textContent = isEdit ? 'Edit Transaction' : 'Add Transaction';
        document.getElementById('submitBtn').textContent = isEdit ? 'Update Transaction' : 'Add Transaction';
    }
    hideModal() { this.modal.style.display = 'none'; }
    clearForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionId').value = '';
        Validator.clearAllErrors();
        this.updateSubCategoryDropdown('');
    }
    fillFormForEdit(t) {
        document.getElementById('transactionId').value = t.id;
        document.getElementById('amount').value = t.amount;
        document.getElementById('date').value = t.date;
        document.querySelector(`input[name="category"][value="${t.category}"]`).checked = true;
        this.updateSubCategoryDropdown(t.category);
        document.getElementById('subCategory').value = t.subCategory;
        document.getElementById('description').value = t.description;
    }
    updateSubCategoryDropdown(category) {
        const select = document.getElementById('subCategory');
        select.innerHTML = '<option value="">Select Sub-Category</option>';
        const cats = this.subCategories[category] || [];
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = this.capitalize(cat);
            select.appendChild(opt);
        });
    }
    getFilterValues() {
        return {
            category: document.getElementById('filterCategory').value,
            subCategory: document.getElementById('filterSubCategory').value,
            dateFrom: document.getElementById('filterDateFrom').value,
            dateTo: document.getElementById('filterDateTo').value,
            sortBy: document.getElementById('sortBy').value
        };
    }
    resetFilters() {
        document.getElementById('filterCategory').value = 'all';
        document.getElementById('filterSubCategory').value = 'all';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('sortBy').value = 'date_desc';
    }
    confirmDelete() { return confirm('Delete this transaction?'); }
    formatDate(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : ''; }
    setTodayDate() {
        const today = new Date();
        document.getElementById('date').value = today.toISOString().split('T')[0];
    }
}

// AppController (Main)
class AppController {
    constructor() {
        this.collection = new TransactionCollection();
        this.view = new UIView();
        this.isEditing = false;
        this.currentChartType = 'expense';
        this.init();
    }
    init() {
        this.collection.loadFromArray(Storage.load());
        this.setupEvents();
        this.view.setTodayDate();
        this.renderAll();
    }
    setupEvents() {
        document.getElementById('addTransactionBtn').onclick = () => this.showAddModal();
        document.querySelector('.close-btn').onclick = () => this.hideModal();
        window.onclick = e => { if (e.target.classList.contains('modal')) this.hideModal(); };
        document.getElementById('transactionForm').onsubmit = e => { e.preventDefault(); this.handleSubmit(); };
        document.querySelectorAll('input[name="category"]').forEach(r => {
            r.onchange = e => this.view.updateSubCategoryDropdown(e.target.value);
        });
        ['filterCategory', 'filterSubCategory', 'filterDateFrom', 'filterDateTo', 'sortBy'].forEach(id => {
            document.getElementById(id).onchange = () => this.renderAll();
        });
        document.getElementById('resetFiltersBtn').onclick = () => { this.view.resetFilters(); this.renderAll(); };
        document.getElementById('exportCsvBtn').onclick = () => CSVExporter.export(this.collection.getAllTransactions());
        document.getElementById('expenseToggleBtn').onclick = () => this.switchChart('expense');
        document.getElementById('incomeToggleBtn').onclick = () => this.switchChart('income');
        document.getElementById('transactionList').onclick = e => {
            const id = parseInt(e.target.dataset.id);
            if (e.target.classList.contains('edit-btn')) this.handleEdit(id);
            if (e.target.classList.contains('delete-btn') && this.view.confirmDelete()) this.deleteTransaction(id);
        };
    }
    showAddModal() { this.isEditing = false; this.view.clearForm(); this.view.showModal(); }
    hideModal() { this.view.hideModal(); this.isEditing = false; }
    handleSubmit() {
        const id = document.getElementById('transactionId').value;
        const amount = document.getElementById('amount').value;
        const date = document.getElementById('date').value;
        const category = document.querySelector('input[name="category"]:checked')?.value || '';
        const subCategory = document.getElementById('subCategory').value;
        const description = document.getElementById('description').value;
        const errors = Validator.validateForm(amount, date, category, subCategory, description);
        if (Object.keys(errors).length) {
            Object.keys(errors).forEach(k => {
                if (k === 'category') Validator.showCategoryError(errors[k]);
                else Validator.showFieldError(k, k + 'Error', errors[k]);
            });
            return;
        }
        Validator.clearAllErrors();
        if (this.isEditing && id) this.collection.updateTransaction(+id, amount, date, category, subCategory, description);
        else this.collection.addTransaction(amount, date, category, subCategory, description);
        Storage.save(this.collection.getAllTransactions().map(t => t.toJSON()));
        this.renderAll();
        this.hideModal();
    }
    handleEdit(id) {
        const t = this.collection.findById(id);
        if (t) {
            this.isEditing = true;
            this.view.fillFormForEdit(t);
            this.view.showModal(true);
        }
    }
    deleteTransaction(id) {
        if (this.collection.deleteTransaction(id)) {
            Storage.save(this.collection.getAllTransactions().map(t => t.toJSON()));
            this.renderAll();
        }
    }
    switchChart(type) {
        this.currentChartType = type;
        document.getElementById('expenseToggleBtn').classList.toggle('active', type === 'expense');
        document.getElementById('incomeToggleBtn').classList.toggle('active', type === 'income');
        const data = type === 'expense' ? this.collection.getExpensesByCategory() : this.collection.getIncomeByCategory();
        if (type === 'expense') this.view.renderExpenseChart(data);
        else this.view.renderIncomeChart(data);
    }
    renderAll() {
        const filters = this.view.getFilterValues();
        let txs = this.collection.filterTransactions(filters.category, filters.subCategory, filters.dateFrom, filters.dateTo);
        txs = this.collection.sortTransactions(txs, filters.sortBy);
        this.view.renderTransactions(txs);
        this.view.renderSummary(
            this.collection.getTotalIncome(),
            this.collection.getTotalExpenses(),
            this.collection.getNetBalance()
        );
        this.toggleChartVisibility();
        const data = this.currentChartType === 'expense' ?
            this.collection.getExpensesByCategory() : this.collection.getIncomeByCategory();
        if (this.currentChartType === 'expense') this.view.renderExpenseChart(data);
        else this.view.renderIncomeChart(data);
    }
    toggleChartVisibility() {
        const chartSection = document.querySelector('.chart-section');
        const totalIncome = this.collection.getTotalIncome();
        const totalExpenses = this.collection.getTotalExpenses();
        if (totalIncome > 0 || totalExpenses > 0) {
            chartSection.classList.add('active');
        } else {
            chartSection.classList.remove('active');
        }
    }
}

// Initialize App
document.addEventListener
('DOMContentLoaded', () => 
        {
    new AppController();
        }
);

            constructor() 
            {
                this.transactionList = document.getElementById('transactionList');
                this.noTransactions = document.getElementById('noTransactions');
                this.totalIncomeEl = document.getElementById('totalIncome');
                this.totalExpenseEl = document.getElementById('totalExpense');
                this.netBalanceEl = document.getElementById('netBalance');
                this.modal = document.getElementById('transactionModal');
                this.chart = new ChartManager('expenseChart');
                this.subCategories = {
                    income: ['salary', 'allowances', 'bonus', 'petty_cash'],
                    expense: ['rent', 'food', 'shopping', 'entertainment']
                };
            }
            renderTransactions(transactions) 
            {
                this.transactionList.innerHTML = '';
                if (!transactions.length) {
                    this.noTransactions.style.display = 'block';
                    return;
                }
                this.noTransactions.style.display = 'none';
                transactions.forEach(t => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${this.formatDate(t.date)}</td>
                        <td>${this.capitalize(t.category)}</td>
                        <td>${this.capitalize(t.subCategory)}</td>
                        <td>${t.description || '-'}</td>
                        <td class="${t.isIncome() ? 'amount-income' : 'amount-expense'}">${t.isIncome() ? '+' : '-'}$${t.amount.toFixed(2)}</td>
                        <td class="action-buttons">
                            <button class="btn btn-warning edit-btn" data-id="${t.id}">Edit</button>
                            <button class="btn btn-danger delete-btn" data-id="${t.id}">Delete</button>
                        </td>`;
                    this.transactionList.appendChild(row);
                });
            }
            renderSummary(income, expense, balance) 
            {
                this.totalIncomeEl.textContent = `$${income.toFixed(2)}`;
                this.totalExpenseEl.textContent = `$${expense.toFixed(2)}`;
                this.netBalanceEl.textContent = `$${balance.toFixed(2)}`;
                this.netBalanceEl.style.color = balance < 0 ? '#ff6b6b' : '#90EE90';
            }
            renderExpenseChart(data) 
            { this.chart.updateExpense(data); }
            renderIncomeChart(data) 
            { this.chart.updateIncome(data); }
            showModal(isEdit = false) 
            {
                this.modal.style.display = 'block';
                document.getElementById('modalTitle').textContent = isEdit ? 'Edit Transaction' : 'Add Transaction';
                document.getElementById('submitBtn').textContent = isEdit ? 'Update Transaction' : 'Add Transaction';
            }
            hideModal() 
            { this.modal.style.display = 'none'; }
            clearForm() 
            {
                document.getElementById('transactionForm').reset();
                document.getElementById('transactionId').value = '';
                Validator.clearAllErrors();
                this.updateSubCategoryDropdown('');
            }
            fillFormForEdit(t) 
            {
                document.getElementById('transactionId').value = t.id;
                document.getElementById('amount').value = t.amount;
                document.getElementById('date').value = t.date;
                document.querySelector(`input[name="category"][value="${t.category}"]`).checked = true;
                this.updateSubCategoryDropdown(t.category);
                document.getElementById('subCategory').value = t.subCategory;
                document.getElementById('description').value = t.description;
            }
            updateSubCategoryDropdown(category) 
            {
                const select = document.getElementById('subCategory');
                select.innerHTML = '<option value="">Select Sub-Category</option>';
                const cats = this.subCategories[category] || [];
                cats.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = this.capitalize(cat);
                    select.appendChild(opt);
                });
            }
            getFilterValues() 
            {
                return {
                    category: document.getElementById('filterCategory').value,
                    subCategory: document.getElementById('filterSubCategory').value,
                    dateFrom: document.getElementById('filterDateFrom').value,
                    dateTo: document.getElementById('filterDateTo').value,
                    sortBy: document.getElementById('sortBy').value
                };
            }
            resetFilters() 
            {
                document.getElementById('filterCategory').value = 'all';
                document.getElementById('filterSubCategory').value = 'all';
                document.getElementById('filterDateFrom').value = '';
                document.getElementById('filterDateTo').value = '';
                document.getElementById('sortBy').value = 'date_desc';
            }
            confirmDelete() 
            { return confirm('Delete this transaction?'); }
            formatDate(d) 
            { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
            capitalize(str) 
            { return str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : ''; }
            setTodayDate() 
            {
                const today = new Date();
                document.getElementById('date').value = today.toISOString().split('T')[0];
            }

        // AppController (Main)
        class AppController {
            constructor() {
                this.collection = new TransactionCollection();
                this.view = new UIView();
                this.isEditing = false;
                this.currentChartType = 'expense';
                this.init();
            }
            init() {
                this.collection.loadFromArray(Storage.load());
                this.setupEvents();
                this.view.setTodayDate();
                this.renderAll();
            }
            setupEvents() {
                // Add btn
                document.getElementById('addTransactionBtn').onclick = () => this.showAddModal();
                // Modal close
                document.querySelector('.close-btn').onclick = () => this.hideModal();
                window.onclick = e => { if (e.target.classList.contains('modal')) this.hideModal(); };
                // Form submit
                document.getElementById('transactionForm').onsubmit = e => { e.preventDefault(); this.handleSubmit(); };
                // Category change
                document.querySelectorAll('input[name="category"]').forEach(r => {
                    r.onchange = e => this.view.updateSubCategoryDropdown(e.target.value);
                });
                // Filters
                ['filterCategory', 'filterSubCategory', 'filterDateFrom', 'filterDateTo', 'sortBy'].forEach(id => {
                    document.getElementById(id).onchange = () => this.renderAll();
                });
                document.getElementById('resetFiltersBtn').onclick = () => this.view.resetFilters() || this.renderAll();
                document.getElementById('exportCsvBtn').onclick = () => CSVExporter.export(this.collection.getAllTransactions());
                // Chart toggle
                document.getElementById('expenseToggleBtn').onclick = () => this.switchChart('expense');
                document.getElementById('incomeToggleBtn').onclick = () => this.switchChart('income');
                // Table delegation
                document.getElementById('transactionList').onclick = e => {
                    const id = parseInt(e.target.dataset.id);
                    if (e.target.classList.contains('edit-btn')) this.handleEdit(id);
                    if (e.target.classList.contains('delete-btn') && this.view.confirmDelete()) this.deleteTransaction(id);
                };
            }
            showAddModal() { this.isEditing = false; this.view.clearForm(); this.view.showModal(); }
            hideModal() { this.view.hideModal(); this.isEditing = false; }
            handleSubmit() {
                const id = document.getElementById('transactionId').value;
                const amount = document.getElementById('amount').value;
                const date = document.getElementById('date').value;
                const category = document.querySelector('input[name="category"]:checked')?.value || '';
                const subCategory = document.getElementById('subCategory').value;
                const description = document.getElementById('description').value;
                const errors = Validator.validateForm(amount, date, category, subCategory, description);
                if (Object.keys(errors).length) {
                    Object.keys(errors).forEach(k => {
                        if (k === 'category') Validator.showCategoryError(errors[k]);
                        else Validator.showFieldError(k, k + 'Error', errors[k]);
                    });
                    return;
                }
                Validator.clearAllErrors();
                if (this.isEditing && id) this.collection.updateTransaction(+id, amount, date, category, subCategory, description);
                else this.collection.addTransaction(amount, date, category, subCategory, description);
                Storage.save(this.collection.getAllTransactions().map(t => t.toJSON()));
                this.renderAll();
                this.hideModal();
            }
            handleEdit(id) {
                const t = this.collection.findById(id);
                if (t) {
                    this.isEditing = true;
                    this.view.fillFormForEdit(t);
                    this.view.showModal(true);
                }
            }
            deleteTransaction(id) {
                if (this.collection.deleteTransaction(id)) {
                    Storage.save(this.collection.getAllTransactions().map(t => t.toJSON()));
                    this.renderAll();
                }
            }
            switchChart(type) {
                this.currentChartType = type;
                document.getElementById('expenseToggleBtn').classList.toggle('active', type === 'expense');
                document.getElementById('incomeToggleBtn').classList.toggle('active', type === 'income');
                const data = type === 'expense' ? this.collection.getExpensesByCategory() : this.collection.getIncomeByCategory();
                if (type === 'expense') this.view.renderExpenseChart(data);
                else this.view.renderIncomeChart(data);
            }
            renderAll() {
                const filters = this.view.getFilterValues();
                let txs = this.collection.filterTransactions(filters.category, filters.subCategory, filters.dateFrom, filters.dateTo);
                txs = this.collection.sortTransactions(txs, filters.sortBy);
                this.view.renderTransactions(txs);
                const allTxs = this.collection.getAllTransactions();
                this.view.renderSummary(
                    this.collection.getTotalIncome(),
                    this.collection.getTotalExpenses(),
                    this.collection.getNetBalance()
                );
                this.toggleChartVisibility();
                const data = this.currentChartType === 'expense' ?
                    this.collection.getExpensesByCategory() : this.collection.getIncomeByCategory();
                if (this.currentChartType === 'expense') this.view.renderExpenseChart(data);
                else this.view.renderIncomeChart(data);
            }
            toggleChartVisibility() {
                const chartSection = document.querySelector('.chart-section');
                const totalIncome = this.collection.getTotalIncome();
                const totalExpenses = this.collection.getTotalExpenses();
                if (totalIncome > 0 || totalExpenses > 0) {
                    chartSection.classList.add('active');
                } else {
                    chartSection.classList.remove('active');
                }
            }
        }

        // Initialize App
        document.addEventListener('DOMContentLoaded', () => {
            new AppController();
        });