export interface Genre {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  duration_formatted: string;
  release_date: string;
  rating: string;
  poster_image: string | null;
  genres: Genre[];
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
  ordering?:
    | "release_date"
    | "-release_date"
    | "rating"
    | "-rating"
    | "title"
    | "-title";
  page?: number;
}
