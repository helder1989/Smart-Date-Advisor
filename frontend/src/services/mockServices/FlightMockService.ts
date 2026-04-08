import { IFlightService } from '../../interfaces/services/IFlightService';
import { IFlightSearchParams, IFlightResult } from '../../interfaces/models/IFlight';
import { IInsight } from '../../interfaces/models/ICommon';
import { mockFlightResults } from '../../mockDatabase/flights';
import { mockInsights } from '../../mockDatabase/insights';

export class FlightMockService implements IFlightService {
  async searchFlights(_params: IFlightSearchParams): Promise<IFlightResult[]> {
    await this.simulateDelay(400);
    return mockFlightResults;
  }

  async getFlightInsight(_params: IFlightSearchParams): Promise<IInsight> {
    await this.simulateDelay(200);
    return mockInsights.aereo;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
