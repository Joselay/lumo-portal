import { api } from "@/lib/api";
import type {
  User,
  UserFilters,
  UserListResponse,
  DeleteUserResponse,
  BatchDeleteUsersResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "@/types/users";

export const usersApi = {
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters?.role) {
      params.set("role", filters.role);
    }
    if (filters?.search) {
      params.set("search", filters.search);
    }
    if (filters?.is_active !== undefined) {
      params.set("is_active", filters.is_active.toString());
    }
    if (filters?.ordering) {
      params.set("ordering", filters.ordering);
    }
    if (filters?.page) {
      params.set("page", filters.page.toString());
    }
    if (filters?.page_size) {
      params.set("page_size", filters.page_size.toString());
    }

    const endpoint = `/auth/admin/users/${params.toString() ? `?${params.toString()}` : ""}`;
    return api.get<UserListResponse>(endpoint);
  },

  async getUser(id: number): Promise<User> {
    return api.get<User>(`/auth/admin/users/${id}/`);
  },

  async deleteUser(id: number): Promise<DeleteUserResponse> {
    return api.delete<DeleteUserResponse>(`/auth/admin/users/${id}/`);
  },

  async deleteUsers(ids: number[]): Promise<BatchDeleteUsersResponse> {
    return api.post<BatchDeleteUsersResponse>("/auth/admin/users/batch-delete/", {
      user_ids: ids,
    });
  },

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    // Note: Backend uses registration endpoint, not admin create
    return api.post<CreateUserResponse>("/auth/register/", data);
  },

  async updateUser(
    id: number,
    data: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return api.patch<UpdateUserResponse>(`/auth/admin/users/${id}/`, data);
  },
};
