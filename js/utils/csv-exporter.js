// CSVExporter Class - Exports transactions to downloadable CSV
export class CSVExporter {
    /**
     * Exports transactions to CSV file download
     * @param {Array<Transaction>} transactions 
     */
    static export(transactions) {
        if (!transactions.length) return alert('No transactions to export');
        try {
            const headers = ['Date', 'Category', 'Sub-Category', 'Description', 'Amount'];
            const rows = transactions.map(t => [
                t.date, t.category, t.subCategory, t.description || '', t.isExpense() ? -t.amount : t.amount
            ]);
            // Wrap fields in quotes for safe CSV (handles commas)
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
