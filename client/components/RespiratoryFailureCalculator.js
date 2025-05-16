import { apiService } from '../services/apiService.js';
import { exportUtils } from '../utils/exportUtils.js';

export class RespiratoryFailureCalculator {
    constructor(container) {
        this.container = container;
        this.render();
        this.attachEventListeners();
        this.loadHistory();
    }

    render() {
        this.container.innerHTML = `
            <div class="calculator-section">
                <h2>Respiratory Failure Calculator</h2>
                <form id="respiratory-form">
                    <div class="input-group">
                        <label for="ph">pH:</label>
                        <input type="number" id="ph" name="ph" step="0.01" min="6.8" max="7.8" 
                            placeholder="Enter 6.8-7.8">
                    </div>
                    <div class="input-group">
                        <label for="paCO2">PaCO2 (mmHg):</label>
                        <input type="number" id="paCO2" name="paCO2" min="15" max="130" 
                            placeholder="Enter 15-130 mmHg">
                    </div>
                    <div class="input-group">
                        <label for="paO2">PaO2 (mmHg):</label>
                        <input type="number" id="paO2" name="paO2" min="40" max="500" 
                            placeholder="Enter 40-500 mmHg">
                    </div>
                    <div class="input-group">
                        <label for="fio2">FiO2 (%):</label>
                        <input type="number" id="fio2" name="fio2" min="21" max="100" 
                            placeholder="Enter 21-100%">
                    </div>
                    <div class="input-group">
                        <label for="bicarbonate">Bicarbonate (mEq/L):</label>
                        <input type="number" id="bicarbonate" name="bicarbonate" min="0" max="45" 
                            placeholder="Enter 0-45 mEq/L">
                    </div>
                    <button type="submit">Calculate</button>
                </form>
                <div id="respiratory-result" class="result"></div>
                <div class="history-section">
                    <h3>Recent Calculations</h3>
                    <div class="history-controls">
                        <button class="clear-all-button">Clear All Calculations</button>
                    </div>
                    <div id="respiratory-history" class="history-list"></div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.form = this.container.querySelector('#respiratory-form');
        this.resultDiv = this.container.querySelector('#respiratory-result');
        this.historyDiv = this.container.querySelector('#respiratory-history');
        this.clearButton = this.container.querySelector('.clear-all-button');
    }

    attachEventListeners() {
        this.form.addEventListener('submit', this.handleCalculate.bind(this));
        this.clearButton.addEventListener('click', this.handleClearHistory.bind(this));
    }

    async handleCalculate(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {
            ph: parseFloat(formData.get('ph')),
            paCO2: parseFloat(formData.get('paCO2')),
            paO2: parseFloat(formData.get('paO2')),
            fio2: parseFloat(formData.get('fio2')),
            bicarbonate: parseFloat(formData.get('bicarbonate'))
        };

        try {
            const result = await apiService.calculateRespiratoryFailure(data);
            this.displayResult(result);
            await this.loadHistory();
        } catch (error) {
            console.error('API Error:', error);
            this.resultDiv.innerHTML = `
                <div class="error">
                    Failed to calculate: ${error.message}
                </div>
            `;
        }
    }

    displayResult(result) {
        const resultHtml = `
            <div class="result-item ${result.hasRespiratoryFailure ? 'failure' : 'normal'}">
                <h4>${result.hasRespiratoryFailure ? 'Respiratory Failure Detected' : 'No Respiratory Failure'}</h4>
                <div class="result-details">
                    <p>Type: ${result.type || 'None'}</p>
                    <p>P/F Ratio: ${result.pfRatio.toFixed(1)}</p>
                </div>
                <div class="criteria-details">
                    <p>pH: ${result.criteria.abnormalPH ? '⚠️' : '✓'} ${result.ph}</p>
                    <p>PaCO2: ${result.criteria.abnormalPaCO2 ? '⚠️' : '✓'} ${result.paCO2} mmHg</p>
                    <p>PaO2: ${result.criteria.abnormalPaO2 ? '⚠️' : '✓'} ${result.paO2} mmHg</p>
                    <p>HCO3: ${result.criteria.abnormalBicarbonate ? '⚠️' : '✓'} ${result.bicarbonate} mEq/L</p>
                </div>
                <div class="export-buttons">
                    <button class="export-btn fhir-btn">Export FHIR</button>
                </div>
            </div>
        `;

        this.resultDiv.innerHTML = resultHtml;

        // Add event listener for FHIR export button
        const fhirBtn = this.resultDiv.querySelector('.fhir-btn');

        fhirBtn.addEventListener('click', () => {
            const fhirData = exportUtils.toFHIR(result);
            exportUtils.downloadFile(fhirData, 'respiratory-assessment-fhir.json', 'application/json');
        });
    }

    async loadHistory() {
        try {
            const history = await apiService.getRespiratoryHistory();
            this.displayHistory(history);
        } catch (error) {
            console.error('Failed to load history:', error);
            this.historyDiv.innerHTML = `
                <div class="error">
                    Failed to load history: ${error.message}
                    <button class="retry-button" onclick="this.loadHistory()">Retry</button>
                </div>
            `;
        }
    }

    displayHistory(history) {
        if (!history || history.length === 0) {
            this.historyDiv.innerHTML = '<div class="no-history">No calculations found</div>';
            return;
        }

        const historyHtml = history.map(item => `
            <div class="history-item ${item.hasRespiratoryFailure ? 'failure' : 'normal'}">
                <div class="history-header">
                    <span class="result-type">${item.type || 'No Failure'}</span>
                    <span class="date">${new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div class="history-details">
                    <div>pH: ${item.ph}</div>
                    <div>PaCO2: ${item.paCO2} mmHg</div>
                    <div>PaO2: ${item.paO2} mmHg</div>
                    <div>FiO2: ${item.fio2}%</div>
                    <div>P/F Ratio: ${item.pfRatio.toFixed(1)}</div>
                </div>
            </div>
        `).join('');

        this.historyDiv.innerHTML = historyHtml;
    }

    async handleClearHistory() {
        if (!confirm('Are you sure you want to clear all calculations?')) {
            return;
        }

        try {
            this.historyDiv.classList.add('clearing');
            await apiService.clearRespiratoryHistory();
            this.historyDiv.innerHTML = '<div class="no-history">No calculations found</div>';
        } catch (error) {
            console.error('Failed to clear history:', error);
            alert('Failed to clear history: ' + error.message);
        } finally {
            this.historyDiv.classList.remove('clearing');
        }
    }
}

export default RespiratoryFailureCalculator;
