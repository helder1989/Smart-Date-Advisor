import { ICarService } from '../../interfaces/services/ICarService';
import { ICarSearchParams, ICarResult } from '../../interfaces/models/ICar';
import { IInsight } from '../../interfaces/models/ICommon';

export class CarHttpService implements ICarService {
  async searchCars(_params: ICarSearchParams): Promise<ICarResult[]> {
    throw new Error('CarHttpService.searchCars: API not yet connected');
  }
  async getCarInsight(_params: ICarSearchParams): Promise<IInsight> {
    throw new Error('CarHttpService.getCarInsight: API not yet connected');
  }
}
