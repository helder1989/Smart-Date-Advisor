import { useState, useEffect } from 'react';
import { calculateCombinations } from '../../utils/calculations';
import { IFlexibility } from '../../interfaces/models/ICommon';

interface FlexibilitySlidersProps {
  flexibility: IFlexibility;
  onChange: (f: IFlexibility) => void;
  departureLabel?: string;
  returnLabel?: string;
}

export const FlexibilitySliders = ({
  flexibility,
  onChange,
  departureLabel = 'Ida',
  returnLabel = 'Volta',
}: FlexibilitySlidersProps) => {
  const [depPop, setDepPop] = useState(false);
  const [retPop, setRetPop] = useState(false);

  const combinations = calculateCombinations(flexibility.departureDays, flexibility.returnDays);

  useEffect(() => {
    setDepPop(true);
    const t = setTimeout(() => setDepPop(false), 150);
    return () => clearTimeout(t);
  }, [flexibility.departureDays]);

  useEffect(() => {
    setRetPop(true);
    const t = setTimeout(() => setRetPop(false), 150);
    return () => clearTimeout(t);
  }, [flexibility.returnDays]);

  return (
    <div className="mt-5">
      <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium">
        Flexibilidade de datas
      </label>

      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-onfly-text-secondary w-16">{departureLabel}</span>
          <input
            type="range"
            min={0}
            max={7}
            step={1}
            value={flexibility.departureDays}
            onChange={e => onChange({ ...flexibility, departureDays: Number(e.target.value) })}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, hsl(214 100% 40%) ${(flexibility.departureDays / 7) * 100}%, hsl(214 20% 90%) ${(flexibility.departureDays / 7) * 100}%)`,
            }}
          />
          <span
            className={`font-mono text-[13px] bg-secondary text-primary rounded-full px-2.5 py-0.5 min-w-[60px] text-center ${
              depPop ? 'animate-pill-pop' : ''
            }`}
          >
            ± {flexibility.departureDays} dias
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-onfly-text-secondary w-16">{returnLabel}</span>
          <input
            type="range"
            min={0}
            max={7}
            step={1}
            value={flexibility.returnDays}
            onChange={e => onChange({ ...flexibility, returnDays: Number(e.target.value) })}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, hsl(214 100% 40%) ${(flexibility.returnDays / 7) * 100}%, hsl(214 20% 90%) ${(flexibility.returnDays / 7) * 100}%)`,
            }}
          />
          <span
            className={`font-mono text-[13px] bg-secondary text-primary rounded-full px-2.5 py-0.5 min-w-[60px] text-center ${
              retPop ? 'animate-pill-pop' : ''
            }`}
          >
            ± {flexibility.returnDays} dias
          </span>
        </div>
      </div>

      <div className="mt-3 bg-onfly-info-bg border border-onfly-info-border rounded-lg px-3 py-2.5 flex items-start gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary mt-0.5 flex-shrink-0">
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" fill="currentColor"/>
        </svg>
        <span className="text-[13px] text-onfly-info-text">
          Verificaremos <span className="font-mono font-medium">{combinations}</span> combinacoes de datas.
        </span>
      </div>
    </div>
  );
};
