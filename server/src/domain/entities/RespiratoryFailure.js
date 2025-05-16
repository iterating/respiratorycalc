class RespiratoryFailure {
    constructor(ph, paCO2, paO2, fio2, bicarbonate) {
        this.ph = ph;
        this.paCO2 = paCO2;
        this.paO2 = paO2;
        this.fio2 = fio2;
        this.bicarbonate = bicarbonate;
        this.pfRatio = this.calculatePFRatio();
        this.criteria = this.evaluateCriteria();
        this.type = this.determineType();
        this.hasRespiratoryFailure = this.checkRespiratoryFailure();
        this.createdAt = new Date();
    }

    calculatePFRatio() {
        // Convert FiO2 from percentage to decimal
        const fio2Decimal = this.fio2 / 100;
        return this.paO2 / fio2Decimal;
    }

    evaluateCriteria() {
        return {
            abnormalPH: this.ph < 7.35 || this.ph > 7.45,
            abnormalPaCO2: this.paCO2 < 35 || this.paCO2 > 45,
            abnormalPaO2: this.paO2 < 80,
            abnormalPFRatio: this.pfRatio < 300,
            abnormalBicarbonate: this.bicarbonate < 22 || this.bicarbonate > 26
        };
    }

    determineType() {
        if (!this.checkRespiratoryFailure()) {
            return null;
        }

        if (this.paCO2 > 45) {
            if (this.ph < 7.35) {
                return 'Acute Respiratory Acidosis';
            } else if (this.ph > 7.45) {
                return 'Compensated Respiratory Acidosis';
            }
        }

        if (this.paCO2 < 35) {
            if (this.ph > 7.45) {
                return 'Acute Respiratory Alkalosis';
            } else if (this.ph < 7.35) {
                return 'Compensated Respiratory Alkalosis';
            }
        }

        if (this.pfRatio < 300) {
            if (this.pfRatio < 200) {
                return 'Severe Hypoxemic Respiratory Failure';
            }
            return 'Hypoxemic Respiratory Failure';
        }

        return 'Mixed Respiratory Disorder';
    }

    checkRespiratoryFailure() {
        const criteria = this.evaluateCriteria();
        // Respiratory failure is present if PaO2 < 60 mmHg or PaCO2 > 45 mmHg
        // or if P/F ratio < 300 with abnormal pH
        return (
            this.paO2 < 60 ||
            this.paCO2 > 45 ||
            (this.pfRatio < 300 && criteria.abnormalPH)
        );
    }

    toJSON() {
        return {
            ph: this.ph,
            paCO2: this.paCO2,
            paO2: this.paO2,
            fio2: this.fio2,
            bicarbonate: this.bicarbonate,
            pfRatio: this.pfRatio,
            criteria: this.criteria,
            type: this.type,
            hasRespiratoryFailure: this.hasRespiratoryFailure,
            createdAt: this.createdAt
        };
    }
}

export default RespiratoryFailure;
