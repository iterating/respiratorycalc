import RespiratoryFailure from '../domain/entities/RespiratoryFailure.js';

class RespiratoryService {
    constructor(repository) {
        this.repository = repository;
    }

    async calculateRespiratoryFailure(data) {
        const { ph, paCO2, paO2, fio2, bicarbonate } = data;

        // Validate input
        this.validateInput(data);

        // Create and calculate respiratory failure
        const calculation = new RespiratoryFailure(
            ph,
            paCO2,
            paO2,
            fio2,
            bicarbonate
        );

        // Save calculation to database
        return await this.repository.save(calculation);
    }

    validateInput(data) {
        const { ph, paCO2, paO2, fio2, bicarbonate } = data;

        if (!ph || !paCO2 || !paO2 || !fio2 || !bicarbonate) {
            throw new Error('All fields are required');
        }

        if (ph < 6.8 || ph > 7.8) {
            throw new Error('pH must be between 6.8 and 7.8');
        }

        if (paCO2 < 15 || paCO2 > 130) {
            throw new Error('PaCO2 must be between 15 and 130 mmHg');
        }

        if (paO2 < 40 || paO2 > 500) {
            throw new Error('PaO2 must be between 40 and 500 mmHg');
        }

        if (fio2 < 21 || fio2 > 100) {
            throw new Error('FiO2 must be between 21 and 100%');
        }

        if (bicarbonate < 0 || bicarbonate > 45) {
            throw new Error('Bicarbonate must be between 0 and 45 mEq/L');
        }
    }

    async getRecentCalculations() {
        return await this.repository.getRecentCalculations();
    }

    async clearHistory() {
        return await this.repository.clearHistory();
    }
}

export default RespiratoryService;
