import { Modality } from '../interfaces/models/ICommon';

export const MODALITY_CONFIG: Record<Modality, { label: string; searchLabel: string }> = {
  aereo: { label: 'Aéreo', searchLabel: 'Buscar esse voo' },
  hotel: { label: 'Hotel', searchLabel: 'Buscar hotel' },
  carro: { label: 'Carro', searchLabel: 'Buscar carro' },
  onibus: { label: 'Ônibus', searchLabel: 'Buscar ônibus' },
};
