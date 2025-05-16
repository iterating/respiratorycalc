import RespiratoryFailure from '../../domain/entities/RespiratoryFailure.js';

class LocalStorageRespiratoryRepository {
    constructor() {
        this.storageKey = 'respiratory_calculations';
        this.nextId = 1;
    }

    async initialize() {
        // Load nextId from localStorage
        const calculations = this.loadFromStorage();
        if (calculations.length > 0) {
            this.nextId = Math.max(...calculations.map(calc => calc.id)) + 1;
        }
        return Promise.resolve();
    }

    async save(calculation) {
        const calculations = this.loadFromStorage();
        const newCalculation = {
            ...calculation,
            id: this.nextId++,
            createdAt: new Date()
        };
        calculations.push(newCalculation);
        this.saveToStorage(calculations);
        return this.mapToEntity(newCalculation);
    }

    async getRecentCalculations(limit = 10) {
        const calculations = this.loadFromStorage();
        return calculations
            .slice()
            .reverse()
            .slice(0, limit)
            .map(this.mapToEntity);
    }

    mapToEntity(data) {
        return new RespiratoryFailure(
            data.ph,
            data.paCO2,
            data.paO2,
            data.fio2,
            data.bicarbonate,
            data.pfRatio,
            data.type,
            data.hasRespiratoryFailure,
            data.criteria,
            data.id,
            new Date(data.createdAt)
        );
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }

    saveToStorage(calculations) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(calculations));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
}

export default LocalStorageRespiratoryRepository;
