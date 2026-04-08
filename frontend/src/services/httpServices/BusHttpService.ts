import { IBusService } from '../../interfaces/services/IBusService';
import { IBusSearchParams, IBusResult } from '../../interfaces/models/IBus';
import { IInsight } from '../../interfaces/models/ICommon';

export class BusHttpService implements IBusService {
  async searchBuses(_params: IBusSearchParams): Promise<IBusResult[]> {
    throw new Error('BusHttpService.searchBuses: API not yet connected');
  }
  async getBusInsight(_params: IBusSearchParams): Promise<IInsight> {
    throw new Error('BusHttpService.getBusInsight: API not yet connected');
  }
}
