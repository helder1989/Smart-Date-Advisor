import { useState, useEffect } from 'react';
import { IBusSearchParams } from '../../interfaces/models/IBus';
import { getBusDefaults } from '../../constants/defaults';
import { TripTypeToggle } from '../shared/TripTypeToggle';
import { SwapButton } from '../shared/SwapButton';
import { DateInput } from '../shared/DateInput';
import { NumberStepper } from '../shared/NumberStepper';
import { FlexibilitySliders } from '../shared/FlexibilitySliders';

interface BusFormProps {
  onSubmit?: (params: IBusSearchParams) => void;
  onChange?: (params: IBusSearchParams) => void;
  loading?: boolean;
  embedded?: boolean;
}

export const BusForm = ({ onSubmit, onChange, loading, embedded }: BusFormProps) => {
  const [params, setParams] = useState<IBusSearchParams>(getBusDefaults());

  useEffect(() => {
    onChange?.(params);
  }, [params]);

  const handleSwap = () => {
    setParams(p => ({
      ...p,
      origin: p.destination,
      destination: p.origin,
    }));
  };

  return (
    <div className="animate-fade-slide-up-small">
      <TripTypeToggle value={params.tripType} onChange={v => setParams(p => ({ ...p, tripType: v }))} />

      <div>
        <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Cidade de origem</label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
          </svg>
          <input
            value={params.origin}
            onChange={e => setParams(p => ({ ...p, origin: e.target.value }))}
            placeholder="Ex: São Paulo, SP"
            className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      </div>

      <SwapButton onSwap={handleSwap} />

      <div>
        <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Cidade de destino</label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
          </svg>
          <input
            value={params.destination}
            onChange={e => setParams(p => ({ ...p, destination: e.target.value }))}
            placeholder="Ex: Brasília, DF"
            className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <DateInput label="Data de ida" value={params.departureDate} onChange={v => setParams(p => ({ ...p, departureDate: v }))} />
        {params.tripType === 'roundTrip' && (
          <DateInput label="Data de volta" value={params.returnDate || ''} onChange={v => setParams(p => ({ ...p, returnDate: v }))} />
        )}
      </div>

      <div className="mt-3">
        <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Passageiros</label>
        <NumberStepper value={params.passengers} min={1} max={6} onChange={v => setParams(p => ({ ...p, passengers: v }))} />
      </div>

      <FlexibilitySliders
        flexibility={params.flexibility}
        onChange={f => setParams(p => ({ ...p, flexibility: f }))}
      />

      {!embedded && (
        <button
          onClick={() => onSubmit?.(params)}
          disabled={loading}
          className="w-full h-12 rounded-[10px] bg-primary text-primary-foreground font-semibold text-[15px] mt-5 hover:bg-onfly-blue-hover active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" fill="currentColor"/>
          </svg>
          Analisar Datas
        </button>
      )}
    </div>
  );
};
