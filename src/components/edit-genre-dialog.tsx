"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenre, useUpdateGenre } from "@/hooks/use-genres";

interface EditGenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genreId: string | null;
}

export function EditGenreDialog({
  open,
  onOpenChange,
  genreId,
}: EditGenreDialogProps) {
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const { data: genre, isLoading, error } = useGenre(genreId || "");
  const updateGenreMutation = useUpdateGenre();

  useEffect(() => {
    if (genre) {
      setName(genre.name);
      setOriginalName(genre.name);
    }
  }, [genre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!genreId) return;

    if (!name.trim()) {
      toast.error("Genre name is required");
      return;
    }

    if (name.trim() === originalName) {
      toast.info("No changes to save");
      return;
    }

    const updatePromise = updateGenreMutation.mutateAsync({
      id: genreId,
      data: { name: name.trim() },
    });

    toast.promise(updatePromise, {
      loading: "Updating genre...",
      success: (updatedGenre) => {
        onOpenChange(false);
        return `"${updatedGenre.name}" has been updated successfully`;
      },
      error: (error) => {
        console.error("Update genre error:", error);
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.name) {
            return `Failed to update genre: ${errorData.name[0]}`;
          }
        } catch {
          // Ignore parsing errors
        }
        return "Failed to update genre. Please try again.";
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (genre) {
      setName(genre.name);
    }
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load genre information. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Genre</DialogTitle>
          <DialogDescription>Update the genre information.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Genre Name</Label>
              <Skeleton className="h-10" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Genre Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Action, Comedy, Drama"
                  required
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateGenreMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateGenreMutation.isPending ||
                  !name.trim() ||
                  name.trim() === originalName
                }
              >
                {updateGenreMutation.isPending ? "Updating..." : "Update Genre"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
