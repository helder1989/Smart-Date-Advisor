import { IUser } from '../models/IUser';

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  user?: IUser;
  token?: string;
  error?: string;
}

export interface IAuthService {
  login(request: ILoginRequest): Promise<ILoginResponse>;
  getCurrentUser(): Promise<IUser | null>;
  logout(): Promise<void>;
}
