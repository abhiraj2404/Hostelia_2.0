/**
 * Image-specific utilities for handling image documents
 */

/**
 * Validates if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Validates if a URL points to an image
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;

  // Check for image extensions
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) return true;

  // Check if URL contains image indicator
  if (url.includes("image") && !url.includes("application/pdf")) return true;

  // Check Cloudinary URL pattern for images
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return true;
  }

  return false;
}

/**
 * Creates a preview URL from a File object
 */
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Gets image extension from URL
 */
export function getImageExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return match ? match[0] : "";
}
