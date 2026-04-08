import { Modality } from '../../interfaces/models/ICommon';
import { IFlightSearchParams } from '../../interfaces/models/IFlight';
import { IHotelSearchParams } from '../../interfaces/models/IHotel';
import { ICarSearchParams } from '../../interfaces/models/ICar';
import { IBusSearchParams } from '../../interfaces/models/IBus';
import { formatDateRange } from '../../utils/formatters';

interface RouteChipProps {
  modality: Modality;
  params: IFlightSearchParams | IHotelSearchParams | ICarSearchParams | IBusSearchParams;
}

export const RouteChip = ({ modality, params }: RouteChipProps) => {
  let text = '';

  switch (modality) {
    case 'aereo': {
      const p = params as IFlightSearchParams;
      text = `${p.origin} → ${p.destination} · ${formatDateRange(p.departureDate, p.returnDate)} · ${p.travelers} viajante${p.travelers > 1 ? 's' : ''}`;
      break;
    }
    case 'hotel': {
      const p = params as IHotelSearchParams;
      text = `${p.destination} · ${formatDateRange(p.checkIn, p.checkOut)} · ${p.guests} hóspede${p.guests > 1 ? 's' : ''} / ${p.rooms} quarto${p.rooms > 1 ? 's' : ''}`;
      break;
    }
    case 'carro': {
      const p = params as ICarSearchParams;
      text = `${p.pickupLocation} · ${formatDateRange(p.pickupDate, p.dropoffDate)}`;
      break;
    }
    case 'onibus': {
      const p = params as IBusSearchParams;
      text = `${p.origin} → ${p.destination} · ${formatDateRange(p.departureDate, p.returnDate)} · ${p.passengers} passageiro${p.passengers > 1 ? 's' : ''}`;
      break;
    }
  }

  return (
    <div className="flex justify-center mb-3">
      <span className="bg-onfly-info-bg border border-onfly-info-border text-onfly-info-text text-xs font-mono rounded-full px-3.5 py-1">
        {text}
      </span>
    </div>
  );
};
