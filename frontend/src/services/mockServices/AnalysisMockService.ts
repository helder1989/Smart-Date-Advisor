import { IAnalysisService, IAnalysisRequest, IAnalysisResponse, ITripPlanRequest, ITripPlanResponse } from '../../interfaces/services/IAnalysisService';
import { Modality } from '../../interfaces/models/ICommon';
import { mockFlightResults } from '../../mockDatabase/flights';
import { mockHotelResults } from '../../mockDatabase/hotels';
import { mockCarResults } from '../../mockDatabase/cars';
import { mockBusResults } from '../../mockDatabase/buses';
import { mockInsights } from '../../mockDatabase/insights';

export class AnalysisMockService implements IAnalysisService {
  async analyzeDates(request: IAnalysisRequest): Promise<IAnalysisResponse> {
    await this.simulateDelay(2500);

    const resultMap = {
      aereo: mockFlightResults,
      hotel: mockHotelResults,
      carro: mockCarResults,
      onibus: mockBusResults,
    };

    return {
      modality: request.modality,
      results: resultMap[request.modality],
      insight: mockInsights[request.modality],
      totalCombinationsAnalyzed: 49,
    };
  }

  async planTrip(request: ITripPlanRequest): Promise<ITripPlanResponse> {
    await this.simulateDelay(2500);

    const { plan } = request;
    let totalSavings = 0;

    let transportResults: IAnalysisResponse | undefined;
    let hotelResults: IAnalysisResponse | undefined;
    let carResults: IAnalysisResponse | undefined;

    if (plan.transport) {
      const modality: Modality = plan.transport.type;
      const results = modality === 'aereo' ? mockFlightResults : mockBusResults;
      transportResults = {
        modality,
        results,
        insight: mockInsights[modality],
        totalCombinationsAnalyzed: 49,
      };
      const bestPick = results.find(r => r.isBestPick);
      if (bestPick) totalSavings += bestPick.price.savings;
    }

    if (plan.hotel) {
      hotelResults = {
        modality: 'hotel',
        results: mockHotelResults,
        insight: mockInsights.hotel,
        totalCombinationsAnalyzed: 36,
      };
      const bestPick = mockHotelResults.find(r => r.isBestPick);
      if (bestPick) totalSavings += bestPick.price.savings;
    }

    if (plan.car) {
      carResults = {
        modality: 'carro',
        results: mockCarResults,
        insight: mockInsights.carro,
        totalCombinationsAnalyzed: 24,
      };
      const bestPick = mockCarResults.find(r => r.isBestPick);
      if (bestPick) totalSavings += bestPick.price.savings;
    }

    return {
      transportResults,
      hotelResults,
      carResults,
      combinedInsight: {
        modality: 'aereo',
        title: 'Combinacao otimizada encontrada!',
        description: `Ao combinar as melhores opcoes de cada servico, voce pode economizar ate R$ ${totalSavings.toFixed(0)} nesta viagem.`,
        savingsAmount: totalSavings,
      },
      totalSavings,
    };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
