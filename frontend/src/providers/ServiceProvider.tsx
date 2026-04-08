import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IAuthService } from '../interfaces/services/IAuthService';
import { IFlightService } from '../interfaces/services/IFlightService';
import { IHotelService } from '../interfaces/services/IHotelService';
import { ICarService } from '../interfaces/services/ICarService';
import { IBusService } from '../interfaces/services/IBusService';
import { IAnalysisService } from '../interfaces/services/IAnalysisService';

import { AuthMockService } from '../services/mockServices/AuthMockService';
import { FlightMockService } from '../services/mockServices/FlightMockService';
import { HotelMockService } from '../services/mockServices/HotelMockService';
import { CarMockService } from '../services/mockServices/CarMockService';
import { BusMockService } from '../services/mockServices/BusMockService';
import { AnalysisMockService } from '../services/mockServices/AnalysisMockService';

export interface IServiceContext {
  authService: IAuthService;
  flightService: IFlightService;
  hotelService: IHotelService;
  carService: ICarService;
  busService: IBusService;
  analysisService: IAnalysisService;
}

const ServiceContext = createContext<IServiceContext | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const services = useMemo<IServiceContext>(() => ({
    authService: new AuthMockService(),
    flightService: new FlightMockService(),
    hotelService: new HotelMockService(),
    carService: new CarMockService(),
    busService: new BusMockService(),
    analysisService: new AnalysisMockService(),
  }), []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): IServiceContext {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServices must be used within ServiceProvider');
  return ctx;
}
