import { IAnalysisService, IAnalysisRequest, IAnalysisResponse } from '../../interfaces/services/IAnalysisService';
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

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
