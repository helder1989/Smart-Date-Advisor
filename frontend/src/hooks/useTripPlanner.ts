import { useState, useCallback } from 'react';
import { useServices } from '../providers/ServiceProvider';
import { WizardStep, TransportType, ITripPlan } from '../interfaces/models/ICommon';
import { IFlightSearchParams } from '../interfaces/models/IFlight';
import { IBusSearchParams } from '../interfaces/models/IBus';
import { IHotelSearchParams } from '../interfaces/models/IHotel';
import { ICarSearchParams } from '../interfaces/models/ICar';
import { ITripPlanResponse } from '../interfaces/services/IAnalysisService';

const MAX_STEP: WizardStep = 3;

export function useTripPlanner() {
  const { analysisService } = useServices();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [tripPlan, setTripPlan] = useState<ITripPlan>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ITripPlanResponse | null>(null);

  const setTransport = useCallback((type: TransportType, params: IFlightSearchParams | IBusSearchParams) => {
    setTripPlan(prev => ({ ...prev, transport: { type, params } }));
  }, []);

  const setHotel = useCallback((params: IHotelSearchParams) => {
    setTripPlan(prev => ({ ...prev, hotel: { params } }));
  }, []);

  const setCar = useCallback((params: ICarSearchParams) => {
    setTripPlan(prev => ({ ...prev, car: { params } }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => (prev < MAX_STEP ? (prev + 1) as WizardStep : prev));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => (prev > 1 ? (prev - 1) as WizardStep : prev));
  }, []);

  const skipStep = useCallback(() => {
    // Remove data for the current step before advancing
    setTripPlan(prev => {
      const next = { ...prev };
      if (currentStep === 1) delete next.transport;
      if (currentStep === 2) delete next.hotel;
      if (currentStep === 3) delete next.car;
      return next;
    });
    setCurrentStep(prev => (prev < MAX_STEP ? (prev + 1) as WizardStep : prev));
  }, [currentStep]);

  const hasSelections = tripPlan.transport || tripPlan.hotel || tripPlan.car;

  const submitPlan = useCallback(async () => {
    if (!hasSelections) return null;
    setLoading(true);
    try {
      const response = await analysisService.planTrip({ plan: tripPlan });
      setResults(response);
      return response;
    } finally {
      setLoading(false);
    }
  }, [analysisService, tripPlan, hasSelections]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setTripPlan({});
    setResults(null);
  }, []);

  return {
    currentStep,
    tripPlan,
    loading,
    results,
    hasSelections: !!hasSelections,
    setTransport,
    setHotel,
    setCar,
    nextStep,
    prevStep,
    skipStep,
    submitPlan,
    reset,
  };
}
