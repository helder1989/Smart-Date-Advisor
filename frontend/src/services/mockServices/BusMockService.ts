import { IBusService } from '../../interfaces/services/IBusService';
import { IBusSearchParams, IBusResult } from '../../interfaces/models/IBus';
import { IInsight } from '../../interfaces/models/ICommon';
import { mockBusResults } from '../../mockDatabase/buses';
import { mockInsights } from '../../mockDatabase/insights';

export class BusMockService implements IBusService {
  async searchBuses(_params: IBusSearchParams): Promise<IBusResult[]> {
    await this.simulateDelay(400);
    return mockBusResults;
  }

  async getBusInsight(_params: IBusSearchParams): Promise<IInsight> {
    await this.simulateDelay(200);
    return mockInsights.onibus;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
