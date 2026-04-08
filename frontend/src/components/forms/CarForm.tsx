import { useState, useEffect } from 'react';
import { ICarSearchParams } from '../../interfaces/models/ICar';
import { getCarDefaults } from '../../constants/defaults';
import { DateInput } from '../shared/DateInput';
import { FlexibilitySliders } from '../shared/FlexibilitySliders';

interface CarFormProps {
  onSubmit?: (params: ICarSearchParams) => void;
  onChange?: (params: ICarSearchParams) => void;
  loading?: boolean;
  embedded?: boolean;
}

export const CarForm = ({ onSubmit, onChange, loading, embedded }: CarFormProps) => {
  const [params, setParams] = useState<ICarSearchParams>(getCarDefaults());

  useEffect(() => {
    onChange?.(params);
  }, [params]);

  return (
    <div className="animate-fade-slide-up-small">
      <div>
        <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Local de retirada</label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
          </svg>
          <input
            value={params.pickupLocation}
            onChange={e => setParams(p => ({ ...p, pickupLocation: e.target.value }))}
            placeholder="Ex: São Paulo, SP"
            className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <DateInput label="Data de retirada" value={params.pickupDate} onChange={v => setParams(p => ({ ...p, pickupDate: v }))} />
        <DateInput label="Data de devolução" value={params.dropoffDate} onChange={v => setParams(p => ({ ...p, dropoffDate: v }))} />
      </div>

      <div className="flex gap-2 mt-3">
        <div className="flex-1">
          <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Hora de retirada</label>
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
            </svg>
            <input
              type="time"
              value={params.pickupTime}
              onChange={e => setParams(p => ({ ...p, pickupTime: e.target.value }))}
              className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all font-mono"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Hora de devolução</label>
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
            </svg>
            <input
              type="time"
              value={params.dropoffTime}
              onChange={e => setParams(p => ({ ...p, dropoffTime: e.target.value }))}
              className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>

      <FlexibilitySliders
        flexibility={params.flexibility}
        onChange={f => setParams(p => ({ ...p, flexibility: f }))}
        departureLabel="Retirada"
        returnLabel="Devolução"
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
