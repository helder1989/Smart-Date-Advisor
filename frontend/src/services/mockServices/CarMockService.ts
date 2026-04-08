import { ICarService } from '../../interfaces/services/ICarService';
import { ICarSearchParams, ICarResult } from '../../interfaces/models/ICar';
import { IInsight } from '../../interfaces/models/ICommon';
import { mockCarResults } from '../../mockDatabase/cars';
import { mockInsights } from '../../mockDatabase/insights';

export class CarMockService implements ICarService {
  async searchCars(_params: ICarSearchParams): Promise<ICarResult[]> {
    await this.simulateDelay(400);
    return mockCarResults;
  }

  async getCarInsight(_params: ICarSearchParams): Promise<IInsight> {
    await this.simulateDelay(200);
    return mockInsights.carro;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
