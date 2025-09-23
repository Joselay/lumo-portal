"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateUser, useUser } from "@/hooks/use-users";
import type { UpdateUserRequest } from "@/types/users";
import { cn } from "@/lib/utils";

const updateUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(150, "Username must be less than 150 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  first_name: z
    .string()
    .max(30, "First name must be less than 30 characters")
    .optional()
    .or(z.literal("")),
  last_name: z
    .string()
    .max(150, "Last name must be less than 150 characters")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
  phone_number: z.string().optional().or(z.literal("")),
  date_of_birth: z.date().optional(),
  preferred_language: z.enum(["en", "es", "fr"]).optional(),
  receive_booking_notifications: z.boolean(),
  avatar_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
}

export function EditUserDialog({
  open,
  onOpenChange,
  userId,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading, error } = useUser(userId || 0);
  const updateUserMutation = useUpdateUser();

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      is_active: true,
      is_staff: false,
      is_superuser: false,
      phone_number: "",
      date_of_birth: undefined,
      preferred_language: "en",
      receive_booking_notifications: true,
      avatar_url: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        phone_number: user.customer_profile?.phone_number || "",
        date_of_birth: user.customer_profile?.date_of_birth
          ? new Date(user.customer_profile.date_of_birth)
          : undefined,
        preferred_language: user.customer_profile?.preferred_language || "en",
        receive_booking_notifications:
          user.customer_profile?.receive_booking_notifications ?? true,
        avatar_url: user.customer_profile?.avatar_url || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!userId || !user) return;

    setIsSubmitting(true);

    const submitData: UpdateUserRequest = {};

    if (data.username !== user.username) {
      submitData.username = data.username;
    }
    if (data.email !== user.email) {
      submitData.email = data.email;
    }
    if (data.first_name !== (user.first_name || "")) {
      submitData.first_name = data.first_name || undefined;
    }
    if (data.last_name !== (user.last_name || "")) {
      submitData.last_name = data.last_name || undefined;
    }
    if (data.is_active !== user.is_active) {
      submitData.is_active = data.is_active;
    }
    if (data.is_staff !== user.is_staff) {
      submitData.is_staff = data.is_staff;
    }
    if (data.is_superuser !== user.is_superuser) {
      submitData.is_superuser = data.is_superuser;
    }

    const originalPhoneNumber = user.customer_profile?.phone_number || "";
    const newPhoneNumber = data.phone_number || "";
    if (newPhoneNumber !== originalPhoneNumber) {
      submitData.phone_number = newPhoneNumber || undefined;
    }

    const originalDateOfBirth = user.customer_profile?.date_of_birth
      ? format(new Date(user.customer_profile.date_of_birth), "yyyy-MM-dd")
      : "";
    const newDateOfBirth = data.date_of_birth
      ? format(data.date_of_birth, "yyyy-MM-dd")
      : "";
    if (newDateOfBirth !== originalDateOfBirth) {
      submitData.date_of_birth = newDateOfBirth || undefined;
    }

    const originalPreferredLanguage =
      user.customer_profile?.preferred_language || "en";
    if (data.preferred_language !== originalPreferredLanguage) {
      submitData.preferred_language = data.preferred_language;
    }

    const originalReceiveNotifications =
      user.customer_profile?.receive_booking_notifications ?? true;
    if (data.receive_booking_notifications !== originalReceiveNotifications) {
      submitData.receive_booking_notifications =
        data.receive_booking_notifications;
    }

    const originalAvatarUrl = user.customer_profile?.avatar_url || "";
    const newAvatarUrl = data.avatar_url || "";
    if (newAvatarUrl !== originalAvatarUrl) {
      submitData.avatar_url = newAvatarUrl || undefined;
    }

    if (Object.keys(submitData).length === 0) {
      setIsSubmitting(false);
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    const updatePromise = updateUserMutation.mutateAsync({
      id: userId,
      data: submitData,
    });

    toast.promise(updatePromise, {
      loading: "Updating user...",
      success: (updatedUser) => {
        onOpenChange(false);
        setIsSubmitting(false);
        return `"${updatedUser.username}" has been updated successfully`;
      },
      error: (error) => {
        setIsSubmitting(false);
        console.error("Update user error:", error);
        return "Failed to update user. Please check your inputs and try again.";
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load user data. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCancel}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user account information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          {...field}
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
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
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
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormLabel className="text-sm text-muted-foreground">
                          Enable this user account
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

                <FormField
                  control={form.control}
                  name="is_staff"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Staff Status
                        </FormLabel>
                        <FormLabel className="text-sm text-muted-foreground">
                          Grant staff privileges to this user
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

                <FormField
                  control={form.control}
                  name="is_superuser"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Admin Status
                        </FormLabel>
                        <FormLabel className="text-sm text-muted-foreground">
                          Grant admin privileges to this user
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

                <FormField
                  control={form.control}
                  name="receive_booking_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Booking Notifications
                        </FormLabel>
                        <FormLabel className="text-sm text-muted-foreground">
                          Send booking confirmation emails
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
              </div>

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
                  {isSubmitting ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
