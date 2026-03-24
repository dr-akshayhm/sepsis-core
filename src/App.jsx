// src/App.jsx
// Root component — orchestrates state, tabs, and layout

import { useState } from 'react';
import { Activity, Info, ChevronRight } from 'lucide-react';

import PatientPanel   from './components/PatientPanel';
import VitalsPanel    from './components/VitalsPanel';
import StatsGrid      from './components/StatsGrid';
import AssessmentCard from './components/AssessmentCard';
import AntibioticCard from './components/AntibioticCard';

import {
  useRenalCalculations,
  useNEWS2,
  useSIRS,
  useAntibiotics,
} from './hooks/useClinicalCalculations';

// ─── Default patient state ──────────────────────────────────────────────────
const INITIAL_PATIENT = {
  age:       '',
  weight:    '',
  height:    '',
  sex:       'male',
  creatinine: '',
  onDialysis: false,
  history: {
    mrsaRisk:        false,
    pseudomonasRisk: false,
    esblRisk:        false,
  },
  suspectedSource: 'unknown',
  vitals: {
    rr:       '',
    sbp:      '',
    hr:       '',
    temp:     '',
    spo2:     '',
    onOxygen: false,
    acvpu:    'A',
    lactate:  '',
  },
};

// ─── App ────────────────────────────────────────────────────────────────────
const App = () => {
  const [patient,   setPatient]   = useState(INITIAL_PATIENT);
  const [activeTab, setActiveTab] = useState('input');

  // Derived clinical calculations (custom hooks)
  const { egfr, bsa } = useRenalCalculations(patient);
  const news2          = useNEWS2(patient.vitals);
  const sirs           = useSIRS(patient.vitals);
  const antibiotics    = useAntibiotics(patient, egfr);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 font-sans">

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500 rounded-lg text-white">
            <Activity size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">
            Sepsis<span className="text-red-500">Core</span>
          </h1>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'input',  label: 'Patient Data'    },
            { id: 'output', label: 'Clinical Output' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* ─── Main ────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">

        {/* INPUT TAB */}
        {activeTab === 'input' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in">
            <PatientPanel patient={patient} setPatient={setPatient} />
            <VitalsPanel  patient={patient} setPatient={setPatient} />

            <div className="md:col-span-2">
              <button
                onClick={() => setActiveTab('output')}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                Continue to Assessment <ChevronRight size={18} />
              </button>
            </div>
          </div>

        /* OUTPUT TAB */
        ) : (
          <div className="space-y-6 animate-in">

            {/* Quick stats row */}
            <StatsGrid news2={news2} sirs={sirs} egfr={egfr} bsa={bsa} />

            {/* Assessment + antibiotics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AssessmentCard
                news2={news2}
                sirs={sirs}
                suspectedSource={patient.suspectedSource}
              />

              {/* Antibiotics panel */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">
                  Empiric Regimen (IDSA Dosing)
                </h3>
                <div className="space-y-4">
                  {antibiotics.map((abx, i) => (
                    <AntibioticCard key={i} abx={abx} egfr={egfr} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="max-w-5xl mx-auto px-8 pb-12">
        <div className="flex items-center gap-2 justify-center mb-4">
          <div className="h-px bg-slate-200 flex-1" />
          <Info size={14} className="text-slate-300" />
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="text-center mb-4">
          <p className="text-sm font-bold text-slate-600">Created by Dr Akshay HM JSSAHER</p>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-2xl mx-auto uppercase tracking-tighter">
          Calculations based on CKD-EPI 2021 and Bedside Schwartz. Dosing derived from IDSA guidelines.
          Always verify dosages in local pharmacopoeia. NEWS2 score developed by Royal College of Physicians.
        </p>
      </footer>

    </div>
  );
};

export default App;
