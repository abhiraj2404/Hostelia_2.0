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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/api-client";

interface Hostel {
  _id: string;
  name: string;
}

interface WardenCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: WardenCreateData) => Promise<void>;
  isLoading?: boolean;
  /** Optional: if provided, pre-select the hostel and lock the field */
  preselectedHostelId?: string;
}

export function WardenCreateDialog({
  open,
  onClose,
  onCreate,
  isLoading = false,
  preselectedHostelId,
}: WardenCreateDialogProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [hostelsLoading, setHostelsLoading] = useState(false);

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
      hostelId: preselectedHostelId || "",
      password: "",
    },
  });

  const selectedHostel = watch("hostelId");

  // Fetch hostels when dialog opens
  useEffect(() => {
    if (!open) return;
    const fetchHostels = async () => {
      setHostelsLoading(true);
      try {
        const response = await apiClient.get("/hostel/list");
        if (response.data?.success) {
          setHostels(response.data.hostels || []);
        }
      } catch {
        // silently fail — dropdown will be empty
      } finally {
        setHostelsLoading(false);
      }
    };
    fetchHostels();
  }, [open]);

  // Set preselected hostel when it changes
  useEffect(() => {
    if (preselectedHostelId) {
      setValue("hostelId", preselectedHostelId);
    }
  }, [preselectedHostelId, setValue]);

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
              placeholder="warden.name@college.edu"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostel">
              Hostel <span className="text-destructive">*</span>
            </Label>
            {hostelsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading hostels...
              </div>
            ) : (
              <Select
                value={selectedHostel}
                onValueChange={(value) => setValue("hostelId", value)}
                disabled={!!preselectedHostelId}
              >
                <SelectTrigger id="hostel">
                  <SelectValue placeholder="Select hostel" />
                </SelectTrigger>
                <SelectContent>
                  {hostels.map((hostel) => (
                    <SelectItem key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.hostelId && (
              <p className="text-xs text-destructive">
                {errors.hostelId.message}
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
