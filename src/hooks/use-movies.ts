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

export const useGenres = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => moviesApi.getGenres({}),
    staleTime: 30 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: () => moviesApi.getMovie(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: string) => moviesApi.deleteMovie(movieId),
    onSuccess: (_, movieId) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.removeQueries({ queryKey: ["movie", movieId] });
    },
  });
};

export const useDeleteMovies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieIds: string[]) => moviesApi.deleteMovies(movieIds),
    onSuccess: (_, movieIds) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      movieIds.forEach((movieId) => {
        queryClient.removeQueries({ queryKey: ["movie", movieId] });
      });
    },
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovieRequest) => moviesApi.createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMovieRequest }) =>
      moviesApi.updateMovie(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["movie", id] });
    },
  });
};
