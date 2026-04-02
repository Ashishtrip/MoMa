// Canvas ChartManager Class (Pure Canvas, no libs) - Renders pie charts for category distribution
export class ChartManager {
    /**
     * @param {string} canvasId - ID of canvas element (400x400 expected)
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.centerX = 200;
        this.centerY = 200;
        this.radius = 180;
        this.currentChartType = 'expense';
    }
    
    capitalize(str) { 
        return str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : ''; 
    }
    
    /**
     * Generates gradient color based on normalized value (lighter for smaller, darker for larger)
     */
    getColor(value, minV, maxV) {
        if (minV === maxV) return '#808080';
        const norm = (value - minV) / (maxV - minV); // Normalize to 0-1
        const grey = Math.round(224 - norm * 198); // 224 (light) to 26 (dark)
        const hex = grey.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`;
    }
    
    /**
     * Draws pie chart + legend from category data {subCat: amount}
     */
    drawPie(data) {
        if (!this.ctx || !data || !Object.keys(data).length) return;
        const keys = Object.keys(data), values = Object.values(data);
        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) return;
        const minV = Math.min(...values), maxV = Math.max(...values);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, 400, 400);
        
        // Draw pie slices
        let startAngle = -Math.PI / 2; // Start from top
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
    
    /**
     * Draws legend rectangle with color swatches and labels on right side
     */
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
