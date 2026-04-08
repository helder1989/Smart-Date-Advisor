import { TripType } from '../../interfaces/models/ICommon';

interface TripTypeToggleProps {
  value: TripType;
  onChange: (v: TripType) => void;
}

export const TripTypeToggle = ({ value, onChange }: TripTypeToggleProps) => (
  <div className="flex gap-2 mb-4">
    {([
      { key: 'roundTrip' as const, label: 'Ida e Volta' },
      { key: 'oneWay' as const, label: 'Somente Ida' },
    ]).map(item => (
      <button
        key={item.key}
        type="button"
        onClick={() => onChange(item.key)}
        className={`h-[30px] px-3.5 rounded-[20px] text-xs font-medium border transition-all cursor-pointer ${
          value === item.key
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-onfly-text-secondary border-onfly-border hover:bg-background'
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
);
