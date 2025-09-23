export interface Genre {
  id: string;
  name: string;
}

export interface GenreDetail {
  id: string;
  name: string;
  movies_count: number;
  created_at: string;
  updated_at: string;
}

export interface GenreListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GenreDetail[];
}

export interface GenreFilters {
  search?: string;
  ordering?:
    | "name"
    | "-name"
    | "created_at"
    | "-created_at"
    | "movies_count"
    | "-movies_count";
  page?: number;
  page_size?: number;
}

export interface CreateGenreRequest {
  name: string;
}

export interface CreateGenreResponse extends Genre {}

export interface UpdateGenreRequest {
  name?: string;
}

export interface UpdateGenreResponse extends Genre {}

export interface DeleteGenreResponse {
  message: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  duration_formatted: string;
  release_date: string;
  rating: string;
  poster_image: string;
  trailer_url?: string;
  genres: Genre[];
  is_active: boolean;
}

export interface MovieListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Movie[];
}

export interface MovieFilters {
  genres?: string[];
  release_date?: string;
  search?: string;
  is_active?: boolean;
  ordering?:
    | "release_date"
    | "-release_date"
    | "rating"
    | "-rating"
    | "title"
    | "-title";
  page?: number;
  page_size?: number;
}

export interface DeleteMovieResponse {
  message: string;
}

export interface BatchDeleteMoviesResponse {
  message: string;
  deleted_count: number;
  deleted_movies: string[];
}

export interface CreateMovieRequest {
  title: string;
  description: string;
  duration: number;
  release_date: string;
  rating?: number;
  poster_image?: string;
  trailer_url?: string;
  genre_ids?: string[];
  is_active?: boolean;
}

export interface CreateMovieResponse extends Movie {}

export interface UpdateMovieRequest {
  title?: string;
  description?: string;
  duration?: number;
  release_date?: string;
  rating?: number;
  poster_image?: string;
  trailer_url?: string;
  genre_ids?: string[];
  is_active?: boolean;
}

export interface UpdateMovieResponse extends Movie {}
