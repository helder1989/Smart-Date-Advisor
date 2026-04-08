import { useState, useCallback } from 'react';
import { useServices } from '../providers/ServiceProvider';
import { Modality } from '../interfaces/models/ICommon';
import { IFlightSearchParams } from '../interfaces/models/IFlight';
import { IHotelSearchParams } from '../interfaces/models/IHotel';
import { ICarSearchParams } from '../interfaces/models/ICar';
import { IBusSearchParams } from '../interfaces/models/IBus';
import { IAnalysisResponse } from '../interfaces/services/IAnalysisService';

type SearchParams = IFlightSearchParams | IHotelSearchParams | ICarSearchParams | IBusSearchParams;

export function useSearch() {
  const { analysisService } = useServices();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IAnalysisResponse | null>(null);

  const submit = useCallback(async (modality: Modality, params: SearchParams) => {
    setLoading(true);
    try {
      const response = await analysisService.analyzeDates({ modality, params });
      setResults(response);
      return response;
    } finally {
      setLoading(false);
    }
  }, [analysisService]);

  const reset = useCallback(() => {
    setResults(null);
  }, []);

  return { loading, results, submit, reset };
}
