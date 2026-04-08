import { useRef } from 'react';
import { Modality } from '../../interfaces/models/ICommon';
import { IFlightSearchParams } from '../../interfaces/models/IFlight';
import { IHotelSearchParams } from '../../interfaces/models/IHotel';
import { ICarSearchParams } from '../../interfaces/models/ICar';
import { IBusSearchParams } from '../../interfaces/models/IBus';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { ModalitySelector } from '../shared/ModalitySelector';
import { FlightForm } from '../forms/FlightForm';
import { HotelForm } from '../forms/HotelForm';
import { CarForm } from '../forms/CarForm';
import { BusForm } from '../forms/BusForm';

interface FormScreenProps {
  userInitials: string;
  modality: Modality;
  onModalityChange: (m: Modality) => void;
  onSubmit: (modality: Modality, params: IFlightSearchParams | IHotelSearchParams | ICarSearchParams | IBusSearchParams) => void;
  loading: boolean;
}

export const FormScreen = ({ userInitials, modality, onModalityChange, onSubmit, loading }: FormScreenProps) => {
  const formRef = useRef<HTMLDivElement>(null);

  const handleModalityChange = (m: Modality) => {
    onModalityChange(m);
  };

  const renderForm = () => {
    switch (modality) {
      case 'aereo':
        return <FlightForm onSubmit={p => onSubmit('aereo', p)} loading={loading} />;
      case 'hotel':
        return <HotelForm onSubmit={p => onSubmit('hotel', p)} loading={loading} />;
      case 'carro':
        return <CarForm onSubmit={p => onSubmit('carro', p)} loading={loading} />;
      case 'onibus':
        return <BusForm onSubmit={p => onSubmit('onibus', p)} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-slide-up">
      <Header userInitials={userInitials} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="text-base font-semibold text-foreground">Analisador de Datas</h1>
        <p className="text-[13px] text-onfly-text-secondary mt-0.5">
          Encontre o melhor dia para voar e economize
        </p>

        <div className="mt-4">
          <ModalitySelector selected={modality} onChange={handleModalityChange} />
        </div>

        <div className="mt-5" ref={formRef} key={modality}>
          {renderForm()}
        </div>
      </div>
      <Footer />
    </div>
  );
};
