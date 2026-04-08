import { IUser, ILoginCredentials } from '../interfaces/models/IUser';

export const mockUsers: IUser[] = [
  {
    id: '1',
    name: 'João Costa',
    email: 'joao@empresa.com',
    initials: 'JC',
    company: 'TechCorp Brasil',
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
  { email: 'joao@empresa.com', password: '123456' },
  { email: 'maria@empresa.com', password: '123456' },
];
