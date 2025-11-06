import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Controller,
  type ControllerRenderProps,
  useForm,
} from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createComplaint,
  selectComplaintsState,
} from "@/features/complaints/complaintsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import type { ChangeEvent } from "react";

const categories = [
  "Electrical",
  "Plumbing",
  "Painting",
  "Carpentry",
  "Cleaning",
  "Internet",
  "Furniture",
  "Pest Control",
  "Other",
] as const;

const hostels = ["BH-1", "BH-2", "BH-3", "BH-4"] as const;

const createComplaintSchema = z.object({
  problemTitle: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" }),
  problemDescription: z
    .string()
    .min(10, {
      message:
        "Please provide more details so the team can respond effectively",
    }),
  category: z.enum(categories, {
    errorMap: () => ({ message: "Select a category" }),
  }),
  hostel: z.enum(hostels, { errorMap: () => ({ message: "Select a hostel" }) }),
  roomNo: z.string().min(1, { message: "Room number is required" }),
  problemImage: z
    .any()
    .refine(
      (value) => value instanceof FileList && value.length > 0,
      "Attach an image to highlight the issue"
    ),
});

type CreateComplaintFormValues = z.infer<typeof createComplaintSchema>;

function StudentNewComplaintPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { createStatus, error } = useAppSelector(selectComplaintsState);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateComplaintFormValues>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      problemTitle: "",
      problemDescription: "",
      category: undefined,
      hostel: undefined,
      roomNo: "",
    },
  });

  const problemImageField = register("problemImage");

  const onSubmit = handleSubmit(async (values: CreateComplaintFormValues) => {
    const fileList = values.problemImage as FileList | undefined;
    const file = fileList?.item(0) ?? null;
    if (!file) {
      setError("problemImage", {
        message: "Attach an image to highlight the issue",
      });
      return;
    }

    const resultAction = await dispatch(
      createComplaint({
        problemTitle: values.problemTitle,
        problemDescription: values.problemDescription,
        category: values.category,
        hostel: values.hostel,
        roomNo: values.roomNo,
        file,
      })
    );

    if (createComplaint.fulfilled.match(resultAction)) {
      navigate(`/student/complaints/${resultAction.payload._id}`);
    }
  });

  const handleFilePreview = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setPreview(typeof reader.result === "string" ? reader.result : null);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              to="/student/complaints"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to complaints
            </Link>
            <h1 className="text-3xl font-semibold text-foreground">
              Submit a complaint
            </h1>
            <p className="text-sm text-muted-foreground">
              Share actionable details and evidence to help wardens resolve your
              request quickly.
            </p>
          </div>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Issue details</CardTitle>
            <CardDescription>
              Provide as much context as possible for faster follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="problemTitle">Title</Label>
                <Input
                  id="problemTitle"
                  placeholder="e.g., Ceiling fan not working"
                  {...register("problemTitle")}
                />
                {errors.problemTitle && (
                  <p className="text-sm text-destructive">
                    {errors.problemTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemDescription">Description</Label>
                <Textarea
                  id="problemDescription"
                  rows={6}
                  placeholder="Explain what happened, when you noticed it, and any temporary fixes you've tried."
                  {...register("problemDescription")}
                />
                {errors.problemDescription && (
                  <p className="text-sm text-destructive">
                    {errors.problemDescription.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Controller<CreateComplaintFormValues, "category">
                    name="category"
                    control={control}
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        CreateComplaintFormValues,
                        "category"
                      >;
                    }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value: string) =>
                          field.onChange(
                            value as CreateComplaintFormValues["category"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Hostel</Label>
                  <Controller<CreateComplaintFormValues, "hostel">
                    name="hostel"
                    control={control}
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        CreateComplaintFormValues,
                        "hostel"
                      >;
                    }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value: string) =>
                          field.onChange(
                            value as CreateComplaintFormValues["hostel"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {hostels.map((code) => (
                            <SelectItem key={code} value={code}>
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.hostel && (
                    <p className="text-sm text-destructive">
                      {errors.hostel.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNo">Room number</Label>
                <Input
                  id="roomNo"
                  placeholder="A-101"
                  {...register("roomNo")}
                />
                {errors.roomNo && (
                  <p className="text-sm text-destructive">
                    {errors.roomNo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemImage">Upload image</Label>
                <Input
                  id="problemImage"
                  type="file"
                  accept="image/*"
                  {...problemImageField}
                  onChange={(event) => {
                    problemImageField.onChange(event);
                    handleFilePreview(event);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Attach a clear photo or video screenshot to help wardens
                  triage the issue.
                </p>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 w-full rounded-lg border border-border object-cover"
                  />
                )}
                {(() => {
                  const problemImageErrorMessage = (
                    errors.problemImage as unknown as { message?: string }
                  )?.message;
                  return problemImageErrorMessage ? (
                    <p className="text-sm text-destructive">
                      {problemImageErrorMessage}
                    </p>
                  ) : null;
                })()}
              </div>

              {error && createStatus === "failed" && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={createStatus === "loading"}>
                  {createStatus === "loading"
                    ? "Submitting…"
                    : "Submit complaint"}
                </Button>
                <Button asChild variant="outline">
                  <Link to="/student/complaints">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StudentNewComplaintPage;
