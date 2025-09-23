export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  role: "customer" | "admin";
  is_admin: boolean;
  customer_profile?: CustomerProfile;
}

export interface CustomerProfile {
  id: string;
  phone_number: string;
  date_of_birth: string | null;
  preferred_language: "en" | "es" | "fr";
  receive_booking_notifications: boolean;
  loyalty_points: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  full_name: string;
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface UserFilters {
  role?: "customer" | "admin";
  search?: string;
  is_active?: boolean;
  ordering?:
    | "date_joined"
    | "-date_joined"
    | "username"
    | "-username"
    | "email"
    | "-email"
    | "first_name"
    | "-first_name"
    | "last_name"
    | "-last_name";
  page?: number;
  page_size?: number;
}

export interface DeleteUserResponse {
  message: string;
}

export interface BatchDeleteUsersResponse {
  message: string;
  deleted_count: number;
  deleted_users: number[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  phone_number?: string;
  date_of_birth?: string;
  preferred_language?: "en" | "es" | "fr";
  receive_booking_notifications?: boolean;
  avatar_url?: string;
}

export interface CreateUserResponse extends User {}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  phone_number?: string;
  date_of_birth?: string;
  preferred_language?: "en" | "es" | "fr";
  receive_booking_notifications?: boolean;
  avatar_url?: string;
}

export interface UpdateUserResponse extends User {}
