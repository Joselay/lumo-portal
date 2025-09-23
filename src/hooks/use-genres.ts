import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moviesApi } from "@/api/movies";
import type {
  GenreFilters,
  CreateGenreRequest,
  UpdateGenreRequest,
} from "@/types/movies";

export const useGenres = (filters?: GenreFilters) => {
  return useQuery({
    queryKey: ["genres", filters],
    queryFn: () => moviesApi.getGenres(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenre = (id: string) => {
  return useQuery({
    queryKey: ["genre", id],
    queryFn: () => moviesApi.getGenre(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGenreRequest) => moviesApi.createGenre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGenreRequest }) =>
      moviesApi.updateGenre(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genre", id] });
    },
  });
};

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (genreId: string) => moviesApi.deleteGenre(genreId),
    onSuccess: (_, genreId) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.removeQueries({ queryKey: ["genre", genreId] });
    },
  });
};
