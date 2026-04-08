import { IFlightService } from '../../interfaces/services/IFlightService';
import { IFlightSearchParams, IFlightResult } from '../../interfaces/models/IFlight';
import { IInsight } from '../../interfaces/models/ICommon';

export class FlightHttpService implements IFlightService {
  async searchFlights(_params: IFlightSearchParams): Promise<IFlightResult[]> {
    throw new Error('FlightHttpService.searchFlights: API not yet connected');
  }
  async getFlightInsight(_params: IFlightSearchParams): Promise<IInsight> {
    throw new Error('FlightHttpService.getFlightInsight: API not yet connected');
  }
}
