// Validator Class - Form validation and error display utilities
export class Validator {
    /**
     * Validates transaction form data
     * @param {string|number} amount 
     * @param {string} date 
     * @param {string} category 
     * @param {string} subCategory 
     * @param {string} description 
     * @returns {Object} errors object, empty if valid
     */
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
    
    /**
     * Shows error on specific field
     */
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
    
    /**
     * Clears all form errors
     */
    static clearAllErrors() {
        ['amount', 'date', 'subCategory', 'description'].forEach(id => this.clearFieldError(id, id + 'Error'));
        document.querySelectorAll('input[name="category"]').forEach(r => r.classList.remove('error'));
        document.getElementById('categoryError').textContent = '';
    }
    
    /**
     * Shows error for category radio group
     */
    static showCategoryError(msg) {
        document.querySelectorAll('input[name="category"]').forEach(r => r.classList.add('error'));
        document.getElementById('categoryError').textContent = msg;
    }
}
