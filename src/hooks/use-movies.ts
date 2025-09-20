import { useQuery } from "@tanstack/react-query";
import { moviesApi } from "@/api/movies";
import type { MovieFilters } from "@/types/movies";

export const useMovies = (filters?: MovieFilters) => {
  return useQuery({
    queryKey: ["movies", filters],
    queryFn: () => moviesApi.getMovies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => moviesApi.getGenres(),
    staleTime: 30 * 60 * 1000, // 30 minutes - genres change rarely
  });
};
