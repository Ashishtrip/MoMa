import { Storage } from './models/storage.js';
import { Transaction } from './models/transaction.js';
import { TransactionCollection } from './models/transaction-collection.js';
import { Validator } from './utils/validator.js';
import { CSVExporter } from './utils/csv-exporter.js';
import { ChartManager } from './utils/chart-manager.js';
import { UIView } from './views/ui-view.js';
import { AppController } from './controllers/app-controller.js';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});
