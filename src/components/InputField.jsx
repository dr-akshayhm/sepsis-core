// src/components/InputField.jsx
// Reusable labelled input with optional icon and suffix unit

const InputField = ({ label, icon: Icon, value, onChange, type = "text", suffix = "" }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
      <Icon size={12} className="text-slate-400" />
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export default InputField;
