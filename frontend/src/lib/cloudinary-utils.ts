/**
 * Utility functions for handling Cloudinary URLs
 */

/**
 * Detects if a URL is a PDF based on extension or Cloudinary resource type
 */
export function isPdfUrl(url: string): boolean {
  if (!url) return false;

  // Check for .pdf extension
  if (/\.pdf$/i.test(url)) return true;

  // Check if URL contains pdf indicator
  if (url.includes("pdf") || url.includes("application/pdf")) return true;

  // Check Cloudinary URL pattern for raw resources (PDFs are stored as raw)
  // Cloudinary raw URLs typically have /raw/upload/ or /v1/ in the path
  if (url.includes("res.cloudinary.com")) {
    // If it's a Cloudinary URL and doesn't have image transformations, might be PDF
    // PDFs in Cloudinary are often served from /raw/upload/ path
    if (url.includes("/raw/upload/")) return true;

    // Check if URL doesn't have image format indicators
    const hasImageFormat =
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
      url.includes("/image/upload/");
    if (!hasImageFormat && url.includes("cloudinary")) {
      // Could be PDF, but we need more context
      // For now, check if it explicitly mentions pdf
      return url.toLowerCase().includes("pdf");
    }
  }

  return false;
}

/**
 * Detects if a URL is an image
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
 * Gets the download URL for a Cloudinary resource with forced download
 * Uses fl_attachment flag to force download instead of preview
 */
export function getCloudinaryDownloadUrl(url: string): string {
  if (!url) return url;

  // If it's already a Cloudinary URL, add fl_attachment transformation
  if (url.includes("res.cloudinary.com")) {
    // Check if URL already has query parameters
    const separator = url.includes("?") ? "&" : "?";

    // For raw resources (PDFs), use fl_attachment
    // For images, we can also use fl_attachment
    return `${url}${separator}fl_attachment`;
  }

  // For non-Cloudinary URLs, return as-is
  return url;
}

/**
 * Gets the view URL for a Cloudinary resource (for preview/display)
 * Returns clean URL without fl_attachment for inline display
 * Note: PDFs are handled differently - they are fetched as blobs and displayed via object URLs
 */
export function getCloudinaryViewUrl(url: string): string {
  if (!url) return url;

  // If it's a Cloudinary URL, remove fl_attachment to allow inline display
  if (url.includes("res.cloudinary.com")) {
    try {
      const urlObj = new URL(url);
      // Remove fl_attachment parameter if present
      urlObj.searchParams.delete("fl_attachment");
      return urlObj.toString();
    } catch {
      // If URL parsing fails, try simple string replacement
      return url.replace(/[?&]fl_attachment/g, "").replace(/\?$/, "");
    }
  }

  // For non-Cloudinary URLs, return as-is
  return url;
}

/**
 * Gets the preview URL for a Cloudinary resource
 * @deprecated Use getCloudinaryViewUrl instead
 */
export function getCloudinaryPreviewUrl(url: string): string {
  return getCloudinaryViewUrl(url);
}
