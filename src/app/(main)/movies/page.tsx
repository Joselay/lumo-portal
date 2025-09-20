"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMovies } from "@/hooks/use-movies";
import type { MovieFilters } from "@/types/movies";

export default function MoviesPage() {
  const [filters, setFilters] = useState<MovieFilters>({
    ordering: "-release_date",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: moviesData, isLoading, error } = useMovies(filters);

  const movies = moviesData?.results || [];
  const totalCount = moviesData?.count || 0;
  const hasNext = !!moviesData?.next;
  const hasPrevious = !!moviesData?.previous;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchQuery, page: 1 };
    setFilters(newFilters);
  };

  const handleOrderingChange = (ordering: string) => {
    const newFilters = {
      ...filters,
      ordering: ordering as MovieFilters["ordering"],
      page: 1,
    };
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
  };

  const currentPage = filters.page || 1;

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
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Poster</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }, (_, i) => (
                  <TableRow key={`loading-skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-12 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
            <p className="text-muted-foreground mt-2">
              Manage your movie collection and catalog
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCount} movies total
          </div>
        </div>
      </div>
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
        <Select
          value={filters.ordering || "-release_date"}
          onValueChange={handleOrderingChange}
        >
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

      {/* Movies Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Poster</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Genres</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }, (_, i) => (
                <TableRow key={`content-skeleton-${i}`}>
                  <TableCell>
                    <Skeleton className="h-12 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : movies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                >
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
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(hasPrevious || hasNext) && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={!hasPrevious}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage}
            </span>
          </div>
          <Button
            variant="outline"
            disabled={!hasNext}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
