import { useState, useEffect } from 'react';
import { IHotelSearchParams } from '../../interfaces/models/IHotel';
import { getHotelDefaults } from '../../constants/defaults';
import { DateInput } from '../shared/DateInput';
import { NumberStepper } from '../shared/NumberStepper';
import { FlexibilitySliders } from '../shared/FlexibilitySliders';

interface HotelFormProps {
  onSubmit?: (params: IHotelSearchParams) => void;
  onChange?: (params: IHotelSearchParams) => void;
  loading?: boolean;
  embedded?: boolean;
}

export const HotelForm = ({ onSubmit, onChange, loading, embedded }: HotelFormProps) => {
  const [params, setParams] = useState<IHotelSearchParams>(getHotelDefaults());

  useEffect(() => {
    onChange?.(params);
  }, [params]);

  return (
    <div className="animate-fade-slide-up-small">
      <div>
        <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Destino</label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
          </svg>
          <input
            value={params.destination}
            onChange={e => setParams(p => ({ ...p, destination: e.target.value }))}
            placeholder="Ex: São Paulo, SP"
            className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <DateInput label="Check-in" value={params.checkIn} onChange={v => setParams(p => ({ ...p, checkIn: v }))} />
        <DateInput label="Check-out" value={params.checkOut} onChange={v => setParams(p => ({ ...p, checkOut: v }))} />
      </div>

      <div className="flex gap-2 mt-3">
        <div className="flex-1">
          <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Hóspedes</label>
          <NumberStepper value={params.guests} min={1} max={8} onChange={v => setParams(p => ({ ...p, guests: v }))} />
        </div>
        <div className="flex-1">
          <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">Quartos</label>
          <NumberStepper value={params.rooms} min={1} max={4} onChange={v => setParams(p => ({ ...p, rooms: v }))} />
        </div>
      </div>

      <FlexibilitySliders
        flexibility={params.flexibility}
        onChange={f => setParams(p => ({ ...p, flexibility: f }))}
        departureLabel="Check-in"
        returnLabel="Check-out"
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
