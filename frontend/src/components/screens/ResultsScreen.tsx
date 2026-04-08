import { Header } from '../shared/Header';
import { RouteChip } from '../shared/RouteChip';
import { InsightCard } from '../shared/InsightCard';
import { BestPickCard } from '../shared/BestPickCard';
import { ResultCard } from '../shared/ResultCard';
import { IAnalysisResponse } from '../../interfaces/services/IAnalysisService';
import { IFlightSearchParams } from '../../interfaces/models/IFlight';
import { IHotelSearchParams } from '../../interfaces/models/IHotel';
import { ICarSearchParams } from '../../interfaces/models/ICar';
import { IBusSearchParams } from '../../interfaces/models/IBus';

interface ResultsScreenProps {
  userInitials: string;
  response: IAnalysisResponse;
  searchParams: IFlightSearchParams | IHotelSearchParams | ICarSearchParams | IBusSearchParams;
  onEditSearch: () => void;
}

export const ResultsScreen = ({ userInitials, response, searchParams, onEditSearch }: ResultsScreenProps) => {
  const bestPick = response.results.find(r => r.isBestPick);
  const alternatives = response.results.filter(r => !r.isBestPick);

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-slide-up">
      <Header userInitials={userInitials} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Melhores combinações</h2>
          <button
            onClick={onEditSearch}
            className="text-xs text-primary cursor-pointer hover:underline"
          >
            ← Editar busca
          </button>
        </div>

        <RouteChip modality={response.modality} params={searchParams} />

        <InsightCard insight={response.insight} />

        <div className="space-y-2.5">
          {bestPick && (
            <div className="opacity-0 animate-fade-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <BestPickCard result={bestPick} modality={response.modality} />
            </div>
          )}

          {alternatives.map((result, i) => (
            <ResultCard
              key={result.id}
              result={result}
              modality={response.modality}
              delay={(i + 1) * 80}
            />
          ))}
        </div>

        <p className="text-center text-[11px] text-onfly-text-muted mt-2 mb-4">
          {response.results.length} de {response.totalCombinationsAnalyzed} combinações analisadas
        </p>
      </div>
    </div>
  );
};
