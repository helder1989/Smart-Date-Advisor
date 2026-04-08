import { ISearchResultBase, IFlexibility, TripType } from './ICommon';

export interface IBusSearchParams {
  origin: string;
  destination: string;
  tripType: TripType;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  flexibility: IFlexibility;
}

export interface IBusResult extends ISearchResultBase {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  busCompany: string;
}
