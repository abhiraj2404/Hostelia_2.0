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
import type { WardenCreateData } from "@/types/users";
import {
  createWardenSchema,
  type CreateWardenFormData,
} from "@/utils/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface WardenCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: WardenCreateData) => Promise<void>;
  isLoading?: boolean;
}

export function WardenCreateDialog({
  open,
  onClose,
  onCreate,
  isLoading = false,
}: WardenCreateDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateWardenFormData>({
    resolver: zodResolver(createWardenSchema),
    defaultValues: {
      name: "",
      email: "",
      hostel: undefined,
      password: "",
    },
  });

  const selectedHostel = watch("hostel");

  const onSubmit = async (data: CreateWardenFormData) => {
    await onCreate(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Warden</SheetTitle>
          <SheetDescription>
            Create a new warden account. The warden will receive login
            credentials via email. Maximum 2 wardens per hostel.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter warden name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="warden.name@iiits.in"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostel">
              Hostel <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedHostel}
              onValueChange={(value) =>
                setValue("hostel", value as "BH-1" | "BH-2" | "BH-3" | "BH-4")
              }
            >
              <SelectTrigger id="hostel">
                <SelectValue placeholder="Select hostel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BH-1">BH-1</SelectItem>
                <SelectItem value="BH-2">BH-2</SelectItem>
                <SelectItem value="BH-3">BH-3</SelectItem>
                <SelectItem value="BH-4">BH-4</SelectItem>
              </SelectContent>
            </Select>
            {errors.hostel && (
              <p className="text-xs text-destructive">
                {errors.hostel.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Minimum 6 characters"
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This password will be sent to the warden via email.
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
                  Creating...
                </>
              ) : (
                "Create Warden"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
