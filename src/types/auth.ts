export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "customer" | "admin";
  is_admin: boolean;
  date_joined: string;
}

export interface CustomerProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string | null;
  preferred_language: string;
  receive_booking_notifications: boolean;
  loyalty_points: number;
  avatar_url: string | null;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  customer_profile: CustomerProfile | null;
}

export interface LoginError {
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
}

export interface LogoutRequest {
  refresh_token?: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ProfileResponse {
  user: User;
  customer_profile: CustomerProfile | null;
}
