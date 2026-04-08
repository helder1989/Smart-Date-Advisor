import { IAuthService, ILoginRequest, ILoginResponse } from '../../interfaces/services/IAuthService';
import { IUser } from '../../interfaces/models/IUser';
import { mockUsers, mockCredentials } from '../../mockDatabase/users';

export class AuthMockService implements IAuthService {
  async login(request: ILoginRequest): Promise<ILoginResponse> {
    await this.simulateDelay(300);
    const credential = mockCredentials.find(
      c => c.email === request.email && c.password === request.password
    );
    if (!credential) {
      return { success: false, error: 'Credenciais inválidas' };
    }
    const user = mockUsers.find(u => u.email === request.email)!;
    return { success: true, user, token: 'mock-jwt-token-xyz' };
  }

  async getCurrentUser(): Promise<IUser | null> {
    await this.simulateDelay(100);
    return mockUsers[0];
  }

  async logout(): Promise<void> {
    await this.simulateDelay(100);
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
