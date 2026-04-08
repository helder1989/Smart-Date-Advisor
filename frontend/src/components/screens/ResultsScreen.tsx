import { Header } from '../shared/Header';
import { InsightCard } from '../shared/InsightCard';
import { BestPickCard } from '../shared/BestPickCard';
import { ResultCard } from '../shared/ResultCard';
import { ITripPlanResponse, IAnalysisResponse } from '../../interfaces/services/IAnalysisService';
import { ITripPlan, Modality } from '../../interfaces/models/ICommon';
import { Plane, Building2, Car, Bus } from 'lucide-react';
import { formatCurrencyShort } from '../../utils/formatters';

interface ResultsScreenProps {
  userInitials: string;
  response: ITripPlanResponse;
  tripPlan: ITripPlan;
  onEditSearch: () => void;
}

const SECTION_CONFIG: Record<string, { icon: typeof Plane; label: string }> = {
  transport: { icon: Plane, label: 'Transporte' },
  hotel: { icon: Building2, label: 'Hospedagem' },
  car: { icon: Car, label: 'Carro' },
};

function ResultSection({ data, sectionKey }: { data: IAnalysisResponse; sectionKey: string }) {
  const config = SECTION_CONFIG[sectionKey];
  if (sectionKey === 'transport' && data.modality === 'onibus') {
    config.icon = Bus;
  }
  const Icon = config.icon;
  const bestPick = data.results.find(r => r.isBestPick);
  const alternatives = data.results.filter(r => !r.isBestPick).slice(0, 2);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-[13px] font-semibold text-foreground">{config.label}</h3>
      </div>

      <div className="space-y-2">
        {bestPick && (
          <BestPickCard result={bestPick} modality={data.modality} />
        )}
        {alternatives.map((result, i) => (
          <ResultCard
            key={result.id}
            result={result}
            modality={data.modality}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}

export const ResultsScreen = ({ userInitials, response, tripPlan, onEditSearch }: ResultsScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-slide-up">
      <Header userInitials={userInitials} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Seu plano de viagem</h2>
          <button
            onClick={onEditSearch}
            className="text-xs text-primary cursor-pointer hover:underline"
          >
            ← Editar busca
          </button>
        </div>

        {/* Total savings summary */}
        {response.totalSavings > 0 && (
          <div className="bg-onfly-green-bg border border-onfly-green-text/20 rounded-xl p-3 mb-4 text-center">
            <p className="text-[11px] text-onfly-green-text font-medium">Economia total estimada</p>
            <p className="text-lg font-bold font-mono text-onfly-green-text">
              {formatCurrencyShort(response.totalSavings)}
            </p>
          </div>
        )}

        <InsightCard insight={response.combinedInsight} />

        {response.transportResults && (
          <ResultSection data={response.transportResults} sectionKey="transport" />
        )}

        {response.hotelResults && (
          <ResultSection data={response.hotelResults} sectionKey="hotel" />
        )}

        {response.carResults && (
          <ResultSection data={response.carResults} sectionKey="car" />
        )}
      </div>
    </div>
  );
};
