# Money Manager App - Project Status

## COMPLETED

### Phase 1: Project Structure Setup 

 `index.html` - Main HTML structure
 `css/styles.css` - Main stylesheet
 `js/app.js` - Main application entry point
 `js/models/Transaction.js` - Transaction class (Model)
 `js/models/TransactionCollection.js` - Collection class for managing transactions
 `js/views/UIView.js` - View class for DOM manipulation
 `js/controllers/AppController.js` - Controller for business logic
 `js/utils/Storage.js` - localStorage utility
 `js/utils/Validator.js` - Form validation utility
 `js/utils/ChartManager.js` - Chart.js integration for bonus feature
 `js/utils/CSVExporter.js` - CSV export utility

### Phase 2: HTML Structure 

 Header with app title and add transaction button
 Financial Summary Section (Total Income, Total Expenses, Net Balance)
 Filter & Sort Controls Section
 Transaction History Table
 Transaction Form Modal (Add/Edit)
 Chart Section (Bonus)
 CSV Export Button (Bonus)

### Phase 3: CSS Styling 

 Responsive layout using Flexbox/Grid
 Color scheme: Green for income, Red for expenses
 Modal styling for transaction form
 Table styling with action buttons
 Form validation styling (error states)
 Filter/sort controls styling
 Chart container styling

### Phase 4: JavaScript Implementation 

#### Models 

 `Transaction.js` - Transaction class with properties
 `TransactionCollection.js` - Array management with CRUD methods

#### Views 

 `UIView.js` - DOM manipulation methods

#### Controllers 

 `AppController.js` - Main controller connecting Model-View

#### Utilities 

 `Storage.js` - localStorage operations
 `Validator.js` - Form validation with error handling
 `ChartManager.js` - Pie chart using Chart.js
 `CSVExporter.js` - Export transactions to CSV

### Phase 5: Core Features 

 **Create**: Add new transaction with all fields
 **Read**: Display transactions in table with summary
 **Update**: Edit existing transaction (pre-fill form)
 **Delete**: Remove transaction with confirmation

### Filter & Sort 

 Filter by Category (Income/Expense)
 Filter by Sub-Category
 Filter by Date Range
 Sort by Date (Asc/Desc)
 Sort by Amount (Asc/Desc)

### Form Validations 

 Amount: numeric, required, not zero
 Date: valid, not future date
 Category: required (radio button)
 Sub-Category: required (dropdown)
 Description: optional, max 100 chars

### Phase 6: Bonus Features 

 Pie chart for category-wise expense distribution
 CSV file download for financial data
 Run-time exception handling with try-catch

---

## 📋 HOW TO RUN

Since this project uses ES6 Modules, you need to run it on a local server:

1. **Using Python (recommended):**

   ```bash
   cd /Users/ashishdeotripathi/projects/MoMa
   python -m http.server 8000
   ```

   Then open: http://localhost:8000

2. **Using Node.js:**

   ```bash
   cd /Users/ashishdeotripathi/projects/MoMa
   npx serve
   ```

3. **Using VS Code:**
   - Install "Live Server" extension
   - Right-click index.html and select "Open with Live Server"
