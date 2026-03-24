// src/components/AssessmentCard.jsx
// Shows clinical assessment summary and expected pathogens

const PATHOGEN_MAP = {
  lung:    'Streptococcus pneumoniae, Legionella, Pseudomonas (if risk+)',
  uri:     'E. coli, Klebsiella, ESBL Organisms (if risk+)',
  abd:     'Enterobacteriaceae + Anaerobes (Bacteroides fragilis)',
  skin:    'S. aureus (MRSA Risk+), Group A Strep',
  unknown: 'Undifferentiated Pathogens / Empiric Coverage Needed',
};

const AssessmentCard = ({ news2, sirs, suspectedSource }) => (
  <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
      Initial Assessment
    </h3>

    <div>
      <h4 className="text-2xl font-black text-slate-800 leading-tight">
        {news2 >= 5 || sirs >= 2 ? 'High Suspicion of Sepsis' : 'Infection Monitoring'}
      </h4>
      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
        Patient has a NEWS2 of {news2 ?? '?'}. According to current guidelines, this requires
        {news2 >= 5
          ? ' immediate medical review and possible critical care consultation'
          : ' standard observations and review by ward clinicians'}.
      </p>
    </div>

    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">
        Expected Pathogens
      </p>
      <p className="text-sm font-bold text-slate-700 leading-tight">
        {PATHOGEN_MAP[suspectedSource] ?? PATHOGEN_MAP.unknown}
      </p>
    </div>
  </div>
);

export default AssessmentCard;
