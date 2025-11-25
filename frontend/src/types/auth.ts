export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'kasir' | 'gudang';
  phone?: string;
  address?: string;
  menu?: string[];
  submenu?: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type?: string;
  message?: string;
}
