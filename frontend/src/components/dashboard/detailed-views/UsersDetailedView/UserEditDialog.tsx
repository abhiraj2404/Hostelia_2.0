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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [formData, setFormData] = useState<Partial<UserFormData>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        year: user.year,
        hostel: user.hostel,
        roomNo: user.roomNo,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Filter out undefined values
    const dataToUpdate: Partial<UserFormData> = {};
    if (formData.name !== undefined) dataToUpdate.name = formData.name;
    if (formData.email !== undefined) dataToUpdate.email = formData.email;
    if (formData.rollNo !== undefined) dataToUpdate.rollNo = formData.rollNo;
    if (formData.year !== undefined) dataToUpdate.year = formData.year;
    if (formData.hostel !== undefined) dataToUpdate.hostel = formData.hostel;
    if (formData.roomNo !== undefined) dataToUpdate.roomNo = formData.roomNo;

    await onSave(user._id, dataToUpdate);
  };

  const isStudent = user?.role === "student";
  const isWarden = user?.role === "warden";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update user information. Changes will be saved immediately.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {isStudent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  value={formData.rollNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNo: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData.year || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      year: value as UserFormData["year"],
                    })
                  }
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
              </div>
            </>
          )}

          {(isStudent || isWarden) && (
            <div className="space-y-2">
              <Label htmlFor="hostel">Hostel</Label>
              <Select
                value={formData.hostel || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    hostel: value as UserFormData["hostel"],
                  })
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
            </div>
          )}

          {isStudent && (
            <div className="space-y-2">
              <Label htmlFor="roomNo">Room Number</Label>
              <Input
                id="roomNo"
                value={formData.roomNo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, roomNo: e.target.value })
                }
              />
            </div>
          )}

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
