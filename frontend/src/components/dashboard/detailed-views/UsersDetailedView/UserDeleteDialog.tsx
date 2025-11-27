import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { User } from "@/types/users";
import { AlertTriangle, Loader2 } from "lucide-react";

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserDeleteDialog({
  open,
  onClose,
  user,
  onConfirm,
  isLoading = false,
}: UserDeleteDialogProps) {
  const handleConfirm = async () => {
    if (!user) return;
    await onConfirm(user._id);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete the user
            account and all associated data including complaints, feedback, and
            notifications.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          {user && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-medium">User to be deleted:</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Role:</strong> {user.role}
              </p>
              {user.hostel && (
                <p className="text-sm text-muted-foreground">
                  <strong>Hostel:</strong> {user.hostel}
                </p>
              )}
            </div>
          )}
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> All related data including complaints,
              feedback, transit requests, notifications, and fee submissions
              will be permanently deleted.
            </p>
          </div>
        </div>
        <SheetFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
