import { ISearchResultBase, IFlexibility } from './ICommon';

export interface ICarSearchParams {
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  flexibility: IFlexibility;
}

export interface ICarResult extends ISearchResultBase {
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  rentalCompany: string;
  carCategory: string;
}
