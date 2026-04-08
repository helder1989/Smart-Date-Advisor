import { IFlightSearchParams } from './IFlight';
import { IHotelSearchParams } from './IHotel';
import { ICarSearchParams } from './ICar';
import { IBusSearchParams } from './IBus';

export type Modality = 'aereo' | 'hotel' | 'carro' | 'onibus';
export type ScreenState = 'login' | 'wizard' | 'loading' | 'results';
export type TripType = 'roundTrip' | 'oneWay';
export type WizardStep = 1 | 2 | 3;
export type TransportType = 'aereo' | 'onibus';

export interface ITripPlan {
  transport?: {
    type: TransportType;
    params: IFlightSearchParams | IBusSearchParams;
  };
  hotel?: {
    params: IHotelSearchParams;
  };
  car?: {
    params: ICarSearchParams;
  };
}

export interface IDateRange {
  startDate: string;
  endDate?: string;
}

export interface IFlexibility {
  departureDays: number;
  returnDays: number;
}

export interface IPriceInfo {
  originalPrice: number;
  bestPrice: number;
  savings: number;
  currency: string;
}

export interface IInsight {
  modality: Modality;
  title: string;
  description: string;
  savingsAmount: number;
}

export interface ISearchResultBase {
  id: string;
  isBestPick: boolean;
  price: IPriceInfo;
  dates: IDateRange;
}
