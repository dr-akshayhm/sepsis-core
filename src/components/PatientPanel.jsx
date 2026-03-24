// src/components/PatientPanel.jsx
// Collects patient demographics and renal data

import { Clock, Activity, Beaker } from 'lucide-react';
import InputField from './InputField';

const PatientPanel = ({ patient, setPatient }) => (
  <section className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
    <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
      <Activity size={16} /> Patient &amp; Renal
    </h2>

    {/* Demographics grid */}
    <div className="grid grid-cols-2 gap-4">
      <InputField
        label="Age"
        icon={Clock}
        value={patient.age}
        onChange={(v) => setPatient((p) => ({ ...p, age: v }))}
        suffix="Yrs"
      />
      <InputField
        label="Weight"
        icon={Activity}
        value={patient.weight}
        onChange={(v) => setPatient((p) => ({ ...p, weight: v }))}
        suffix="kg"
      />
      <InputField
        label="Height"
        icon={Activity}
        value={patient.height}
        onChange={(v) => setPatient((p) => ({ ...p, height: v }))}
        suffix="cm"
      />
      <InputField
        label="Creatinine"
        icon={Beaker}
        value={patient.creatinine}
        onChange={(v) => setPatient((p) => ({ ...p, creatinine: v }))}
        suffix="mg/dL"
      />
    </div>

    {/* Biological sex toggle */}
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase">Biological Sex</span>
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {['male', 'female'].map((s) => (
          <button
            key={s}
            onClick={() => setPatient((p) => ({ ...p, sex: s }))}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              patient.sex === s ? 'bg-white shadow-sm' : ''
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>

    {/* Dialysis checkbox */}
    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent">
      <input
        type="checkbox"
        checked={patient.onDialysis}
        onChange={(e) => setPatient((p) => ({ ...p, onDialysis: e.target.checked }))}
        className="w-4 h-4 rounded text-blue-600"
      />
      <span className="text-xs font-bold text-slate-600">Patient on IHD (Dialysis)</span>
    </label>
  </section>
);

export default PatientPanel;
