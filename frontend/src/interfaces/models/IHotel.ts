import { ISearchResultBase, IFlexibility } from './ICommon';

export interface IHotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  flexibility: IFlexibility;
}

export interface IHotelResult extends ISearchResultBase {
  destination: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nightCount: number;
}
