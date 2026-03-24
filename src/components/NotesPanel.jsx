// src/components/NotesPanel.jsx
// Renders clinical notes / de-escalation reminders below the antibiotic list

import { Info } from 'lucide-react';

const NotesPanel = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
      <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
        <Info size={12} /> Clinical Notes &amp; Alternatives
      </p>
      <ul className="space-y-1.5">
        {notes.map((note, i) => (
          <li key={i} className="text-xs text-sky-800 flex items-start gap-2">
            <span className="mt-0.5 text-sky-400">•</span>
            {note}
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-sky-600 pt-1 border-t border-sky-200">
        De-escalate all empiric regimens based on culture results per SHC guidelines.
      </p>
    </div>
  );
};

export default NotesPanel;
