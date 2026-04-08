import { IAnalysisService, IAnalysisRequest, IAnalysisResponse, ITripPlanRequest, ITripPlanResponse } from '../../interfaces/services/IAnalysisService';

export class AnalysisHttpService implements IAnalysisService {
  async analyzeDates(_request: IAnalysisRequest): Promise<IAnalysisResponse> {
    throw new Error('AnalysisHttpService.analyzeDates: API not yet connected');
  }

  async planTrip(_request: ITripPlanRequest): Promise<ITripPlanResponse> {
    throw new Error('AnalysisHttpService.planTrip: API not yet connected');
  }
}
