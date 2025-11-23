import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ApiError = {
  response?: { data?: { message?: string } };
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as ApiError;
    return maybeError.response?.data?.message ?? maybeError.message ?? fallback;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
}
