import { ISearchResultBase, IFlexibility, TripType } from './ICommon';

export interface IFlightSearchParams {
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  tripType: TripType;
  departureDate: string;
  returnDate?: string;
  travelers: number;
  flexibility: IFlexibility;
}

export interface IFlightResult extends ISearchResultBase {
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
}
