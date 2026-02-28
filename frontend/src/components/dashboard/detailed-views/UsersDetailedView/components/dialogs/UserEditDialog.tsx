import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import apiClient from "@/lib/api-client";
import type { User, UserFormData } from "@/types/users";
import {
  updateUserSchema,
  type UpdateUserFormData,
} from "@/utils/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Mess {
  _id: string;
  name: string;
}

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, data: Partial<UserFormData>) => Promise<void>;
  isLoading?: boolean;
}

export function UserEditDialog({
  open,
  onClose,
  user,
  onSave,
  isLoading = false,
}: UserEditDialogProps) {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMessId, setSelectedMessId] = useState<string>("unassigned");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNo: "",
      hostelId: "",
      roomNo: "",
    },
    mode: "onChange",
  });

  const isStudent = user?.role === "student";
  const isWarden = user?.role === "warden";

  // Fetch messes list
  useEffect(() => {
    if (open) {
      apiClient
        .get("/mess/list")
        .then((res) => setMesses(res.data.messes || []))
        .catch(() => setMesses([]));
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        rollNo: user.rollNo || "",
        hostelId: user.hostelId || "",
        roomNo: user.roomNo || "",
      });
      setSelectedMessId(user.messId || "unassigned");
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    // Filter out unchanged values
    const dataToUpdate: Partial<UserFormData> = {};

    if (data.name && data.name !== user.name) {
      dataToUpdate.name = data.name as string;
    }
    if (data.email && data.email !== user.email) {
      dataToUpdate.email = data.email as string;
    }
    if (isStudent) {
      if (data.rollNo && data.rollNo !== user.rollNo) {
        dataToUpdate.rollNo = data.rollNo as string;
      }
      if (data.roomNo && data.roomNo !== user.roomNo) {
        dataToUpdate.roomNo = data.roomNo as string;
      }
    }
    if ((isStudent || isWarden) && data.hostelId && data.hostelId !== user.hostelId) {
      dataToUpdate.hostelId = data.hostelId as string;
    }

    // Check if mess assignment changed
    const currentMessId = user.messId || "unassigned";
    if (selectedMessId !== currentMessId) {
      dataToUpdate.messId =
        selectedMessId === "unassigned" ? null : selectedMessId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await onSave(user._id, dataToUpdate);
      handleClose();
    } catch {
      // Error handling in parent
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMessId("unassigned");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update user information. Changes will be saved immediately.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            if (Object.keys(errors).length > 0) {
              console.error("Form validation errors:", errors);
              toast.error("Please fix the form errors before submitting");
            }
          })}
          className="space-y-4 py-4"
        >
          {errors.root && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {errors.root.message || "Please fix the errors below"}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Enter name" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="user@campus.edu"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {isStudent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  maxLength={3}
                  {...register("rollNo")}
                  placeholder="e.g., 001"
                />
                {errors.rollNo && (
                  <p className="text-xs text-destructive">
                    {errors.rollNo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNo">Room Number</Label>
                <Input
                  id="roomNo"
                  {...register("roomNo")}
                  placeholder="e.g., 123"
                />
                {errors.roomNo && (
                  <p className="text-xs text-destructive">
                    {errors.roomNo.message}
                  </p>
                )}
              </div>
            </>
          )}

          {(isStudent || isWarden) && (
            <div className="space-y-2">
              <Label htmlFor="hostelId">Hostel ID</Label>
              <Input
                id="hostelId"
                {...register("hostelId")}
                placeholder="Hostel ID"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Hostel assignment is managed by the admin.
              </p>
              {errors.hostelId && (
                <p className="text-xs text-destructive">
                  {errors.hostelId.message}
                </p>
              )}
            </div>
          )}

          {/* Mess Assignment */}
          <div className="space-y-2">
            <Label>Mess Assignment</Label>
            <Select
              value={selectedMessId}
              onValueChange={setSelectedMessId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a mess" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {messes.map((mess) => (
                  <SelectItem key={mess._id} value={mess._id}>
                    {mess.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Assign this user to a mess for meal tracking.
            </p>
          </div>

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
