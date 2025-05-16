import RespiratoryFailure from '../../domain/entities/RespiratoryFailure.js';

class InMemoryRespiratoryRepository {
    constructor() {
        this.calculations = [];
        this.nextId = 1;
    }

    async initialize() {
        // No initialization needed for in-memory storage
        return Promise.resolve();
    }

    async save(calculation) {
        const newCalculation = {
            ...calculation,
            id: this.nextId++,
            createdAt: new Date()
        };
        this.calculations.push(newCalculation);
        return this.mapToEntity(newCalculation);
    }

    async getRecentCalculations(limit = 10) {
        return this.calculations
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
            data.createdAt
        );
    }
}

export default InMemoryRespiratoryRepository;
