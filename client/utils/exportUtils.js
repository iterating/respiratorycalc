export const exportUtils = {
    toFHIR(data) {
        const timestamp = new Date().toISOString();
        return {
            resourceType: "Observation",
            status: "final",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "82800-4",
                    display: "Respiratory Failure Assessment"
                }]
            },
            effectiveDateTime: timestamp,
            valueCodeableConcept: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: data.type === 1 ? "409622000" : "409623005",
                    display: data.type === 1 ? "Type 1 respiratory failure" : "Type 2 respiratory failure"
                }]
            },
            component: [
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "2744-1",
                            display: "pH"
                        }]
                    },
                    valueQuantity: {
                        value: data.pH,
                        unit: "pH",
                        system: "http://unitsofmeasure.org",
                        code: "[pH]"
                    }
                },
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "2019-8",
                            display: "Carbon dioxide partial pressure"
                        }]
                    },
                    valueQuantity: {
                        value: data.paCO2,
                        unit: "mmHg",
                        system: "http://unitsofmeasure.org",
                        code: "mm[Hg]"
                    }
                },
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "2703-7",
                            display: "Oxygen partial pressure"
                        }]
                    },
                    valueQuantity: {
                        value: data.paO2,
                        unit: "mmHg",
                        system: "http://unitsofmeasure.org",
                        code: "mm[Hg]"
                    }
                },
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "1959-6",
                            display: "Bicarbonate"
                        }]
                    },
                    valueQuantity: {
                        value: data.hco3,
                        unit: "mEq/L",
                        system: "http://unitsofmeasure.org",
                        code: "meq/L"
                    }
                }
            ]
        };
    },

    downloadFile(content, filename, type) {
        const blob = new Blob([type === 'application/json' ? JSON.stringify(content, null, 2) : content], 
            { type: type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
