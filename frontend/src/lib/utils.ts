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

export function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}
