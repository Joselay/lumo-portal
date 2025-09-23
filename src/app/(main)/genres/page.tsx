"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconPlus,
} from "@tabler/icons-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AddGenreDialog } from "@/components/add-genre-dialog";
import { EditGenreDialog } from "@/components/edit-genre-dialog";
import { useGenres, useDeleteGenre } from "@/hooks/use-genres";
import type { GenreDetail, GenreFilters } from "@/types/movies";

function GenresPageSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Movies Count</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GenresContent() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [ordering, setOrdering] = useQueryState(
    "ordering",
    parseAsString.withDefault("name"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "page_size",
    parseAsInteger.withDefault(10),
  );

  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [genreToDelete, setGenreToDelete] = useState<GenreDetail | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddGenreDialogOpen, setIsAddGenreDialogOpen] = useState(false);
  const [isEditGenreDialogOpen, setIsEditGenreDialogOpen] = useState(false);
  const [genreToEdit, setGenreToEdit] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
      setPage(1);
    }
  }, [debouncedSearch, search, setSearch, setPage]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const filters = useMemo<GenreFilters>(
    () => ({
      search: search || undefined,
      ordering: ordering as GenreFilters["ordering"],
      page,
      page_size: pageSize,
    }),
    [search, ordering, page, pageSize],
  );

  const { data: genresData, isLoading, error } = useGenres(filters);
  const deleteGenreMutation = useDeleteGenre();

  const genres = genresData?.results || [];
  const totalCount = genresData?.count || 0;
  const hasNext = !!genresData?.next;
  const hasPrevious = !!genresData?.previous;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  const handleDeleteGenre = (genre: GenreDetail) => {
    setGenreToDelete(genre);
    setIsDeleteDialogOpen(true);
  };

  const handleEditGenre = (genre: GenreDetail) => {
    setGenreToEdit(genre.id);
    setIsEditGenreDialogOpen(true);
  };

  const confirmDeleteGenre = async () => {
    if (!genreToDelete) return;

    const deletePromise = deleteGenreMutation.mutateAsync(genreToDelete.id);

    toast.promise(deletePromise, {
      loading: `Deleting "${genreToDelete.name}"...`,
      success: () => {
        setIsDeleteDialogOpen(false);
        setGenreToDelete(null);
        return `"${genreToDelete.name}" has been deleted successfully`;
      },
      error: (error) => {
        console.error("Delete genre error:", error);
        return "Failed to delete genre. Please try again.";
      },
    });
  };

  const cancelDeleteGenre = () => {
    setIsDeleteDialogOpen(false);
    setGenreToDelete(null);
  };

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-destructive">
            Error loading genres
          </h1>
          <p className="text-muted-foreground mt-2">
            Failed to load genres. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <GenresPageSkeleton rows={pageSize} />;
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search genres..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={ordering} onValueChange={handleOrderingChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="-name">Name Z-A</SelectItem>
            <SelectItem value="-movies_count">Most Movies</SelectItem>
            <SelectItem value="movies_count">Least Movies</SelectItem>
            <SelectItem value="-created_at">Newest First</SelectItem>
            <SelectItem value="created_at">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddGenreDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Genre
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Movies Count</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {genres.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No genres found
                </TableCell>
              </TableRow>
            ) : (
              genres.map((genre) => (
                <TableRow
                  key={genre.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="font-medium">{genre.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="tabular-nums">
                      {genre.movies_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {genre.created_at
                      ? new Date(genre.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {genre.updated_at
                      ? new Date(genre.updated_at).toLocaleDateString()
                      : "—"}
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
                        <DropdownMenuItem
                          onClick={() => handleEditGenre(genre)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteGenre(genre)}
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
            <span>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} genre(s).
            </span>
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
            <AlertDialogTitle>Delete Genre</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{genreToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteGenre}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGenre}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGenreMutation.isPending}
            >
              {deleteGenreMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddGenreDialog
        open={isAddGenreDialogOpen}
        onOpenChange={setIsAddGenreDialogOpen}
      />

      <EditGenreDialog
        open={isEditGenreDialogOpen}
        onOpenChange={(open) => {
          setIsEditGenreDialogOpen(open);
          if (!open) {
            setGenreToEdit(null);
          }
        }}
        genreId={genreToEdit}
      />
    </div>
  );
}

export default function GenresPage() {
  return (
    <Suspense fallback={<GenresPageSkeleton />}>
      <GenresContent />
    </Suspense>
  );
}
