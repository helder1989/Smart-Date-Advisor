import { IAnalysisService, IAnalysisRequest, IAnalysisResponse } from '../../interfaces/services/IAnalysisService';

export class AnalysisHttpService implements IAnalysisService {
  async analyzeDates(_request: IAnalysisRequest): Promise<IAnalysisResponse> {
    throw new Error('AnalysisHttpService.analyzeDates: API not yet connected');
  }
}
