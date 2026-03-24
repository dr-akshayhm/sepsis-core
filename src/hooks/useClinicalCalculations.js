// src/hooks/useClinicalCalculations.js
// Clinical logic based on Stanford Health Care SHC Sepsis Empiric Antibiotic
// Selection Guide (Issue Date 01/2025) — SASS Program

import { useMemo } from 'react';

// ─── Renal Calculations ──────────────────────────────────────────────────────

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
      // Bedside Schwartz (paediatric)
      if (heightNum) egfr = (0.413 * heightNum) / scr;
    } else {
      // CKD-EPI 2021
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

// ─── NEWS2 ───────────────────────────────────────────────────────────────────

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
    if (r <= 8 || r >= 25)                           score += 3;
    else if (r >= 21 && r <= 24)                     score += 2;
    else if (r >= 9  && r <= 11)                     score += 1;

    // SpO2
    if (o <= 91)                                     score += 3;
    else if (o >= 92 && o <= 93)                     score += 2;
    else if (o >= 94 && o <= 95)                     score += 1;

    if (onOxygen) score += 2;

    // Systolic BP
    if (s <= 90 || s >= 220)                         score += 3;
    else if (s >= 91 && s <= 100)                    score += 2;
    else if (s >= 101 && s <= 110)                   score += 1;

    // Heart rate
    if (h <= 40 || h >= 131)                         score += 3;
    else if (h >= 111 && h <= 130)                   score += 2;
    else if (h <= 50 || (h >= 91 && h <= 110))       score += 1;

    // ACVPU
    if (acvpu !== 'A') score += 3;

    // Temperature
    if (t <= 35.0)                                    score += 3;
    else if (t >= 39.1)                               score += 2;
    else if (t <= 36.0 || (t >= 38.1 && t <= 39.0))  score += 1;

    return score;
  }, [vitals]);
}

// ─── SIRS ────────────────────────────────────────────────────────────────────

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

// ─── Antibiotic Engine (SHC SASS Guide 01/2025) ──────────────────────────────
//
// Dosing shown = NORMAL RENAL FUNCTION doses per SHC guide.
// Renal adjustments are flagged as notes — full renal titration
// must follow SHC Antibiotic Dosing Guide per guideline instructions.
//
// egfr null guard: treat null as 999 (normal) so comparisons never
// silently fail when creatinine has not yet been entered.

export function useAntibiotics(patient, egfr) {
  return useMemo(() => {
    const {
      suspectedSource,
      history,
      onDialysis,
      acquisitionType,   // 'community' | 'healthcare'
      skinSubtype,       // 'cellulitis' | 'necrotizing' | 'special'
      pneumoniaSubtype,  // 'cap' | 'hap'
      meningitisAge,     // boolean: age > 50 or immunocompromised
      betaLactamAllergy, // 'none' | 'non-severe' | 'severe'
    } = patient;

    const results  = [];
    const notes    = [];

    // Safe eGFR — treat null as normal (999) so no comparison silently fails
    const e = (egfr !== null && egfr !== undefined) ? egfr : 999;

    // ── Shared drug builders (SHC standard doses, normal renal function) ──

    const drug = (name, role, dose, freq, note = '') => ({ name, role, dose, freq, note });

    const VANCO      = drug('Vancomycin',                  'MRSA Coverage',         'Per Pharmacy', 'Per Pharmacy', 'Dose per Pharmacy/PK team');
    const CEFTRIAXONE_2G_Q24 = drug('Ceftriaxone',         'Gram-Negative Coverage','2g IV',        'Q24H');
    const CEFTRIAXONE_2G_Q12 = drug('Ceftriaxone',         'Meningitis Coverage',   '2g IV',        'Q12H');
    const CEFEPIME_2G_Q8  = drug('Cefepime',               'Anti-Pseudomonal',      '2g IV',        'Q8H');
    const CEFEPIME_1G_Q8  = drug('Cefepime',               'Resistant UTI',         '1g IV',        'Q8H');
    const CEFEPIME_2G_Q8_HAP = drug('Cefepime',            'HAP/VAP Coverage',      '2g IV',        'Q8H', 'Preferred agent for HAP/VAP');
    const PIPTZ_45_Q8     = drug('Piperacillin/Tazobactam','Broad + Anaerobic',     '4.5g IV',      'Q8H over 4 hrs');
    const PIPTZ_375_Q8    = drug('Piperacillin/Tazobactam','Broad Spectrum',        '3.375g IV',    'Q8H over 4 hrs');
    const PIPTZ_375_Q8_UTI = drug('Piperacillin/Tazobactam','Resistant UTI',        '3.75g IV',     'Q8H');
    const MEROPENEM_1G_Q8 = drug('Meropenem',              'ESBL Coverage',         '1g IV',        'Q8H', 'Use for ESBL history');
    const MEROPENEM_2G_Q8 = drug('Meropenem',              'Meningitis / ESBL',     '2g IV',        'Q8H');
    const ERTAPENEM_1G_Q24= drug('Ertapenem',              'ESBL Coverage',         '1g IV',        'Q24H', 'Use for ESBL history');
    const AZITHRO         = drug('Azithromycin',           'Atypical Coverage',     '500mg IV',     'Q24H');
    const LEVO            = drug('Levofloxacin',           'Severe BL Allergy',     '750mg IV',     'Q24H', 'Only if severe beta-lactam allergy');
    const AZTREONAM_2G_Q8 = drug('Aztreonam',              'Severe BL Allergy',     '2g IV',        'Q8H',  'Only if severe beta-lactam allergy');
    const AZTREONAM_2G_Q6 = drug('Aztreonam',              'Severe BL Allergy',     '2g IV',        'Q6-8H','Only if severe beta-lactam allergy');
    const METRONIDAZOLE   = drug('Metronidazole',          'Anaerobic Coverage',    '500mg IV',     'Q8H');
    const CEFAZOLIN        = drug('Cefazolin',             'Non-purulent SSTI',     '2g IV',        'Q8H');
    const CLINDAMYCIN      = drug('Clindamycin',           'Toxin Suppression',     '600-900mg IV', 'Q8H', 'Add for necrotizing fasciitis');
    const AMPICILLIN       = drug('Ampicillin',            'Listeria Coverage',     '2g IV',        'Q4H', 'Add if age >50 or immunocompromised');
    const LINEZOLID        = drug('Linezolid',             'VRE Coverage',          '600mg IV',     'Q12H','Add if VRE risk');
    const MOXIFLOXACIN     = drug('Moxifloxacin',          'Severe BL Allergy',     '400mg IV',     'Q24H','Only if severe beta-lactam allergy');
    const TMPSMX           = drug('TMP/SMX',               'Listeria (BL Allergy)', '5mg/kg IV',    'Q6-8H','Only if severe beta-lactam allergy — Listeria coverage only');

    const isSevereAllergy = betaLactamAllergy === 'severe';
    const isHCA           = acquisitionType   === 'healthcare';

    // ════════════════════════════════════════════════════════════════════
    // PNEUMONIA  (CAP vs HAP/VAP)
    // ════════════════════════════════════════════════════════════════════
    if (suspectedSource === 'lung') {
      if (pneumoniaSubtype === 'hap') {
        // HAP / VAP
        if (isSevereAllergy) {
          results.push(AZTREONAM_2G_Q8, VANCO);
          notes.push('Consider adding Tobramycin 5-7mg/kg x1 for HAP/VAP if severe allergy');
        } else {
          results.push(CEFEPIME_2G_Q8_HAP);
          if (history.mrsaRisk) results.push(VANCO);
        }
      } else {
        // CAP (default)
        if (isSevereAllergy) {
          if (history.pseudomonasRisk) {
            results.push(AZTREONAM_2G_Q8, LEVO);
          } else {
            results.push(LEVO);
          }
          if (history.mrsaRisk) results.push(VANCO);
        } else {
          if (history.pseudomonasRisk) {
            results.push(CEFEPIME_2G_Q8);
          } else {
            results.push(CEFTRIAXONE_2G_Q24);
          }
          results.push(AZITHRO);
          if (history.mrsaRisk) results.push(VANCO);
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // URINARY TRACT INFECTION
    // ════════════════════════════════════════════════════════════════════
    else if (suspectedSource === 'uri') {
      if (isSevereAllergy) {
        results.push(AZTREONAM_2G_Q8);
      } else if (history.esblRisk) {
        results.push(ERTAPENEM_1G_Q24);
        notes.push('Use Ertapenem for ESBL history (preferred over Cefepime for UTI ESBL)');
      } else if (history.resistantOrganismRisk) {
        // High risk for resistant bacteria
        results.push(CEFEPIME_1G_Q8);
        notes.push('Alternatives: Ertapenem 1g Q24H (ESBL) or Pip/Tazo 3.75g Q8H');
      } else {
        // Low risk
        results.push(CEFTRIAXONE_2G_Q24);
      }
      if (history.gpcGramStain) {
        results.push(VANCO);
        notes.push('GPC on urine Gram stain — Vancomycin added per SHC guideline');
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // INTRA-ABDOMINAL INFECTION
    // ════════════════════════════════════════════════════════════════════
    else if (suspectedSource === 'abd') {
      if (isSevereAllergy) {
        results.push(AZTREONAM_2G_Q8, METRONIDAZOLE, VANCO);
      } else if (isHCA) {
        // Healthcare-associated IAI
        if (history.esblRisk) {
          results.push(MEROPENEM_1G_Q8);
        } else {
          results.push(PIPTZ_45_Q8);
        }
        if (history.mrsaRisk || history.enterococcusRisk) results.push(VANCO);
        if (history.vreRisk) results.push(LINEZOLID);
      } else {
        // Community-acquired IAI
        results.push(PIPTZ_45_Q8);
        if (history.mrsaRisk) results.push(VANCO);
        if (history.vreRisk)  results.push(LINEZOLID);
        notes.push('Alternative: Cefepime 2g Q8H + Metronidazole 500mg Q8H (no enterococcal coverage)');
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // SKIN & SKIN STRUCTURE INFECTIONS
    // ════════════════════════════════════════════════════════════════════
    else if (suspectedSource === 'skin') {
      if (isSevereAllergy) {
        results.push(AZTREONAM_2G_Q8, METRONIDAZOLE, VANCO);
      } else if (skinSubtype === 'necrotizing') {
        // Necrotizing fasciitis / Gas gangrene / Myonecrosis
        results.push(PIPTZ_45_Q8, VANCO, CLINDAMYCIN);
        notes.push('Clindamycin added for toxin suppression in necrotizing fasciitis');
      } else if (skinSubtype === 'special') {
        // Special risk factors (malignancy, neutropenia, animal bites, DFU, etc.)
        results.push(CEFEPIME_2G_Q8, METRONIDAZOLE, VANCO);
      } else {
        // Non-purulent cellulitis (default)
        results.push(CEFAZOLIN);
        if (history.mrsaRisk) results.push(VANCO);
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // BACTERIAL MENINGITIS
    // ════════════════════════════════════════════════════════════════════
    else if (suspectedSource === 'meningitis') {
      if (isSevereAllergy) {
        results.push(MOXIFLOXACIN, VANCO);
        if (meningitisAge) results.push(TMPSMX);
      } else if (betaLactamAllergy === 'non-severe') {
        results.push(MEROPENEM_2G_Q8, VANCO);
        if (meningitisAge) results.push(AMPICILLIN);
      } else if (isHCA) {
        // Post-trauma / Post-neurosurgery
        results.push(CEFEPIME_2G_Q8, VANCO);
      } else {
        // Community-acquired
        results.push(CEFTRIAXONE_2G_Q12, VANCO);
        if (meningitisAge) results.push(AMPICILLIN);
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // NO APPARENT SOURCE / VASCULAR ACCESS DEVICE
    // ════════════════════════════════════════════════════════════════════
    else {
      // Always start with Vancomycin for unknown source
      results.push(VANCO);

      if (isSevereAllergy) {
        results.push(AZTREONAM_2G_Q8, METRONIDAZOLE);
      } else if (isHCA) {
        // Healthcare-associated unknown
        if (history.esblRisk) {
          results.push(MEROPENEM_1G_Q8);
        } else {
          results.push(PIPTZ_375_Q8);
          notes.push('Alternative: Cefepime 2g Q8H or Meropenem (ESBL history)');
        }
      } else {
        // Community-acquired unknown
        if (history.esblRisk) {
          results.push(ERTAPENEM_1G_Q24);
        } else {
          results.push(CEFTRIAXONE_2G_Q24);
          notes.push('Alternatives: Ertapenem 1g Q24H (ESBL) or Pip/Tazo 3.375g Q8H');
        }
      }
    }

    // ── Renal note if eGFR is impaired ──────────────────────────────────
    if (e < 60 || onDialysis) {
      notes.push(
        onDialysis
          ? 'Patient on dialysis — dose adjustment required. Refer to SHC Antibiotic Dosing Guide.'
          : `eGFR ${e} mL/min — renal dose adjustment required. Refer to SHC Antibiotic Dosing Guide.`
      );
    }

    return { antibiotics: results, notes };
  }, [patient, egfr]);
}
