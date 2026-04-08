import { Modality, IInsight } from '../models/ICommon';
import { IFlightSearchParams, IFlightResult } from '../models/IFlight';
import { IHotelSearchParams, IHotelResult } from '../models/IHotel';
import { ICarSearchParams, ICarResult } from '../models/ICar';
import { IBusSearchParams, IBusResult } from '../models/IBus';

export interface IAnalysisRequest {
  modality: Modality;
  params: IFlightSearchParams | IHotelSearchParams | ICarSearchParams | IBusSearchParams;
}

export interface IAnalysisResponse {
  modality: Modality;
  results: (IFlightResult | IHotelResult | ICarResult | IBusResult)[];
  insight: IInsight;
  totalCombinationsAnalyzed: number;
}

export interface IAnalysisService {
  analyzeDates(request: IAnalysisRequest): Promise<IAnalysisResponse>;
}
