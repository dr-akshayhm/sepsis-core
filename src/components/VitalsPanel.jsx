// src/components/VitalsPanel.jsx
// Captures NEWS2 vitals, supplemental O2, ACVPU, infection source, and resistance risks

import { Wind, Droplets, Heart, Thermometer, Activity } from 'lucide-react';
import InputField from './InputField';

const RISK_FLAGS = [
  { key: 'mrsaRisk',        label: 'MRSA Risk Factor'   },
  { key: 'pseudomonasRisk', label: 'Pseudomonas Risk'   },
  { key: 'esblRisk',        label: 'ESBL Risk Factor'   },
];

const VitalsPanel = ({ patient, setPatient }) => {
  const updateVitals = (key) => (v) =>
    setPatient((p) => ({ ...p, vitals: { ...p.vitals, [key]: v } }));

  const toggleVitals = (key) => (e) =>
    setPatient((p) => ({ ...p, vitals: { ...p.vitals, [key]: e.target.checked } }));

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
      <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
        <Activity size={16} /> Clinical Vitals (NEWS2)
      </h2>

      {/* Vitals inputs */}
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Resp Rate"  icon={Wind}        value={patient.vitals.rr}      onChange={updateVitals('rr')}      />
        <InputField label="SpO2"       icon={Droplets}    value={patient.vitals.spo2}    onChange={updateVitals('spo2')}    suffix="%" />
        <InputField label="Heart Rate" icon={Heart}       value={patient.vitals.hr}      onChange={updateVitals('hr')}      />
        <InputField label="Temp"       icon={Thermometer} value={patient.vitals.temp}    onChange={updateVitals('temp')}    suffix="°C" />
        <InputField label="Systolic BP" icon={Activity}  value={patient.vitals.sbp}     onChange={updateVitals('sbp')}     />
        <InputField label="Lactate"    icon={Droplets}    value={patient.vitals.lactate} onChange={updateVitals('lactate')} />
      </div>

      {/* Supplemental O2 + ACVPU */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-200 transition-all">
          <input
            type="checkbox"
            checked={patient.vitals.onOxygen}
            onChange={toggleVitals('onOxygen')}
            className="text-blue-600"
          />
          <span className="text-xs font-bold">Supplemental O2</span>
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

      {/* Infection source + resistance flags */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Suspected Source &amp; Risks
          </span>

          <select
            className="w-full bg-slate-100 p-3 rounded-xl text-sm font-medium outline-none cursor-pointer hover:bg-slate-200 transition-all"
            value={patient.suspectedSource}
            onChange={(e) => setPatient((p) => ({ ...p, suspectedSource: e.target.value }))}
          >
            <option value="unknown">Unknown Source</option>
            <option value="lung">Respiratory (Pneumonia)</option>
            <option value="uri">Urinary (UTI/Pyelo)</option>
            <option value="abd">Intra-abdominal</option>
            <option value="skin">Skin/Soft Tissue</option>
          </select>

          <div className="grid grid-cols-1 gap-2 mt-2">
            {RISK_FLAGS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={patient.history[key]}
                  onChange={(e) =>
                    setPatient((p) => ({ ...p, history: { ...p.history, [key]: e.target.checked } }))
                  }
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VitalsPanel;
