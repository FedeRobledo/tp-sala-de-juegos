export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  edad: number;
  created_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  edad: number;
}

export interface LoginData {
  email: string;
  password: string;
}