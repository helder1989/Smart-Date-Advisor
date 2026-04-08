interface DateInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export const DateInput = ({ label, value, onChange }: DateInputProps) => (
  <div className="flex-1">
    <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">
      {label}
    </label>
    <div className="relative">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="currentColor"/>
      </svg>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all font-mono"
      />
    </div>
  </div>
);
