import { IHotelService } from '../../interfaces/services/IHotelService';
import { IHotelSearchParams, IHotelResult } from '../../interfaces/models/IHotel';
import { IInsight } from '../../interfaces/models/ICommon';

export class HotelHttpService implements IHotelService {
  async searchHotels(_params: IHotelSearchParams): Promise<IHotelResult[]> {
    throw new Error('HotelHttpService.searchHotels: API not yet connected');
  }
  async getHotelInsight(_params: IHotelSearchParams): Promise<IInsight> {
    throw new Error('HotelHttpService.getHotelInsight: API not yet connected');
  }
}
