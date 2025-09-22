export interface Genre {
  id: string;
  name: string;
}

export interface GenreListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Genre[];
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
