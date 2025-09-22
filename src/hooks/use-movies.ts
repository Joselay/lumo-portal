import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moviesApi } from "@/api/movies";
import type {
  MovieFilters,
  CreateMovieRequest,
  UpdateMovieRequest,
} from "@/types/movies";

export const useMovies = (filters?: MovieFilters) => {
  return useQuery({
    queryKey: ["movies", filters],
    queryFn: () => moviesApi.getMovies(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => moviesApi.getGenres(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: string) => moviesApi.deleteMovie(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};

export const useDeleteMovies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieIds: string[]) => moviesApi.deleteMovies(movieIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovieRequest) => moviesApi.createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMovieRequest }) =>
      moviesApi.updateMovie(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};
