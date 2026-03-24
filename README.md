# SepsisCore

Clinical decision support tool for sepsis management.  
Built with **React 18 + Vite + Tailwind CSS**.

## Features

- **NEWS2 scoring** — real-time physiological risk stratification
- **SIRS criteria** — automated count from entered vitals
- **eGFR calculation** — CKD-EPI 2021 (adults) / Bedside Schwartz (paediatrics)
- **BSA calculation** — Mosteller formula
- **Empiric antibiotic recommendations** — source-directed with IDSA dosing adjusted for renal function
- **Resistance risk flags** — MRSA, Pseudomonas, ESBL

## Project Structure

```
sepsis-core/
├── index.html                      # Vite HTML entry
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── package.json
└── src/
    ├── main.jsx                    # React root mount
    ├── App.jsx                     # Root component (state + layout)
    ├── index.css                   # Global styles + Tailwind directives
    ├── components/
    │   ├── InputField.jsx          # Reusable labelled input
    │   ├── PatientPanel.jsx        # Demographics & renal inputs
    │   ├── VitalsPanel.jsx         # NEWS2 vitals + source/risk flags
    │   ├── StatsGrid.jsx           # Quick-stat tiles (NEWS2/SIRS/eGFR/BSA)
    │   ├── AssessmentCard.jsx      # Clinical assessment summary
    │   └── AntibioticCard.jsx      # Single antibiotic display card
    └── hooks/
        └── useClinicalCalculations.js  # All clinical logic (pure hooks)
```

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Disclaimer

For educational and decision-support use only.  
Always verify dosages against your local pharmacopoeia and current guidelines.

**Credits:** Created by Dr Akshay HM JSSAHER  
NEWS2 © Royal College of Physicians · CKD-EPI 2021 © NKF/ASN
