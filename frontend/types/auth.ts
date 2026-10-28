export type UserRole = 'ADMIN' | 'MANAGER' | 'SECURITY';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

export interface DemoAccount {
  role: UserRole;
  username: string;
  password: string;
  name: string;
  description: string;
}
