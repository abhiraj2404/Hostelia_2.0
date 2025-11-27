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
import type { User, UserFormData } from "@/types/users";
import {
  updateUserSchema,
  type UpdateUserFormData,
} from "@/utils/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, data: Partial<UserFormData>) => Promise<void>;
  isLoading?: boolean;
  wardenCounts?: Record<string, number>; // hostel -> count
}

export function UserEditDialog({
  open,
  onClose,
  user,
  onSave,
  isLoading = false,
  wardenCounts = {},
}: UserEditDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNo: "",
      year: undefined,
      hostel: undefined,
      roomNo: "",
    },
    mode: "onChange", // Validate on change to show errors immediately
  });

  const selectedHostel = watch("hostel");
  const originalHostel = user?.hostel;

  // Define these before onSubmit to avoid ReferenceError
  const isStudent = user?.role === "student";
  const isWarden = user?.role === "warden";

  // Check if warden is sole warden of their hostel
  const isSoleWarden =
    isWarden && originalHostel && wardenCounts[originalHostel] === 1;
  const canChangeHostel = !isWarden || !isSoleWarden;

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        rollNo: user.rollNo || "",
        year: user.year,
        hostel: user.hostel,
        roomNo: user.roomNo || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    // Validate year is required for students
    if (isStudent) {
      const currentYear = watch("year");
      if (!currentYear) {
        setError("year", {
          type: "required",
          message: "Year is required for students",
        });
        toast.error("Year is required for students");
        return;
      }
    }

    // Filter out undefined and empty string values, and only include changed values
    const dataToUpdate: Partial<UserFormData> = {};

    if (
      data.name !== undefined &&
      data.name !== null &&
      typeof data.name === "string" &&
      data.name !== "" &&
      data.name !== user.name
    ) {
      dataToUpdate.name = data.name;
    }
    if (
      data.email !== undefined &&
      data.email !== null &&
      typeof data.email === "string" &&
      data.email !== "" &&
      data.email !== user.email
    ) {
      dataToUpdate.email = data.email;
    }
    if (isStudent) {
      if (
        data.rollNo !== undefined &&
        data.rollNo !== null &&
        typeof data.rollNo === "string" &&
        data.rollNo !== "" &&
        data.rollNo !== user.rollNo
      ) {
        dataToUpdate.rollNo = data.rollNo;
      }
      // Year is required for students, so always include it
      const yearValue = (data.year || watch("year")) as
        | "UG-1"
        | "UG-2"
        | "UG-3"
        | "UG-4"
        | undefined;
      if (
        yearValue &&
        (yearValue === "UG-1" ||
          yearValue === "UG-2" ||
          yearValue === "UG-3" ||
          yearValue === "UG-4")
      ) {
        if (yearValue !== user.year) {
          dataToUpdate.year = yearValue;
        }
      }
      if (
        data.roomNo !== undefined &&
        data.roomNo !== null &&
        typeof data.roomNo === "string" &&
        data.roomNo !== "" &&
        data.roomNo !== user.roomNo
      ) {
        dataToUpdate.roomNo = data.roomNo;
      }
    }
    if (
      (isStudent || isWarden) &&
      data.hostel !== undefined &&
      data.hostel !== null &&
      (data.hostel === "BH-1" ||
        data.hostel === "BH-2" ||
        data.hostel === "BH-3" ||
        data.hostel === "BH-4") &&
      data.hostel !== user.hostel
    ) {
      dataToUpdate.hostel = data.hostel;
    }

    // Only proceed if there are actual changes
    if (Object.keys(dataToUpdate).length === 0) {
      toast.info("No changes to save");
      return; // No changes to save
    }

    try {
      await onSave(user._id, dataToUpdate);
      // Close dialog only on successful save
      handleClose();
    } catch {
      // Error handling is done in the parent component
      // Don't close the dialog on error - let the user see the error and retry if needed
      // The parent's onSave will handle the error and show toast
    }
  };

  const handleClose = () => {
    reset();
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
            // Log validation errors for debugging
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
              placeholder="user@iiits.in"
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
                <Label htmlFor="year">Year</Label>
                <Select
                  value={(watch("year") as string | undefined) || ""}
                  onValueChange={(value) => {
                    setValue(
                      "year",
                      value as "UG-1" | "UG-2" | "UG-3" | "UG-4",
                      {
                        shouldValidate: true,
                      }
                    );
                  }}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UG-1">UG-1</SelectItem>
                    <SelectItem value="UG-2">UG-2</SelectItem>
                    <SelectItem value="UG-3">UG-3</SelectItem>
                    <SelectItem value="UG-4">UG-4</SelectItem>
                  </SelectContent>
                </Select>
                {errors.year && errors.year.message && (
                  <p className="text-xs text-destructive">
                    {errors.year.message}
                  </p>
                )}
              </div>
            </>
          )}

          {(isStudent || isWarden) && (
            <div className="space-y-2">
              <Label htmlFor="hostel">Hostel</Label>
              <Select
                value={(selectedHostel as string | undefined) || ""}
                onValueChange={(value) =>
                  setValue("hostel", value as "BH-1" | "BH-2" | "BH-3" | "BH-4")
                }
                disabled={!canChangeHostel}
              >
                <SelectTrigger
                  id="hostel"
                  className={!canChangeHostel ? "opacity-50" : ""}
                >
                  <SelectValue placeholder="Select hostel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BH-1">BH-1</SelectItem>
                  <SelectItem value="BH-2">BH-2</SelectItem>
                  <SelectItem value="BH-3">BH-3</SelectItem>
                  <SelectItem value="BH-4">BH-4</SelectItem>
                </SelectContent>
              </Select>
              {!canChangeHostel && (
                <p className="text-xs text-muted-foreground">
                  Cannot change hostel. This warden is the only warden for{" "}
                  {originalHostel}.
                </p>
              )}
              {errors.hostel && errors.hostel.message && (
                <p className="text-xs text-destructive">
                  {errors.hostel.message}
                </p>
              )}
            </div>
          )}

          {isStudent && (
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
          )}

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
