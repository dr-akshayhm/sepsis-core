// src/components/AssessmentCard.jsx

const PATHOGEN_MAP = {
  lung:       'S. pneumoniae, H. influenzae, Legionella, Pseudomonas (if risk+), MRSA (if risk+)',
  uri:        'E. coli, Klebsiella, ESBL organisms (if risk+), Enterococcus (if GPC on GS)',
  abd:        'Enterobacteriaceae, Anaerobes (B. fragilis), Enterococcus (healthcare), VRE (if risk+)',
  skin:       'S. aureus (MRSA risk+), Group A Strep, Gram-negatives (special risk factors)',
  meningitis: 'S. pneumoniae, N. meningitidis, Listeria (age >50 / immunocompromised)',
  unknown:    'Undifferentiated — empiric broad-spectrum coverage required',
};

const SOURCE_LABEL = {
  lung:       'Respiratory (Pneumonia)',
  uri:        'Urinary Tract',
  abd:        'Intra-abdominal',
  skin:       'Skin & Soft Tissue',
  meningitis: 'Bacterial Meningitis',
  unknown:    'Unknown / Vascular Access',
};

const AssessmentCard = ({ news2, sirs, suspectedSource, acquisitionType, betaLactamAllergy }) => (
  <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Initial Assessment</h3>

    <div>
      <h4 className="text-2xl font-black text-slate-800 leading-tight">
        {news2 >= 5 || sirs >= 2 ? 'High Suspicion of Sepsis' : 'Infection Monitoring'}
      </h4>
      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
        NEWS2 of {news2 ?? '?'}.{' '}
        {news2 >= 5
          ? 'Requires immediate medical review and possible critical care consultation.'
          : 'Standard observations and review by ward clinicians.'}
      </p>
    </div>

    {/* Source */}
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Infection Source</p>
      <p className="text-sm font-bold text-slate-700">{SOURCE_LABEL[suspectedSource] ?? 'Unknown'}</p>
      <p className="text-[11px] text-slate-500 capitalize">
        {acquisitionType === 'healthcare' ? 'Healthcare-Associated' : 'Community-Acquired'}
      </p>
    </div>

    {/* Allergy alert */}
    {betaLactamAllergy !== 'none' && (
      <div className={`p-3 rounded-xl border text-xs font-bold ${
        betaLactamAllergy === 'severe'
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        ⚠ {betaLactamAllergy === 'severe' ? 'Severe' : 'Non-severe'} Beta-Lactam Allergy — alternative regimen selected
      </div>
    )}

    {/* Pathogens */}
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Expected Pathogens</p>
      <p className="text-xs font-bold text-slate-700 leading-relaxed">
        {PATHOGEN_MAP[suspectedSource] ?? PATHOGEN_MAP.unknown}
      </p>
    </div>
  </div>
);

export default AssessmentCard;
