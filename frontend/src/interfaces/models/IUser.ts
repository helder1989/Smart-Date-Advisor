export interface IUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  company: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}
