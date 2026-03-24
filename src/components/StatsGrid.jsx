// src/components/StatsGrid.jsx
// Displays four summary tiles: NEWS2, SIRS, eGFR, BSA

const StatsGrid = ({ news2, sirs, egfr, bsa }) => {
  const stats = [
    {
      label: 'NEWS2 Score',
      val: news2 ?? '--',
      sub: news2 >= 5 ? 'High Risk' : 'Low Risk',
      color: news2 >= 5 ? 'text-red-600' : 'text-slate-800',
    },
    {
      label: 'SIRS Criteria',
      val: `${sirs}/3`,
      sub: sirs >= 2 ? 'SIRS Positive' : 'SIRS Negative',
      color: 'text-slate-800',
    },
    {
      label: 'eGFR (CKD-EPI)',
      val: egfr ?? '--',
      sub: 'mL/min/1.73m²',
      color: 'text-blue-600',
    },
    {
      label: 'BSA',
      val: bsa ?? '--',
      sub: 'm²',
      color: 'text-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {stat.label}
          </span>
          <span className={`text-3xl font-black ${stat.color}`}>{stat.val}</span>
          <span className="text-[10px] text-slate-500 font-medium mt-1 uppercase">{stat.sub}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
