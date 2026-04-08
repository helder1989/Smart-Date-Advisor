import { useCallback } from 'react';
import { ICarSearchParams } from '../../interfaces/models/ICar';
import { CarForm } from '../forms/CarForm';

interface CarStepProps {
  onCarChange: (params: ICarSearchParams) => void;
}

export function CarStep({ onCarChange }: CarStepProps) {
  const handleChange = useCallback((params: ICarSearchParams) => {
    onCarChange(params);
  }, [onCarChange]);

  return (
    <div className="animate-fade-slide-up-small">
      <CarForm embedded onChange={handleChange} />
    </div>
  );
}
