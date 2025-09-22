import { api } from "@/lib/api";
import type {
  Genre,
  MovieFilters,
  MovieListResponse,
  DeleteMovieResponse,
  BatchDeleteMoviesResponse,
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

  async getGenres(): Promise<{ results: Genre[] }> {
    return api.get<{ results: Genre[] }>("/genres/");
  },

  async deleteMovie(id: string): Promise<DeleteMovieResponse> {
    return api.delete<DeleteMovieResponse>(`/movies/${id}/delete/`);
  },

  async deleteMovies(ids: string[]): Promise<BatchDeleteMoviesResponse> {
    return api.post<BatchDeleteMoviesResponse>("/movies/batch-delete/", {
      movie_ids: ids,
    });
  },
};
