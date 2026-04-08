import { IAuthService, ILoginRequest, ILoginResponse } from '../../interfaces/services/IAuthService';
import { IUser } from '../../interfaces/models/IUser';

export class AuthHttpService implements IAuthService {
  async login(_request: ILoginRequest): Promise<ILoginResponse> {
    // TODO: const response = await apiClient.post<ILoginResponse>('/auth/login', request);
    // return response.data;
    throw new Error('AuthHttpService.login: API not yet connected');
  }

  async getCurrentUser(): Promise<IUser | null> {
    throw new Error('AuthHttpService.getCurrentUser: API not yet connected');
  }

  async logout(): Promise<void> {
    throw new Error('AuthHttpService.logout: API not yet connected');
  }
}
