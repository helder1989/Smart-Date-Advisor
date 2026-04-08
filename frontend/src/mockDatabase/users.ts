import { IUser, ILoginCredentials } from '../interfaces/models/IUser';

export const mockUsers: IUser[] = [
  {
    id: '1',
    name: 'Luiz Felipe',
    email: 'luiz.linhares@onfly.com.br',
    initials: 'LF',
    company: 'Onfly',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    initials: 'MS',
    company: 'TechCorp Brasil',
  },
];

export const mockCredentials: ILoginCredentials[] = [
  { email: 'luiz.linhares@onfly.com.br', password: '123456' },
  { email: 'maria@empresa.com', password: '123456' },
];
