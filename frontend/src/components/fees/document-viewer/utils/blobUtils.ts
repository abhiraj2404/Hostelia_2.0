/**
 * Blob URL lifecycle management utilities
 */

/**
 * Manages blob URL cleanup with proper lifecycle handling
 */
export class BlobUrlManager {
  private blobUrls: Set<string> = new Set();

  /**
   * Creates a blob URL and tracks it for cleanup
   */
  createBlobUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.blobUrls.add(url);
    return url;
  }

  /**
   * Revokes a specific blob URL
   */
  revokeBlobUrl(url: string): void {
    if (this.blobUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.blobUrls.delete(url);
    }
  }

  /**
   * Revokes all tracked blob URLs
   */
  revokeAll(): void {
    this.blobUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.blobUrls.clear();
  }

  /**
   * Sets up cleanup for a window (when window closes)
   */
  setupWindowCleanup(window: Window | null, url: string): void {
    if (window) {
      window.addEventListener("beforeunload", () => {
        this.revokeBlobUrl(url);
      });
    } else {
      // Fallback: clean up after delay if we can't track the window
      setTimeout(() => {
        this.revokeBlobUrl(url);
      }, 1000);
    }
  }
}

/**
 * Opens a blob URL in a new tab with cleanup handling
 */
export function openBlobUrlInNewTab(
  htmlBlobUrl: string,
  pdfBlobUrl: string,
  manager: BlobUrlManager
): Window | null {
  const newWindow = window.open(htmlBlobUrl, "_blank");

  // Clean up HTML blob URL after a short delay
  setTimeout(() => {
    manager.revokeBlobUrl(htmlBlobUrl);
  }, 100);

  // Set up cleanup for PDF blob URL
  manager.setupWindowCleanup(newWindow, pdfBlobUrl);

  return newWindow;
}
