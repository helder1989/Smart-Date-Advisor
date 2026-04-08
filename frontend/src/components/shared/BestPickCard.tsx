import { Modality, ISearchResultBase, IPriceInfo } from '../../interfaces/models/ICommon';
import { IFlightResult } from '../../interfaces/models/IFlight';
import { IHotelResult } from '../../interfaces/models/IHotel';
import { ICarResult } from '../../interfaces/models/ICar';
import { IBusResult } from '../../interfaces/models/IBus';
import { formatDate, formatCurrencyShort } from '../../utils/formatters';
import { MODALITY_CONFIG } from '../../constants/modalities';

interface BestPickCardProps {
  result: ISearchResultBase;
  modality: Modality;
}

function renderDates(result: ISearchResultBase, modality: Modality) {
  switch (modality) {
    case 'aereo': {
      const r = result as IFlightResult;
      return (
        <>
          <DatePair label="Ida" value={formatDate(r.departureDate)} />
          {r.returnDate && <DatePair label="Volta" value={formatDate(r.returnDate)} />}
        </>
      );
    }
    case 'hotel': {
      const r = result as IHotelResult;
      return (
        <>
          <DatePair label="Check-in" value={formatDate(r.checkIn)} />
          <DatePair label="Check-out" value={formatDate(r.checkOut)} />
        </>
      );
    }
    case 'carro': {
      const r = result as ICarResult;
      return (
        <>
          <DatePair label="Retirada" value={`${formatDate(r.pickupDate)} · ${r.pickupTime}h`} />
          <DatePair label="Dev." value={`${formatDate(r.dropoffDate)} · ${r.dropoffTime}h`} />
        </>
      );
    }
    case 'onibus': {
      const r = result as IBusResult;
      return (
        <>
          <DatePair label="Ida" value={formatDate(r.departureDate)} />
          {r.returnDate && <DatePair label="Volta" value={formatDate(r.returnDate)} />}
        </>
      );
    }
  }
}

function DatePair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-onfly-text-secondary">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function PriceRow({ price }: { price: IPriceInfo }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-onfly-text-secondary">Tarifa total</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[13px] text-onfly-text-muted line-through">
          {formatCurrencyShort(price.originalPrice)}
        </span>
        <span className="font-mono text-xl font-semibold text-foreground">
          {formatCurrencyShort(price.bestPrice)}
        </span>
      </div>
    </div>
  );
}

export const BestPickCard = ({ result, modality }: BestPickCardProps) => (
  <div className="border-2 border-primary rounded-xl bg-card p-3.5 shadow-[0_0_0_2px_rgba(0,82,204,0.08),0_4px_16px_rgba(0,82,204,0.10)]">
    <div className="flex items-center justify-between mb-2.5">
      <span className="bg-primary text-primary-foreground text-[11px] font-semibold rounded-md px-2 py-0.5">
        Melhor opção
      </span>
      <span className="bg-onfly-green-bg text-onfly-green-text text-[11px] font-mono font-medium rounded-md px-2 py-0.5">
        Economize {formatCurrencyShort(result.price.savings)}
      </span>
    </div>

    <div className="flex gap-4 flex-wrap">
      {renderDates(result, modality)}
    </div>

    <div className="border-t border-onfly-border my-2.5" />

    <PriceRow price={result.price} />

    <button
      className="w-full h-[38px] rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] mt-3 hover:bg-onfly-blue-hover active:scale-[0.98] transition-all cursor-pointer"
      aria-label={MODALITY_CONFIG[modality].searchLabel}
    >
      {MODALITY_CONFIG[modality].searchLabel} →
    </button>
  </div>
);
