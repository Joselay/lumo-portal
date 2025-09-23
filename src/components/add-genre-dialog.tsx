"use client";

import { useState } from "react";
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
import { useCreateGenre } from "@/hooks/use-genres";

interface AddGenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGenreDialog({ open, onOpenChange }: AddGenreDialogProps) {
  const [name, setName] = useState("");
  const createGenreMutation = useCreateGenre();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Genre name is required");
      return;
    }

    const createPromise = createGenreMutation.mutateAsync({
      name: name.trim(),
    });

    toast.promise(createPromise, {
      loading: "Creating genre...",
      success: (newGenre) => {
        onOpenChange(false);
        setName("");
        return `"${newGenre.name}" has been created successfully`;
      },
      error: (error) => {
        console.error("Create genre error:", error);
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.name) {
            return `Failed to create genre: ${errorData.name[0]}`;
          }
        } catch {
          // Ignore parsing errors
        }
        return "Failed to create genre. Please try again.";
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Genre</DialogTitle>
          <DialogDescription>
            Create a new genre that can be assigned to movies.
          </DialogDescription>
        </DialogHeader>
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
              disabled={createGenreMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGenreMutation.isPending || !name.trim()}
            >
              {createGenreMutation.isPending ? "Creating..." : "Create Genre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
