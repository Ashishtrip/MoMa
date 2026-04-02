// UIView Class - DOM Manipulation and rendering
export class UIView {
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
    
    /**
     * Renders transaction table rows from array
     */
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
                    <button class="btn btn-warning edit-btn" data-id="${t.id}" aria-label="Edit transaction">Edit</button>
                    <button class="btn btn-danger delete-btn" data-id="${t.id}" aria-label="Delete transaction">Delete</button>
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
    
    /**
     * Fills form with transaction data for editing
     */
    fillFormForEdit(t) {
        document.getElementById('transactionId').value = t.id;
        document.getElementById('amount').value = t.amount;
        document.getElementById('date').value = t.date;
        document.querySelector(`input[name="category"][value="${t.category}"]`).checked = true;
        this.updateSubCategoryDropdown(t.category);
        document.getElementById('subCategory').value = t.subCategory;
        document.getElementById('description').value = t.description;
    }
    
    /**
     * Updates sub-category dropdown based on selected category (for add/edit form)
     */
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
    
    /**
     * Gets current filter values from DOM
     */
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
    
    /**
     * NEW: Updates filter sub-category dropdown based on filter category
     * (for table filter UI enhancement)
     */
    updateFilterSubCategoryDropdown(category) {
        const select = document.getElementById('filterSubCategory');
        select.innerHTML = '<option value="all">All</option>';
        const cats = this.subCategories[category] || [];
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = this.capitalize(cat);
            select.appendChild(opt);
        });
    }
}
