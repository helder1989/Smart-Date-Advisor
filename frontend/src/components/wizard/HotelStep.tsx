import { useCallback } from 'react';
import { IHotelSearchParams } from '../../interfaces/models/IHotel';
import { HotelForm } from '../forms/HotelForm';

interface HotelStepProps {
  onHotelChange: (params: IHotelSearchParams) => void;
}

export function HotelStep({ onHotelChange }: HotelStepProps) {
  const handleChange = useCallback((params: IHotelSearchParams) => {
    onHotelChange(params);
  }, [onHotelChange]);

  return (
    <div className="animate-fade-slide-up-small">
      <HotelForm embedded onChange={handleChange} />
    </div>
  );
}
