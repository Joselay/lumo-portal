"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateMovie, useGenres, useMovie } from "@/hooks/use-movies";
import type { UpdateMovieRequest } from "@/types/movies";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const updateMovieSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  release_date: z.date(),
  rating: z.number().min(0).max(10).optional(),
  poster_image: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  trailer_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  genre_ids: z.array(z.string()).optional(),
  is_active: z.boolean(),
});

type UpdateMovieFormData = z.infer<typeof updateMovieSchema>;

interface EditMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: string | null;
}

export function EditMovieDialog({
  open,
  onOpenChange,
  movieId,
}: EditMovieDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMovieMutation = useUpdateMovie();
  const { data: genresData } = useGenres();
  const {
    data: movie,
    isLoading: isLoadingMovie,
    error: movieError,
  } = useMovie(movieId || "");
  const genres = genresData?.results || [];

  const form = useForm<UpdateMovieFormData>({
    resolver: zodResolver(updateMovieSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 90,
      release_date: new Date(),
      rating: undefined,
      poster_image: "",
      trailer_url: "",
      genre_ids: [],
      is_active: true,
    },
  });

  useEffect(() => {
    if (movie && open && !isLoadingMovie) {
      form.reset({
        title: movie.title,
        description: movie.description,
        duration: movie.duration,
        release_date: parseISO(movie.release_date),
        rating: movie.rating ? parseFloat(movie.rating) : undefined,
        poster_image: movie.poster_image || "",
        trailer_url: movie.trailer_url || "",
        genre_ids: movie.genres.map((genre) => genre.id),
        is_active: movie.is_active,
      });
    }
  }, [movie, open, form, isLoadingMovie]);

  const onSubmit = async (data: UpdateMovieFormData) => {
    if (!movie) return;

    setIsSubmitting(true);

    const submitData: UpdateMovieRequest = {};

    if (data.title !== movie.title) {
      submitData.title = data.title;
    }
    if (data.description !== movie.description) {
      submitData.description = data.description;
    }
    if (data.duration !== movie.duration) {
      submitData.duration = data.duration;
    }

    const originalReleaseDate = format(
      parseISO(movie.release_date),
      "yyyy-MM-dd",
    );
    const newReleaseDate = format(data.release_date, "yyyy-MM-dd");
    if (newReleaseDate !== originalReleaseDate) {
      submitData.release_date = newReleaseDate;
    }

    const originalRating = movie.rating ? parseFloat(movie.rating) : undefined;
    if (data.rating !== originalRating) {
      submitData.rating = data.rating;
    }

    const originalPosterImage = movie.poster_image || "";
    const newPosterImage = data.poster_image || "";
    if (newPosterImage !== originalPosterImage) {
      submitData.poster_image = newPosterImage || undefined;
    }

    const originalTrailerUrl = movie.trailer_url || "";
    const newTrailerUrl = data.trailer_url || "";
    if (newTrailerUrl !== originalTrailerUrl) {
      submitData.trailer_url = newTrailerUrl || undefined;
    }

    const originalGenreIds = movie.genres.map((g) => g.id).sort();
    const newGenreIds = (data.genre_ids || []).sort();

    const genresChanged =
      originalGenreIds.length !== newGenreIds.length ||
      originalGenreIds.some((id, index) => id !== newGenreIds[index]);

    if (genresChanged) {
      submitData.genre_ids = data.genre_ids;
    }

    if (data.is_active !== movie.is_active) {
      submitData.is_active = data.is_active;
    }

    if (Object.keys(submitData).length === 0) {
      setIsSubmitting(false);
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    const updatePromise = updateMovieMutation.mutateAsync({
      id: movie.id,
      data: submitData,
    });

    toast.promise(updatePromise, {
      loading: "Updating movie...",
      success: (updatedMovie) => {
        form.reset();
        onOpenChange(false);
        setIsSubmitting(false);
        return `"${updatedMovie.title}" has been updated successfully`;
      },
      error: (error) => {
        setIsSubmitting(false);
        console.error("Update movie error:", error);
        return "Failed to update movie. Please check your inputs and try again.";
      },
    });
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!movieId) return null;

  if (movieError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Error Loading Movie</DialogTitle>
            <DialogDescription>
              Failed to load movie details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Movie</DialogTitle>
          <DialogDescription>
            Update the movie details. All required fields must be filled.
          </DialogDescription>
        </DialogHeader>

        {isLoadingMovie ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Movie title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="90"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Movie description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="release_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Release Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="8.5"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="poster_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poster Image URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/poster.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trailer_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trailer URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {genres.length > 0 && (
                <FormField
                  control={form.control}
                  name="genre_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel>Genres</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {genres.map((genre) => (
                          <FormField
                            key={genre.id}
                            control={form.control}
                            name="genre_ids"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={genre.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(genre.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([
                                              ...currentValue,
                                              genre.id,
                                            ])
                                          : field.onChange(
                                              currentValue.filter(
                                                (value) => value !== genre.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {genre.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormLabel className="text-sm text-muted-foreground">
                        Enable this movie to be visible and bookable
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Movie"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
