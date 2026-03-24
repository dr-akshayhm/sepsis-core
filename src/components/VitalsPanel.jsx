// src/components/VitalsPanel.jsx
// Captures NEWS2 vitals + infection context fields (source, acquisition, allergy, risk flags)

import { Wind, Droplets, Heart, Thermometer, Activity } from 'lucide-react';
import InputField from './InputField';

const VitalsPanel = ({ patient, setPatient }) => {
  const updateVitals = (key) => (v) =>
    setPatient((p) => ({ ...p, vitals: { ...p.vitals, [key]: v } }));

  const toggleVitals = (key) => (e) =>
    setPatient((p) => ({ ...p, vitals: { ...p.vitals, [key]: e.target.checked } }));

  const toggleHistory = (key) => (e) =>
    setPatient((p) => ({ ...p, history: { ...p.history, [key]: e.target.checked } }));

  const showPneumoniaSubtype  = patient.suspectedSource === 'lung';
  const showSkinSubtype       = patient.suspectedSource === 'skin';
  const showMeningitisAge     = patient.suspectedSource === 'meningitis';

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
      <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
        <Activity size={16} /> Clinical Vitals (NEWS2)
      </h2>

      {/* Vitals grid */}
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Resp Rate"   icon={Wind}        value={patient.vitals.rr}      onChange={updateVitals('rr')}      />
        <InputField label="SpO2"        icon={Droplets}    value={patient.vitals.spo2}    onChange={updateVitals('spo2')}    suffix="%" />
        <InputField label="Heart Rate"  icon={Heart}       value={patient.vitals.hr}      onChange={updateVitals('hr')}      />
        <InputField label="Temp"        icon={Thermometer} value={patient.vitals.temp}    onChange={updateVitals('temp')}    suffix="°C" />
        <InputField label="Systolic BP" icon={Activity}    value={patient.vitals.sbp}     onChange={updateVitals('sbp')}     />
        <InputField label="Lactate"     icon={Droplets}    value={patient.vitals.lactate} onChange={updateVitals('lactate')} />
      </div>

      {/* O2 + ACVPU */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-200 transition-all">
          <input type="checkbox" checked={patient.vitals.onOxygen} onChange={toggleVitals('onOxygen')} className="text-blue-600" />
          <span className="text-xs font-bold">Supplemental O₂</span>
        </label>
        <select
          className="w-full bg-slate-100 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-slate-200 transition-all"
          value={patient.vitals.acvpu}
          onChange={(e) => setPatient((p) => ({ ...p, vitals: { ...p.vitals, acvpu: e.target.value } }))}
        >
          <option value="A">Alert (A)</option>
          <option value="C">New Confusion (C)</option>
          <option value="V">Voice Response (V)</option>
          <option value="P">Pain Response (P)</option>
          <option value="U">Unresponsive (U)</option>
        </select>
      </div>

      {/* ── Infection Context ─────────────────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase">Infection Context</span>

        {/* Suspected Source */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Suspected Source</label>
          <select
            className="w-full bg-slate-100 p-3 rounded-xl text-sm font-medium outline-none cursor-pointer hover:bg-slate-200 transition-all"
            value={patient.suspectedSource}
            onChange={(e) => setPatient((p) => ({ ...p, suspectedSource: e.target.value }))}
          >
            <option value="unknown">Unknown / Vascular Access Device</option>
            <option value="lung">Respiratory (Pneumonia)</option>
            <option value="uri">Urinary Tract (UTI / Pyelo)</option>
            <option value="abd">Intra-abdominal</option>
            <option value="skin">Skin &amp; Soft Tissue</option>
            <option value="meningitis">Bacterial Meningitis</option>
          </select>
        </div>

        {/* Pneumonia subtype */}
        {showPneumoniaSubtype && (
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Pneumonia Type</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[{ v: 'cap', l: 'CAP' }, { v: 'hap', l: 'HAP / VAP' }].map(({ v, l }) => (
                <button key={v}
                  onClick={() => setPatient((p) => ({ ...p, pneumoniaSubtype: v }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${patient.pneumoniaSubtype === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skin subtype */}
        {showSkinSubtype && (
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">SSTI Subtype</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { v: 'cellulitis',  l: 'Cellulitis' },
                { v: 'necrotizing', l: 'Necrotizing' },
                { v: 'special',     l: 'Special Risk' },
              ].map(({ v, l }) => (
                <button key={v}
                  onClick={() => setPatient((p) => ({ ...p, skinSubtype: v }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${patient.skinSubtype === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Acquisition type */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Acquisition</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[{ v: 'community', l: 'Community' }, { v: 'healthcare', l: 'Healthcare-Associated' }].map(({ v, l }) => (
              <button key={v}
                onClick={() => setPatient((p) => ({ ...p, acquisitionType: v }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${patient.acquisitionType === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Beta-lactam allergy */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Beta-Lactam Allergy</label>
          <select
            className="w-full bg-slate-100 p-3 rounded-xl text-sm font-medium outline-none cursor-pointer hover:bg-slate-200 transition-all"
            value={patient.betaLactamAllergy}
            onChange={(e) => setPatient((p) => ({ ...p, betaLactamAllergy: e.target.value }))}
          >
            <option value="none">None / Low Risk</option>
            <option value="non-severe">Non-Severe (rash, GI intolerance)</option>
            <option value="severe">Severe (anaphylaxis, angioedema, SJS/TEN)</option>
          </select>
        </div>

        {/* Meningitis age flag */}
        {showMeningitisAge && (
          <label className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
            <input type="checkbox" checked={patient.meningitisAge}
              onChange={(e) => setPatient((p) => ({ ...p, meningitisAge: e.target.checked }))}
              className="text-blue-600" />
            <span className="text-xs font-bold text-amber-800">Age &gt;50 years or Immunocompromised</span>
          </label>
        )}
      </div>

      {/* ── Resistance & Risk Flags ───────────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase">Resistance &amp; Risk Flags</span>
        {[
          { key: 'mrsaRisk',             label: 'MRSA Risk (respiratory/skin culture, IV ABX in 90d)' },
          { key: 'pseudomonasRisk',      label: 'Pseudomonas Risk (prior culture within 1 year)'      },
          { key: 'esblRisk',             label: 'ESBL History (prior culture / known colonisation)'    },
          { key: 'resistantOrganismRisk',label: 'Resistant organism in culture (past 12 months)'       },
          { key: 'enterococcusRisk',     label: 'Enterococcus Risk (post-op, immunocompromised)'       },
          { key: 'vreRisk',              label: 'VRE Risk (known colonisation or prior invasive infxn)'},
          { key: 'gpcGramStain',         label: 'GPC on Urine Gram Stain'                              },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-xs font-medium text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-all">
            <input
              type="checkbox"
              checked={patient.history[key]}
              onChange={toggleHistory(key)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            {label}
          </label>
        ))}
      </div>
    </section>
  );
};

export default VitalsPanel;
