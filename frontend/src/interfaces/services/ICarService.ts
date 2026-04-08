import { ICarSearchParams, ICarResult } from '../models/ICar';
import { IInsight } from '../models/ICommon';

export interface ICarService {
  searchCars(params: ICarSearchParams): Promise<ICarResult[]>;
  getCarInsight(params: ICarSearchParams): Promise<IInsight>;
}
