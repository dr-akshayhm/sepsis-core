// src/components/AntibioticCard.jsx
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AntibioticCard = ({ abx, egfr, onDialysis }) => {
  const renalWarning = (egfr !== null && egfr < 60) || onDialysis;

  return (
    <div className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-blue-200 transition-all shadow-sm group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{abx.role}</p>
          <h5 className="text-xl font-bold text-slate-800">{abx.name}</h5>
        </div>
        <CheckCircle2 className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dose</p>
          <p className="text-lg font-black text-slate-700">{abx.dose}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Frequency</p>
          <p className="text-lg font-black text-blue-700">{abx.freq}</p>
        </div>
      </div>

      {/* Drug-specific note */}
      {abx.note && (
        <p className="mt-3 text-[11px] text-slate-500 italic border-l-2 border-slate-200 pl-3">
          {abx.note}
        </p>
      )}

      {/* Renal warning */}
      {renalWarning && abx.name !== 'Vancomycin' && abx.name !== 'Azithromycin' && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle size={12} />
          Renal dose adjustment required — refer to SHC Antibiotic Dosing Guide
        </div>
      )}
    </div>
  );
};

export default AntibioticCard;
