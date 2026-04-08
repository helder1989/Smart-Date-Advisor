import { useState, useEffect } from 'react';

interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export const NumberStepper = ({ value, min, max, onChange }: NumberStepperProps) => {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setPop(true);
    const t = setTimeout(() => setPop(false), 150);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Diminuir"
        onClick={() => value > min && onChange(value - 1)}
        className="w-7 h-7 rounded-full border border-onfly-border bg-card flex items-center justify-center text-onfly-text-secondary hover:bg-background transition-colors cursor-pointer"
      >
        –
      </button>
      <span
        className={`font-mono font-medium text-[16px] min-w-[32px] text-center text-foreground ${
          pop ? 'animate-pill-pop' : ''
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => value < max && onChange(value + 1)}
        className="w-7 h-7 rounded-full border border-onfly-border bg-card flex items-center justify-center text-onfly-text-secondary hover:bg-background transition-colors cursor-pointer"
      >
        +
      </button>
    </div>
  );
};
