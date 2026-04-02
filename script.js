// LEGACY: MoMa app now modularized in js/app.js (ES6 modules architecture)
// All classes moved to dedicated modules:
// - models/: Storage, Transaction, TransactionCollection
// - utils/: Validator, CSVExporter, ChartManager 
// - views/: UIView
// - controllers/: AppController
// 
// index.html loads <script type="module" src="js/app.js" defer></script>
// This script.js is minimized (legacy unused) - app runs via modules exclusively

console.log('MoMa: Modular app loaded via js/app.js - script.js (legacy)');

