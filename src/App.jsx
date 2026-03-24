// src/App.jsx
import { useState } from 'react';
import { Activity, Info, ChevronRight } from 'lucide-react';

import PatientPanel   from './components/PatientPanel';
import VitalsPanel    from './components/VitalsPanel';
import StatsGrid      from './components/StatsGrid';
import AssessmentCard from './components/AssessmentCard';
import AntibioticCard from './components/AntibioticCard';
import NotesPanel     from './components/NotesPanel';

import {
  useRenalCalculations,
  useNEWS2,
  useSIRS,
  useAntibiotics,
} from './hooks/useClinicalCalculations';

const INITIAL_PATIENT = {
  age:        '',
  weight:     '',
  height:     '',
  sex:        'male',
  creatinine: '',
  onDialysis: false,

  // Infection context
  suspectedSource:   'unknown',  // unknown | lung | uri | abd | skin | meningitis
  acquisitionType:   'community',// community | healthcare
  pneumoniaSubtype:  'cap',      // cap | hap
  skinSubtype:       'cellulitis',// cellulitis | necrotizing | special
  meningitisAge:     false,      // age >50 or immunocompromised
  betaLactamAllergy: 'none',     // none | non-severe | severe

  history: {
    mrsaRisk:             false,
    pseudomonasRisk:      false,
    esblRisk:             false,
    resistantOrganismRisk:false,
    enterococcusRisk:     false,
    vreRisk:              false,
    gpcGramStain:         false,
  },

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

const App = () => {
  const [patient,   setPatient]   = useState(INITIAL_PATIENT);
  const [activeTab, setActiveTab] = useState('input');

  const { egfr, bsa }          = useRenalCalculations(patient);
  const news2                   = useNEWS2(patient.vitals);
  const sirs                    = useSIRS(patient.vitals);
  const { antibiotics, notes }  = useAntibiotics(patient, egfr);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500 rounded-lg text-white">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">
              Sepsis<span className="text-red-500">Core</span>
            </h1>
            <p className="text-[10px] text-slate-400 leading-none">SHC SASS Guide 01/2025</p>
          </div>
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

      {/* Main */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">

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

        ) : (
          <div className="space-y-6 animate-in">
            <StatsGrid news2={news2} sirs={sirs} egfr={egfr} bsa={bsa} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AssessmentCard
                news2={news2}
                sirs={sirs}
                suspectedSource={patient.suspectedSource}
                acquisitionType={patient.acquisitionType}
                betaLactamAllergy={patient.betaLactamAllergy}
              />

              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
                    Empiric Regimen
                  </h3>
                  <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-lg">
                    SHC SASS Guide 01/2025
                  </span>
                </div>

                <div className="space-y-4">
                  {antibiotics.map((abx, i) => (
                    <AntibioticCard key={i} abx={abx} egfr={egfr} onDialysis={patient.onDialysis} />
                  ))}
                </div>

                {notes.length > 0 && <NotesPanel notes={notes} />}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-8 pb-12">
        <div className="flex items-center gap-2 justify-center mb-4">
          <div className="h-px bg-slate-200 flex-1" />
          <Info size={14} className="text-slate-300" />
          <div className="h-px bg-slate-200 flex-1" />
        </div>
        <div className="text-center mb-3">
          <p className="text-sm font-bold text-slate-600">Created by Dr Akshay HM JSSAHER</p>
        </div>
        <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-2xl mx-auto uppercase tracking-tighter">
          Antibiotic regimens based on Stanford Health Care SHC Sepsis Empiric Antibiotic Selection Guide (SASS Program, 01/2025).
          Dosing shown for normal renal function — refer to SHC Antibiotic Dosing Guide for renal/obesity adjustments.
          NEWS2 © Royal College of Physicians · CKD-EPI 2021 © NKF/ASN.
          Always verify with local pharmacopoeia and current guidelines.
        </p>
      </footer>
    </div>
  );
};

export default App;
