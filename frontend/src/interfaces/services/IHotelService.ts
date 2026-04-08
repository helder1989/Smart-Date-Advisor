import { IHotelSearchParams, IHotelResult } from '../models/IHotel';
import { IInsight } from '../models/ICommon';

export interface IHotelService {
  searchHotels(params: IHotelSearchParams): Promise<IHotelResult[]>;
  getHotelInsight(params: IHotelSearchParams): Promise<IInsight>;
}
