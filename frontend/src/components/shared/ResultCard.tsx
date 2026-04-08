import { Modality, ISearchResultBase } from '../../interfaces/models/ICommon';
import { IFlightResult } from '../../interfaces/models/IFlight';
import { IHotelResult } from '../../interfaces/models/IHotel';
import { ICarResult } from '../../interfaces/models/ICar';
import { IBusResult } from '../../interfaces/models/IBus';
import { formatDate, formatCurrencyShort } from '../../utils/formatters';

interface ResultCardProps {
  result: ISearchResultBase;
  modality: Modality;
  delay: number;
}

function renderDatesCompact(result: ISearchResultBase, modality: Modality): string {
  switch (modality) {
    case 'aereo': {
      const r = result as IFlightResult;
      return `${formatDate(r.departureDate)}${r.returnDate ? ` – ${formatDate(r.returnDate)}` : ''}`;
    }
    case 'hotel': {
      const r = result as IHotelResult;
      return `${formatDate(r.checkIn)} – ${formatDate(r.checkOut)}`;
    }
    case 'carro': {
      const r = result as ICarResult;
      return `${formatDate(r.pickupDate)} · ${r.pickupTime}h – ${formatDate(r.dropoffDate)} · ${r.dropoffTime}h`;
    }
    case 'onibus': {
      const r = result as IBusResult;
      return `${formatDate(r.departureDate)}${r.returnDate ? ` – ${formatDate(r.returnDate)}` : ''}`;
    }
  }
}

export const ResultCard = ({ result, modality, delay }: ResultCardProps) => (
  <div
    className="border border-onfly-border rounded-xl bg-card p-3.5 cursor-pointer hover:bg-background transition-all duration-150 opacity-0 animate-fade-slide-up"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    <div className="text-sm text-foreground mb-2">
      {renderDatesCompact(result, modality)}
    </div>
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[17px] font-semibold text-foreground">
        {formatCurrencyShort(result.price.bestPrice)}
      </span>
      <span className="bg-onfly-green-bg text-onfly-green-text text-[11px] font-mono font-medium rounded-md px-2 py-0.5">
        – {formatCurrencyShort(result.price.savings)}
      </span>
    </div>
  </div>
);
