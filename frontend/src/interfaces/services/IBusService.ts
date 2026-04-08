import { IBusSearchParams, IBusResult } from '../models/IBus';
import { IInsight } from '../models/ICommon';

export interface IBusService {
  searchBuses(params: IBusSearchParams): Promise<IBusResult[]>;
  getBusInsight(params: IBusSearchParams): Promise<IInsight>;
}
