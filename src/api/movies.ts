import { api } from "@/lib/api";
import type {
  Genre,
  GenreDetail,
  GenreListResponse,
  GenreFilters,
  CreateGenreRequest,
  CreateGenreResponse,
  UpdateGenreRequest,
  UpdateGenreResponse,
  DeleteGenreResponse,
  Movie,
  MovieFilters,
  MovieListResponse,
  DeleteMovieResponse,
  BatchDeleteMoviesResponse,
  CreateMovieRequest,
  CreateMovieResponse,
  UpdateMovieRequest,
  UpdateMovieResponse,
} from "@/types/movies";

export const moviesApi = {
  async getMovies(filters?: MovieFilters): Promise<MovieListResponse> {
    const params = new URLSearchParams();

    if (filters?.genres?.length) {
      for (const genre of filters.genres) {
        params.append("genres", genre);
      }
    }
    if (filters?.release_date) {
      params.set("release_date", filters.release_date);
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

    const endpoint = `/movies/${params.toString() ? `?${params.toString()}` : ""}`;
    return api.get<MovieListResponse>(endpoint);
  },

  async getGenres(filters?: GenreFilters): Promise<GenreListResponse> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.set("search", filters.search);
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

    const endpoint = `/movies/genres/${params.toString() ? `?${params.toString()}` : ""}`;
    return api.get<GenreListResponse>(endpoint);
  },

  async getGenre(id: string): Promise<GenreDetail> {
    return api.get<GenreDetail>(`/movies/genres/${id}/`);
  },

  async createGenre(data: CreateGenreRequest): Promise<CreateGenreResponse> {
    return api.post<CreateGenreResponse>("/movies/genres/create/", data);
  },

  async updateGenre(
    id: string,
    data: UpdateGenreRequest,
  ): Promise<UpdateGenreResponse> {
    return api.patch<UpdateGenreResponse>(`/movies/genres/${id}/update/`, data);
  },

  async deleteGenre(id: string): Promise<DeleteGenreResponse> {
    return api.delete<DeleteGenreResponse>(`/movies/genres/${id}/delete/`);
  },

  async getMovie(id: string): Promise<Movie> {
    return api.get<Movie>(`/movies/${id}/`);
  },

  async deleteMovie(id: string): Promise<DeleteMovieResponse> {
    return api.delete<DeleteMovieResponse>(`/movies/${id}/delete/`);
  },

  async deleteMovies(ids: string[]): Promise<BatchDeleteMoviesResponse> {
    return api.post<BatchDeleteMoviesResponse>("/movies/batch-delete/", {
      movie_ids: ids,
    });
  },

  async createMovie(data: CreateMovieRequest): Promise<CreateMovieResponse> {
    return api.post<CreateMovieResponse>("/movies/create/", data);
  },

  async updateMovie(
    id: string,
    data: UpdateMovieRequest,
  ): Promise<UpdateMovieResponse> {
    return api.patch<UpdateMovieResponse>(`/movies/${id}/update/`, data);
  },
};
