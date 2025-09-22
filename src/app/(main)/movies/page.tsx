"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoviesPageSkeleton,
  MoviesPageSkeletonFallback,
} from "@/components/skeletons/movies-page-skeleton";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { useDeleteMovie, useDeleteMovies, useMovies } from "@/hooks/use-movies";
import type { Movie, MovieFilters } from "@/types/movies";

function MoviesContent() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [ordering, setOrdering] = useQueryState(
    "ordering",
    parseAsString.withDefault("-release_date"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "page_size",
    parseAsInteger.withDefault(10),
  );

  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isAddMovieDialogOpen, setIsAddMovieDialogOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const filters = useMemo<MovieFilters>(
    () => ({
      search: search || undefined,
      ordering: ordering as MovieFilters["ordering"],
      page,
      page_size: pageSize,
    }),
    [search, ordering, page, pageSize],
  );

  const { data: moviesData, isLoading, error } = useMovies(filters);
  const deleteMovieMutation = useDeleteMovie();
  const deleteMoviesMutation = useDeleteMovies();

  const movies = moviesData?.results || [];
  const totalCount = moviesData?.count || 0;
  const hasNext = !!moviesData?.next;
  const hasPrevious = !!moviesData?.previous;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchQuery);
    setPage(1);
  };

  const handleOrderingChange = (newOrdering: string) => {
    setOrdering(newOrdering);
    setPage(1);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const canPreviousPage = hasPrevious;
  const canNextPage = hasNext;

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const toggleAllMoviesSelection = () => {
    if (selectedMovies.size === movies.length && movies.length > 0) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(movies.map((movie) => movie.id)));
    }
  };

  const isAllSelected =
    selectedMovies.size === movies.length && movies.length > 0;
  const isSomeSelected =
    selectedMovies.size > 0 && selectedMovies.size < movies.length;

  const handleDeleteMovie = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMovie = async () => {
    if (!movieToDelete) return;

    const deletePromise = deleteMovieMutation.mutateAsync(movieToDelete.id);

    toast.promise(deletePromise, {
      loading: `Deleting "${movieToDelete.title}"...`,
      success: () => {
        setIsDeleteDialogOpen(false);
        setMovieToDelete(null);
        // Remove from selected movies if it was selected
        setSelectedMovies((prev) => {
          const newSet = new Set(prev);
          newSet.delete(movieToDelete.id);
          return newSet;
        });
        return `"${movieToDelete.title}" has been deleted successfully`;
      },
      error: (error) => {
        console.error("Delete movie error:", error);
        return "Failed to delete movie. Please try again.";
      },
    });
  };

  const cancelDeleteMovie = () => {
    setIsDeleteDialogOpen(false);
    setMovieToDelete(null);
  };

  const handleBatchDelete = () => {
    if (selectedMovies.size === 0) return;
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchDelete = async () => {
    if (selectedMovies.size === 0) return;

    const movieIds = Array.from(selectedMovies);
    const deletePromise = deleteMoviesMutation.mutateAsync(movieIds);

    toast.promise(deletePromise, {
      loading: `Deleting ${selectedMovies.size} movie(s)...`,
      success: (result) => {
        setIsBatchDeleteDialogOpen(false);
        setSelectedMovies(new Set());
        return `${result.deleted_count} movie(s) deleted successfully`;
      },
      error: (error) => {
        console.error("Batch delete error:", error);
        return "Failed to delete movies. Please try again.";
      },
    });
  };

  const cancelBatchDelete = () => {
    setIsBatchDeleteDialogOpen(false);
  };

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-destructive">
            Error loading movies
          </h1>
          <p className="text-muted-foreground mt-2">
            Failed to load movies. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <MoviesPageSkeleton rows={pageSize} />;
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground">
            Manage your movie collection
          </p>
        </div>
        <Button onClick={() => setIsAddMovieDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Movie
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
        <Select value={ordering} onValueChange={handleOrderingChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-release_date">Newest First</SelectItem>
            <SelectItem value="release_date">Oldest First</SelectItem>
            <SelectItem value="-rating">Highest Rated</SelectItem>
            <SelectItem value="rating">Lowest Rated</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="-title">Title Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedMovies.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedMovies.size} movie(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
            disabled={deleteMoviesMutation.isPending}
          >
            {deleteMoviesMutation.isPending
              ? "Deleting..."
              : `Delete Selected (${selectedMovies.size})`}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-12">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      isAllSelected || (isSomeSelected && "indeterminate")
                    }
                    onCheckedChange={toggleAllMoviesSelection}
                    aria-label="Select all movies"
                  />
                </div>
              </TableHead>
              <TableHead className="w-16">Poster</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Genres</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No movies found
                </TableCell>
              </TableRow>
            ) : (
              movies.map((movie) => (
                <TableRow
                  key={movie.id}
                  className="hover:bg-muted/50 transition-colors"
                  data-state={
                    selectedMovies.has(movie.id) ? "selected" : undefined
                  }
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedMovies.has(movie.id)}
                        onCheckedChange={() => toggleMovieSelection(movie.id)}
                        aria-label={`Select ${movie.title}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {movie.poster_image ? (
                        <Image
                          src={movie.poster_image}
                          alt={movie.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No poster
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{movie.title}</div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="text-sm text-muted-foreground max-w-xs truncate"
                      title={movie.description}
                    >
                      {movie.description}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {movie.duration_formatted}
                  </TableCell>
                  <TableCell>
                    {new Date(movie.release_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {movie.rating ? (
                      <div className="flex items-center gap-1">
                        <span>★</span>
                        <span className="font-medium">{movie.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map((genre) => (
                        <Badge
                          key={genre.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                      {movie.genres.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{movie.genres.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                          size="icon"
                        >
                          <IconDotsVertical />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteMovie(movie)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center justify-between px-4 mt-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {selectedMovies.size > 0 ? (
              <span>
                {selectedMovies.size} of {totalCount} movie(s) selected.
              </span>
            ) : (
              <span>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
                movie(s).
              </span>
            )}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pageSize}`}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => handlePageChange(page - 1)}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => handlePageChange(page + 1)}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => handlePageChange(totalPages)}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movie</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{movieToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteMovie}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMovie}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMovieMutation.isPending}
            >
              {deleteMovieMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isBatchDeleteDialogOpen}
        onOpenChange={setIsBatchDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movies</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMovies.size} selected
              movie(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelBatchDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMoviesMutation.isPending}
            >
              {deleteMoviesMutation.isPending
                ? "Deleting..."
                : `Delete ${selectedMovies.size} Movie(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddMovieDialog
        open={isAddMovieDialogOpen}
        onOpenChange={setIsAddMovieDialogOpen}
      />
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<MoviesPageSkeletonFallback />}>
      <MoviesContent />
    </Suspense>
  );
}
