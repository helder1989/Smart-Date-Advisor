import { IFlightSearchParams, IFlightResult } from '../models/IFlight';
import { IInsight } from '../models/ICommon';

export interface IFlightService {
  searchFlights(params: IFlightSearchParams): Promise<IFlightResult[]>;
  getFlightInsight(params: IFlightSearchParams): Promise<IInsight>;
}
