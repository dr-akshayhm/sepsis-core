// src/hooks/useClinicalCalculations.js
// Pure calculation logic extracted into a custom hook

import { useMemo } from 'react';

/**
 * Calculates eGFR (CKD-EPI 2021 / Bedside Schwartz for paediatrics) and BSA.
 */
export function useRenalCalculations(patient) {
  return useMemo(() => {
    const { age, weight, height, sex, creatinine, onDialysis } = patient;
    const scr       = parseFloat(creatinine);
    const ageNum    = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(scr) || isNaN(ageNum)) return { egfr: null, bsa: null };

    let egfr = null;
    let bsa  = null;

    if (weightNum && heightNum) {
      bsa = 0.007184 * Math.pow(heightNum, 0.725) * Math.pow(weightNum, 0.425);
    }

    if (ageNum < 18) {
      if (heightNum) egfr = (0.413 * heightNum) / scr;
    } else {
      const kappa       = sex === 'female' ? 0.7    : 0.9;
      const alpha       = sex === 'female' ? -0.241 : -0.302;
      const sexConstant = sex === 'female' ? 1.012  : 1.0;
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

    if (r <= 8 || r >= 25)                           score += 3;
    else if (r >= 21 && r <= 24)                     score += 2;
    else if (r >= 9  && r <= 11)                     score += 1;

    if (o <= 91)                                     score += 3;
    else if (o >= 92 && o <= 93)                     score += 2;
    else if (o >= 94 && o <= 95)                     score += 1;

    if (onOxygen) score += 2;

    if (s <= 90 || s >= 220)                         score += 3;
    else if (s >= 91 && s <= 100)                    score += 2;
    else if (s >= 101 && s <= 110)                   score += 1;

    if (h <= 40 || h >= 131)                         score += 3;
    else if (h >= 111 && h <= 130)                   score += 2;
    else if (h <= 50 || (h >= 91 && h <= 110))       score += 1;

    if (acvpu !== 'A') score += 3;

    if (t <= 35.0)                                    score += 3;
    else if (t >= 39.1)                               score += 2;
    else if (t <= 36.0 || (t >= 38.1 && t <= 39.0))  score += 1;

    return score;
  }, [vitals]);
}

/**
 * Counts met SIRS criteria (temp, HR, RR).
 */
export function useSIRS(vitals) {
  return useMemo(() => {
    let count = 0;
    const { rr, hr, temp } = vitals;
    if (parseFloat(temp) > 38 || parseFloat(temp) < 36) count++;
    if (parseFloat(hr)   > 90)                          count++;
    if (parseFloat(rr)   > 20)                          count++;
    return count;
  }, [vitals]);
}

/**
 * Derives the empiric antibiotic regimen from patient state.
 *
 * BUG FIX: When egfr is null (creatinine not yet entered), all comparisons
 * like (null < 30) return false in JS, causing every drug to fall through
 * to the wrong interval. We now use e = 999 as sentinel for "assume normal
 * renal function" so correct default dosing is always shown.
 */
export function useAntibiotics(patient, egfr) {
  return useMemo(() => {
    const { suspectedSource, history, onDialysis } = patient;
    const results = [];

    // Sentinel: treat null/undefined egfr as normal function (>60)
    const e = (egfr !== null && egfr !== undefined) ? egfr : 999;

    // ── Vancomycin ───────────────────────────────────────────────────────
    const getVanco = () => {
      const dose = '15-20 mg/kg IV (loading dose)';
      let freq;
      if (onDialysis)  freq = '500-1000 mg post-HD';
      else if (e < 10) freq = '15 mg/kg q48h';
      else if (e < 30) freq = '15 mg/kg q24-48h';
      else if (e < 50) freq = '15 mg/kg q18-24h';
      else             freq = '15 mg/kg q12h';
      return { name: 'Vancomycin', role: 'MRSA Coverage', dose, freq };
    };

    // ── Cefepime ─────────────────────────────────────────────────────────
    const getCefepime = (role) => {
      let dose, freq;
      if (onDialysis)  { dose = '1g IV';  freq = '1g post-HD + 500mg q24h'; }
      else if (e < 11) { dose = '1g IV';  freq = 'q24h'; }
      else if (e < 30) { dose = '1g IV';  freq = 'q12h'; }
      else if (e < 60) { dose = '2g IV';  freq = 'q12h'; }
      else             { dose = '2g IV';  freq = 'q8h';  }
      return { name: 'Cefepime', role, dose, freq };
    };

    // ── Meropenem ────────────────────────────────────────────────────────
    const getMeropenem = (role) => {
      let dose, freq;
      if (onDialysis)  { dose = '500mg IV'; freq = '500mg post-HD'; }
      else if (e < 10) { dose = '500mg IV'; freq = 'q24h'; }
      else if (e < 26) { dose = '500mg IV'; freq = 'q12h'; }
      else if (e < 50) { dose = '1g IV';    freq = 'q12h'; }
      else             { dose = '1g IV';    freq = 'q8h';  }
      return { name: 'Meropenem', role, dose, freq };
    };

    // ── Piperacillin / Tazobactam ────────────────────────────────────────
    const getPipTazo = () => {
      let dose, freq;
      if (onDialysis)  { dose = '2.25g IV'; freq = 'q8h (redose 0.75g post-HD)'; }
      else if (e < 20) { dose = '2.25g IV'; freq = 'q8h'; }
      else if (e < 40) { dose = '3.375g IV';freq = 'q8h'; }
      else             { dose = '4.5g IV';  freq = 'q6h'; }
      return { name: 'Piperacillin / Tazobactam', role: 'Broad + Anaerobic', dose, freq };
    };

    // ── Ceftriaxone (no renal adjustment needed) ─────────────────────────
    const getCeftriaxone = (role) => ({
      name: 'Ceftriaxone', role, dose: '2g IV', freq: 'q24h',
    });

    // ── Azithromycin (no renal adjustment needed) ────────────────────────
    const getAzithromycin = () => ({
      name: 'Azithromycin', role: 'Atypical Coverage', dose: '500mg IV/PO', freq: 'q24h',
    });

    // ── Cefazolin (skin/MSSA, renal-adjusted) ────────────────────────────
    const getCefazolin = () => {
      let dose, freq;
      if (onDialysis)  { dose = '1g IV'; freq = 'post-HD'; }
      else if (e < 11) { dose = '1g IV'; freq = 'q48-72h'; }
      else if (e < 35) { dose = '1g IV'; freq = 'q12h'; }
      else             { dose = '2g IV'; freq = 'q8h';  }
      return { name: 'Cefazolin', role: 'MSSA / Strep Coverage', dose, freq };
    };

    // ── Source-directed selection ────────────────────────────────────────
    if (suspectedSource === 'lung') {
      results.push(history.pseudomonasRisk
        ? getCefepime('Antipseudomonal')
        : getCeftriaxone('Broad Spectrum'));
      results.push(getAzithromycin());

    } else if (suspectedSource === 'uri') {
      results.push(history.esblRisk
        ? getMeropenem('ESBL Coverage')
        : getCeftriaxone('Gram-Negative Coverage'));

    } else if (suspectedSource === 'abd') {
      results.push(getPipTazo());

    } else if (suspectedSource === 'skin') {
      results.push(getCefazolin());

    } else {
      // Unknown / undifferentiated
      results.push(getCefepime('Undifferentiated Sepsis'));
    }

    // ── Add Vancomycin when MRSA risk, skin source, or unknown ───────────
    if (history.mrsaRisk || suspectedSource === 'unknown' || suspectedSource === 'skin') {
      results.push(getVanco());
    }

    return results;
  }, [patient, egfr]);
}
