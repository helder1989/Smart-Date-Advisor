import { useState, useCallback } from 'react';
import { TransportType } from '../../interfaces/models/ICommon';
import { IFlightSearchParams } from '../../interfaces/models/IFlight';
import { IBusSearchParams } from '../../interfaces/models/IBus';
import { FlightForm } from '../forms/FlightForm';
import { BusForm } from '../forms/BusForm';
import { Plane, Bus } from 'lucide-react';

interface TransportStepProps {
  onTransportChange: (type: TransportType, params: IFlightSearchParams | IBusSearchParams) => void;
}

export function TransportStep({ onTransportChange }: TransportStepProps) {
  const [transportType, setTransportType] = useState<TransportType>('aereo');

  const handleFlightChange = useCallback((params: IFlightSearchParams) => {
    onTransportChange('aereo', params);
  }, [onTransportChange]);

  const handleBusChange = useCallback((params: IBusSearchParams) => {
    onTransportChange('onibus', params);
  }, [onTransportChange]);

  return (
    <div className="animate-fade-slide-up-small">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTransportType('aereo')}
          className={`flex-1 h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer
            ${transportType === 'aereo'
              ? 'bg-secondary border-primary text-primary shadow-sm'
              : 'bg-card border-onfly-border text-onfly-text-secondary hover:border-onfly-border-hover'
            }`}
        >
          <Plane className="w-4 h-4" />
          Voo
        </button>
        <button
          onClick={() => setTransportType('onibus')}
          className={`flex-1 h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer
            ${transportType === 'onibus'
              ? 'bg-secondary border-primary text-primary shadow-sm'
              : 'bg-card border-onfly-border text-onfly-text-secondary hover:border-onfly-border-hover'
            }`}
        >
          <Bus className="w-4 h-4" />
          Rodoviario
        </button>
      </div>

      {transportType === 'aereo' ? (
        <FlightForm embedded onChange={handleFlightChange} />
      ) : (
        <BusForm embedded onChange={handleBusChange} />
      )}
    </div>
  );
}
