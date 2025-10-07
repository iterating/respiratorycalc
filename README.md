# [Respiratory Failure Calculator](https://respiratorycalc.vercel.app/)

<a href="https://respiratorycalc.vercel.app/"><img src="https://raw.githubusercontent.com/iterating/respiratorycalc/refs/heads/main/public/portfolio.respiratorycalc.qr.png" width="100" alt="Respiratory Failure Calculator"></a>
**Try it out!**

A modern web application for calculating respiratory failure based on arterial blood gas (ABG) analysis, designed to assist healthcare professionals in rapid diagnosis and classification of respiratory disorders.

I wrote this as a medical student at University of Massachusetts Medical School to help clinicians quickly interpret ABGs and identify respiratory failure patterns.

## What is Respiratory Failure?

Respiratory failure is a serious condition where the respiratory system fails in one or both of its gas exchange functions: oxygenation and carbon dioxide elimination. It is classified into two main types:

- **Type 1 (Hypoxemic)**: PaO2 < 60 mmHg with normal or low PaCO2
- **Type 2 (Hypercapnic)**: PaCO2 > 45 mmHg with or without hypoxemia

Additional classifications include:
- Acute vs. Chronic
- Compensated vs. Uncompensated
- Mixed Respiratory-Metabolic Disorders

## Why is this Important?

Accurate interpretation of blood gases is crucial because:
- It guides immediate therapeutic interventions
- Helps distinguish between various causes of respiratory failure
- Identifies acid-base disturbances
- Monitors response to treatment
- Assists in ventilator management decisions

## Features

- **Real-time ABG Analysis**: Instantly determine respiratory failure type
- **Detailed Parameter Breakdown**: 
  - pH and acid-base status
  - PaCO2 and ventilation assessment
  - PaO2 and oxygenation status
  - Bicarbonate and metabolic component
- **Calculation History**: Track and review previous analyses
- **User-friendly Interface**: Clean, intuitive design for rapid data entry
- **Mobile Responsive**: Use on any device at the bedside
- **Data Persistence**: Secure storage of calculations using Neon
- **Health Data Interoperability**: Export results in FHIR format
  - FHIR: Export as FHIR R4 Observation resources (JSON)

<a href="https://respiratorycalc.vercel.app/"><img src="https://raw.githubusercontent.com/iterating/respiratorycalc/refs/heads/main/public/portfolio.respiratorycalc.calc.jpg" width="350px"><img src="https://raw.githubusercontent.com/iterating/respiratorycalc/refs/heads/main/public/portfolio.respiratorycalc.results.jpg" width="350px"></a>

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express
- **Database**: Neon (Serverless PostgreSQL)
- **Architecture**: Clean Architecture with Domain-Driven Design
- **Deployment**: Vercel for serverless deployment
- **Healthcare Standards**: FHIR R4, HL7 v2.5.1

## Clinical Applications

The Respiratory Failure Calculator assists in:

### Acute Care Settings
- Emergency department triage
- ICU patient monitoring
- Rapid response team assessments
- Ventilator management

### Chronic Care Management
- Outpatient COPD monitoring
- Sleep disorder evaluation
- Pulmonary rehabilitation
- Long-term oxygen therapy assessment

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.
