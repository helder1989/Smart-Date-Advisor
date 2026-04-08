import { IHotelService } from '../../interfaces/services/IHotelService';
import { IHotelSearchParams, IHotelResult } from '../../interfaces/models/IHotel';
import { IInsight } from '../../interfaces/models/ICommon';
import { mockHotelResults } from '../../mockDatabase/hotels';
import { mockInsights } from '../../mockDatabase/insights';

export class HotelMockService implements IHotelService {
  async searchHotels(_params: IHotelSearchParams): Promise<IHotelResult[]> {
    await this.simulateDelay(400);
    return mockHotelResults;
  }

  async getHotelInsight(_params: IHotelSearchParams): Promise<IInsight> {
    await this.simulateDelay(200);
    return mockInsights.hotel;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
