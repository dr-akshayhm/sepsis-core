// src/hooks/useClinicalCalculations.js
// Pure calculation logic extracted into a custom hook

import { useMemo } from 'react';

/**
 * Calculates eGFR (CKD-EPI 2021 / Bedside Schwartz for paediatrics) and BSA.
 */
export function useRenalCalculations(patient) {
  return useMemo(() => {
    const { age, weight, height, sex, creatinine, onDialysis } = patient;
    const scr     = parseFloat(creatinine);
    const ageNum  = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(scr) || isNaN(ageNum)) return { egfr: null, bsa: null };

    let egfr = null;
    let bsa  = null;

    if (weightNum && heightNum) {
      bsa = 0.007184 * Math.pow(heightNum, 0.725) * Math.pow(weightNum, 0.425);
    }

    if (ageNum < 18) {
      // Bedside Schwartz
      if (heightNum) egfr = (0.413 * heightNum) / scr;
    } else {
      // CKD-EPI 2021
      const kappa       = sex === 'female' ? 0.7 : 0.9;
      const alpha       = sex === 'female' ? -0.241 : -0.302;
      const sexConstant = sex === 'female' ? 1.012 : 1.0;

      egfr =
        142 *
        Math.pow(Math.min(scr / kappa, 1), alpha) *
        Math.pow(Math.max(scr / kappa, 1), -1.2) *
        Math.pow(0.9938, ageNum) *
        sexConstant;
    }

    return {
      egfr: onDialysis ? 10 : Math.round(egfr * 10) / 10,
      bsa:  bsa ? Math.round(bsa * 100) / 100 : null,
    };
  }, [patient]);
}

/**
 * Computes NEWS2 score from vitals.
 * Returns null when any required vital is missing.
 */
export function useNEWS2(vitals) {
  return useMemo(() => {
    const { rr, sbp, hr, temp, spo2, onOxygen, acvpu } = vitals;
    const r = parseFloat(rr);
    const s = parseFloat(sbp);
    const h = parseFloat(hr);
    const t = parseFloat(temp);
    const o = parseFloat(spo2);

    if (isNaN(r) || isNaN(s) || isNaN(h) || isNaN(t) || isNaN(o)) return null;

    let score = 0;

    // Respiratory rate
    if (r <= 8 || r >= 25)              score += 3;
    else if (r >= 21 && r <= 24)        score += 2;
    else if (r >= 9  && r <= 11)        score += 1;

    // SpO2
    if (o <= 91)                         score += 3;
    else if (o >= 92 && o <= 93)        score += 2;
    else if (o >= 94 && o <= 95)        score += 1;

    // Supplemental oxygen
    if (onOxygen) score += 2;

    // Systolic BP
    if (s <= 90 || s >= 220)            score += 3;
    else if (s >= 91 && s <= 100)       score += 2;
    else if (s >= 101 && s <= 110)      score += 1;

    // Heart rate
    if (h <= 40 || h >= 131)            score += 3;
    else if (h >= 111 && h <= 130)      score += 2;
    else if (h <= 50 || (h >= 91 && h <= 110)) score += 1;

    // ACVPU
    if (acvpu !== 'A') score += 3;

    // Temperature
    if (t <= 35.0)                        score += 3;
    else if (t >= 39.1)                   score += 2;
    else if (t <= 36.0 || (t >= 38.1 && t <= 39.0)) score += 1;

    return score;
  }, [vitals]);
}

/**
 * Counts met SIRS criteria (out of 3 checked here: temp, HR, RR).
 */
export function useSIRS(vitals) {
  return useMemo(() => {
    let count = 0;
    const { rr, hr, temp } = vitals;
    if (parseFloat(temp) > 38 || parseFloat(temp) < 36) count++;
    if (parseFloat(hr)   > 90)                           count++;
    if (parseFloat(rr)   > 20)                           count++;
    return count;
  }, [vitals]);
}

/**
 * Derives the empiric antibiotic regimen from patient state.
 */
export function useAntibiotics(patient, egfr) {
  return useMemo(() => {
    const { suspectedSource, history, onDialysis } = patient;
    const results = [];

    const getVanco = () => {
      const dose = '15-20 mg/kg LD';
      let maintenance = '15 mg/kg q12h';
      if (onDialysis)  maintenance = '500-1000mg post-HD';
      else if (egfr < 30) maintenance = '15 mg/kg q24-48h';
      else if (egfr < 50) maintenance = '15 mg/kg q18-24h';
      return { name: 'Vancomycin', role: 'MRSA Coverage', dose, freq: maintenance };
    };

    if (suspectedSource === 'lung') {
      if (history.pseudomonasRisk) {
        results.push({
          name: 'Cefepime',
          role: 'Antipseudomonal',
          dose: '2g',
          freq: egfr < 30 ? 'q24h' : egfr < 60 ? 'q12h' : 'q8h',
        });
      } else {
        results.push({ name: 'Ceftriaxone', role: 'Broad Spectrum', dose: '2g', freq: 'q24h' });
      }
      results.push({ name: 'Azithromycin', role: 'Atypical', dose: '500mg', freq: 'q24h' });

    } else if (suspectedSource === 'uri') {
      if (history.esblRisk) {
        results.push({
          name: 'Meropenem',
          role: 'ESBL Coverage',
          dose: egfr < 25 ? '500mg' : '1g',
          freq: egfr < 25 ? 'q24h' : egfr < 50 ? 'q12h' : 'q8h',
        });
      } else {
        results.push({ name: 'Ceftriaxone', role: 'Gram-Negative', dose: '2g', freq: 'q24h' });
      }

    } else if (suspectedSource === 'abd') {
      results.push({
        name: 'Piperacillin/Tazobactam',
        role: 'Broad + Anaerobic',
        dose: onDialysis ? '2.25g' : '4.5g',
        freq: egfr < 20 ? 'q12h' : egfr < 40 ? 'q8h' : 'q6h',
      });

    } else {
      results.push({
        name: 'Cefepime',
        role: 'Undifferentiated Sepsis',
        dose: '2g',
        freq: egfr < 30 ? 'q24h' : egfr < 60 ? 'q12h' : 'q8h',
      });
    }

    if (history.mrsaRisk || suspectedSource === 'unknown' || suspectedSource === 'skin') {
      results.push(getVanco());
    }

    return results;
  }, [patient, egfr]);
}
