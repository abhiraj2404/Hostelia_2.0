import { z } from "zod";

/**
 * Validation schemas for user management forms
 * Matches backend validation in auth.controller.js and user.controller.js
 */

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .regex(/^[A-Za-z\s]+$/, "Name must only contain letters and spaces")
  .refine((name) => name.trim() !== "", "Name cannot be blank or only spaces");

export const rollNoSchema = z
  .string()
  .regex(/^[0-9]{3}$/, "Roll number must be exactly 3 digits")
  .refine((val) => parseInt(val) >= 1, "Enter a valid Roll Number");

export const emailSchema = z
  .string()
  .email("Invalid email format");

export const roomNoSchema = z
  .string()
  .min(1, "Room number is required")
  .refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 100 && num < 1000;
  }, "Enter a valid room-number (100-999)");

export const hostelIdSchema = z.string().min(1, "Hostel is required");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Schema for updating user details (all fields optional)
 * Preprocesses the data to convert empty strings to undefined
 */
export const updateUserSchema = z.preprocess(
  (data) => {
    if (typeof data !== "object" || data === null) return data;
    const processed: Record<string, unknown> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      // Convert empty strings to undefined for optional fields
      if (typeof value === "string" && value.trim() === "") {
        processed[key] = undefined;
      } else {
        processed[key] = value;
      }
    });
    return processed;
  },
  z
    .object({
      name: nameSchema.optional(),
      email: emailSchema.optional(),
      rollNo: rollNoSchema.optional(),
      hostelId: hostelIdSchema.optional(),
      messId: z.string().optional().nullable(),
      roomNo: roomNoSchema.optional(),
    })
    .transform((data) => {
      // Remove undefined values from the object
      const cleaned: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          cleaned[key] = value;
        }
      });
      return cleaned;
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    })
);

/**
 * Schema for creating a warden (all fields required)
 */
export const createWardenSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  hostelId: hostelIdSchema,
  password: passwordSchema,
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateWardenFormData = z.infer<typeof createWardenSchema>;
