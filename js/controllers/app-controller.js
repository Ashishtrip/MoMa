// AppController Class - Main controller wiring models/views/events
export class AppController {
    constructor() {
        this.collection = new TransactionCollection();
        this.view = new UIView();
        this.isEditing = false;
        this.currentChartType = 'expense';
        this.init();
    }
    
    /**
     * Initializes app: loads data, binds events, renders
     */
    init() {
        this.collection.loadFromArray(Storage.load());
        this.setupEvents();
        this.view.setTodayDate();
        this.renderAll();
    }
    
    /**
     * Binds all event listeners for UI interactions
     */
    setupEvents() {
        document.getElementById('addTransactionBtn').onclick = () => this.showAddModal();
        document.querySelector('.close-btn').onclick = () => this.hideModal();
        window.onclick = e => { if (e.target.classList.contains('modal')) this.hideModal(); };
        document.getElementById('transactionForm').onsubmit = e => { e.preventDefault(); this.handleSubmit(); };
        
        // Category radio change for form
        document.querySelectorAll('input[name="category"]').forEach(r => {
            r.onchange = e => this.view.updateSubCategoryDropdown(e.target.value);
        });
        
        // Filter changes trigger re-render
        ['filterCategory', 'filterSubCategory', 'filterDateFrom', 'filterDateTo', 'sortBy'].forEach(id => {
            document.getElementById(id).onchange = () => this.renderAll();
        });
        
        // Dynamic filter subcat update (new for Step 5)
        document.getElementById('filterCategory').onchange = (e) => {
            this.view.updateFilterSubCategoryDropdown(e.target.value);
            document.getElementById('filterSubCategory').value = 'all'; // Reset subcat
        };
        
        document.getElementById('resetFiltersBtn').onclick = () => { 
            this.view.resetFilters(); 
            this.renderAll(); 
        };
        document.getElementById('exportCsvBtn').onclick = () => CSVExporter.export(this.collection.getAllTransactions());
        document.getElementById('expenseToggleBtn').onclick = () => this.switchChart('expense');
        document.getElementById('incomeToggleBtn').onclick = () => this.switchChart('income');
        
        // Table row actions (event delegation)
        document.getElementById('transactionList').onclick = e => {
            const id = parseInt(e.target.dataset.id);
            if (e.target.classList.contains('edit-btn')) this.handleEdit(id);
            if (e.target.classList.contains('delete-btn') && this.view.confirmDelete()) {
                this.deleteTransaction(id); // Enhanced in Step 3
            }
        };
        
        // Keyboard support for modal (Step 4 accessibility)
        document.addEventListener('keydown', (e) => {
            if (this.view.modal.style.display === 'block') {
                if (e.key === 'Escape') this.hideModal();
                if (e.key === 'Enter' && e.target.tagName === 'BUTTON') e.target.click();
            }
        });
    }
    
    showAddModal() { 
        this.isEditing = false; 
        this.view.clearForm(); 
        this.view.showModal(); 
    }
    
    hideModal() { 
        this.view.hideModal(); 
        this.isEditing = false; 
    }
    
    /**
     * Handles form submission (add or update)
     */
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
        
        if (this.isEditing && id) {
            this.collection.updateTransaction(+id, amount, date, category, subCategory, description);
        } else {
            this.collection.addTransaction(amount, date, category, subCategory, description);
        }
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
    
    /**
     * Deletes transaction (enhanced with undo toast in Step 3)
     */
    deleteTransaction(id) {
        const tx = this.collection.findById(id);
        if (tx && this.collection.deleteTransaction(id)) {
            Storage.save(this.collection.getAllTransactions().map(t => t.toJSON()));
            this.renderAll();
            this.showDeleteToast(tx); // New for Step 3
        }
    }
    
    /**
     * NEW for Step 3 UX: Shows delete confirmation toast with undo
     */
    showDeleteToast(deletedTx) {
        // Create toast if not exists
        let toast = document.getElementById('deleteToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'deleteToast';
            toast.className = 'toast';
            toast.innerHTML = `
                <span>Transaction deleted</span>
                <button id="undoDelete" class="btn btn-secondary" style="margin-left: 10px;">Undo</button>
                <span id="undoCountdown" style="margin-left: 10px;"></span>
            `;
            document.body.appendChild(toast);
            document.getElementById('undoDelete').onclick = () => this.undoDelete();
        }
        toast.style.display = 'flex';
        toast.dataset.deletedTx = JSON.stringify(deletedTx.toJSON());
        toast.dataset.timeout = '5000';
        this.startUndoCountdown();
    }
    
    /**
     * NEW: Undo last delete from toast queue
     */
    undoDelete() {
        const toast = document.getElementById('deleteToast');
        if (toast && toast.dataset.deletedTx) {
            const txData = JSON.parse(toast.dataset.deletedTx);
            const tx = Transaction.fromJSON(txData);
            this.collection.addTransaction(tx.amount, tx.date, tx.category, tx.subCategory, tx.description);
            Storage.save(this.collection.getAllTransactions().map(t => t.toJSON()));
            this.renderAll();
            toast.style.display = 'none';
        }
    }
    
    /**
     * Countdown for undo toast auto-hide (5s)
     */
    startUndoCountdown() {
        const toast = document.getElementById('deleteToast');
        let time = 5;
        const countdownEl = document.getElementById('undoCountdown');
        const interval = setInterval(() => {
            time--;
            countdownEl.textContent = `(${time}s)`;
            if (time <= 0) {
                clearInterval(interval);
                toast.style.display = 'none';
            }
        }, 1000);
        toast.dataset.intervalId = interval;
    }
    
    switchChart(type) {
        this.currentChartType = type;
        document.getElementById('expenseToggleBtn').classList.toggle('active', type === 'expense');
        document.getElementById('incomeToggleBtn').classList.toggle('active', type === 'income');
        const data = type === 'expense' ? this.collection.getExpensesByCategory() : this.collection.getIncomeByCategory();
        if (type === 'expense') this.view.renderExpenseChart(data);
        else this.view.renderIncomeChart(data);
    }
    
    /**
     * Full re-render: apply filters, update UI/charts/summary
     */
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
