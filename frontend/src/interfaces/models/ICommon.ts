export type Modality = 'aereo' | 'hotel' | 'carro' | 'onibus';
export type ScreenState = 'login' | 'form' | 'loading' | 'results';
export type TripType = 'roundTrip' | 'oneWay';

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
