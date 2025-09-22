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
  UsersPageSkeleton,
  UsersPageSkeletonFallback,
} from "@/components/skeletons/users-page-skeleton";
import { AddUserDialog } from "@/components/add-user-dialog";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { useDeleteUser, useDeleteUsers, useUsers } from "@/hooks/use-users";
import type { User, UserFilters } from "@/types/users";

function UsersContent() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [ordering, setOrdering] = useQueryState(
    "ordering",
    parseAsString.withDefault("-date_joined"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "page_size",
    parseAsInteger.withDefault(10),
  );

  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<number | null>(null);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
      setPage(1);
    }
  }, [debouncedSearch, search, setSearch, setPage]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const filters = useMemo<UserFilters>(
    () => ({
      search: search || undefined,
      ordering: ordering as UserFilters["ordering"],
      page,
      page_size: pageSize,
    }),
    [search, ordering, page, pageSize],
  );

  const { data: usersData, isLoading, error } = useUsers(filters);
  const deleteUserMutation = useDeleteUser();
  const deleteUsersMutation = useDeleteUsers();

  const users = usersData?.results || [];
  const totalCount = usersData?.count || 0;
  const hasNext = !!usersData?.next;
  const hasPrevious = !!usersData?.previous;
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

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleAllUsersSelection = () => {
    if (selectedUsers.size === users.length && users.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user) => user.id)));
    }
  };

  const isAllSelected = selectedUsers.size === users.length && users.length > 0;
  const isSomeSelected =
    selectedUsers.size > 0 && selectedUsers.size < users.length;

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user.id);
    setIsEditUserDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    const deletePromise = deleteUserMutation.mutateAsync(userToDelete.id);

    toast.promise(deletePromise, {
      loading: `Deleting "${userToDelete.username}"...`,
      success: () => {
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        setSelectedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userToDelete.id);
          return newSet;
        });
        return `"${userToDelete.username}" has been deleted successfully`;
      },
      error: (error) => {
        console.error("Delete user error:", error);
        return "Failed to delete user. Please try again.";
      },
    });
  };

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleBatchDelete = () => {
    if (selectedUsers.size === 0) return;
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchDelete = async () => {
    if (selectedUsers.size === 0) return;

    const userIds = Array.from(selectedUsers);
    const deletePromise = deleteUsersMutation.mutateAsync(userIds);

    toast.promise(deletePromise, {
      loading: `Deleting ${selectedUsers.size} user(s)...`,
      success: (result) => {
        setIsBatchDeleteDialogOpen(false);
        setSelectedUsers(new Set());
        return `${result.deleted_count} user(s) deleted successfully`;
      },
      error: (error) => {
        console.error("Batch delete error:", error);
        return "Failed to delete users. Please try again.";
      },
    });
  };

  const cancelBatchDelete = () => {
    setIsBatchDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFullName = (user: User) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username;
  };

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-destructive">
            Error loading users
          </h1>
          <p className="text-muted-foreground mt-2">
            Failed to load users. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <UsersPageSkeleton rows={pageSize} />;
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
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
            <SelectItem value="-date_joined">Newest First</SelectItem>
            <SelectItem value="date_joined">Oldest First</SelectItem>
            <SelectItem value="username">Username A-Z</SelectItem>
            <SelectItem value="-username">Username Z-A</SelectItem>
            <SelectItem value="email">Email A-Z</SelectItem>
            <SelectItem value="-email">Email Z-A</SelectItem>
            <SelectItem value="first_name">Name A-Z</SelectItem>
            <SelectItem value="-first_name">Name Z-A</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {selectedUsers.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedUsers.size} user(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
            disabled={deleteUsersMutation.isPending}
          >
            {deleteUsersMutation.isPending
              ? "Deleting..."
              : `Delete Selected (${selectedUsers.size})`}
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
                    onCheckedChange={toggleAllUsersSelection}
                    aria-label="Select all users"
                  />
                </div>
              </TableHead>
              <TableHead className="w-16">Avatar</TableHead>
              <TableHead className="w-32">Username</TableHead>
              <TableHead className="w-48">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                  data-state={
                    selectedUsers.has(user.id) ? "selected" : undefined
                  }
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                        aria-label={`Select ${user.username}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      {user.customer_profile?.avatar_url ? (
                        <Image
                          src={user.customer_profile.avatar_url}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-sm font-medium text-muted-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="font-medium max-w-32 truncate"
                      title={user.username}
                    >
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="max-w-48 truncate"
                      title={getFullName(user)}
                    >
                      {getFullName(user)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="text-sm text-muted-foreground truncate"
                      title={user.email}
                    >
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === "admin" ? "Admin" : "Customer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.date_joined)}</TableCell>
                  <TableCell>
                    {user.last_login ? (
                      formatDate(user.last_login)
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
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
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
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
            {selectedUsers.size > 0 ? (
              <span>
                {selectedUsers.size} of {totalCount} user(s) selected.
              </span>
            ) : (
              <span>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount} user(s).
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.username}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteUser}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
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
            <AlertDialogTitle>Delete Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.size} selected
              user(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelBatchDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUsersMutation.isPending}
            >
              {deleteUsersMutation.isPending
                ? "Deleting..."
                : `Delete ${selectedUsers.size} User(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
      />

      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={(open) => {
          setIsEditUserDialogOpen(open);
          if (!open) {
            setUserToEdit(null);
          }
        }}
        userId={userToEdit}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageSkeletonFallback />}>
      <UsersContent />
    </Suspense>
  );
}
