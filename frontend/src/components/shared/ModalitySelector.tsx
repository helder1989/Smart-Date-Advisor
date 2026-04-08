import { Modality } from '../../interfaces/models/ICommon';
import { ModalityIcon } from '../icons/ModalityIcon';
import { MODALITY_CONFIG } from '../../constants/modalities';

interface ModalitySelectorProps {
  selected: Modality;
  onChange: (modality: Modality) => void;
}

const modalities: Modality[] = ['aereo', 'hotel', 'carro', 'onibus'];

export const ModalitySelector = ({ selected, onChange }: ModalitySelectorProps) => (
  <div className="flex gap-1.5">
    {modalities.map(m => {
      const isActive = m === selected;
      return (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={`Selecionar ${MODALITY_CONFIG[m].label}`}
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border-[1.5px] transition-all duration-150 cursor-pointer ${
            isActive
              ? 'bg-secondary border-primary text-primary shadow-[0_0_0_3px_rgba(0,82,204,0.10)]'
              : 'bg-card border-onfly-border text-onfly-text-secondary hover:bg-background'
          }`}
        >
          <ModalityIcon modality={m} size={22} />
          <span className="text-[11px] font-medium">{MODALITY_CONFIG[m].label}</span>
        </button>
      );
    })}
  </div>
);
