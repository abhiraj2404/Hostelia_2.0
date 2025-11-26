/**
 * PDF-specific utilities for handling PDF documents
 */

/**
 * Fetches a PDF from a URL and returns it as a blob
 */
export async function fetchPdfBlob(url: string): Promise<Blob> {
  // Use the raw Cloudinary URL without fl_attachment for preview
  const viewUrl = url.includes("res.cloudinary.com")
    ? url.split("?")[0].split("&")[0] // Get base URL without query params
    : url;

  const response = await fetch(viewUrl, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PDF");
  }

  const blob = await response.blob();
  // Create a new blob with explicit PDF MIME type
  return new Blob([blob], { type: "application/pdf" });
}

/**
 * Creates an HTML page with embedded PDF for opening in new tab
 */
export function createPdfHtmlPage(blobUrl: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #525252;
          }
          iframe {
            width: 100%;
            height: 100vh;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="${blobUrl}" type="application/pdf"></iframe>
      </body>
    </html>
  `;
}

/**
 * Creates a meaningful title for PDF documents
 */
export function createPdfTitle(
  feeType: "hostel" | "mess",
  studentName?: string,
  studentRollNo?: string
): string {
  const rollNoPart = studentRollNo ? ` (${studentRollNo})` : "";
  const feeTypeLabel = feeType === "hostel" ? "Hostel" : "Mess";

  if (studentName) {
    return `${studentName}'s ${feeTypeLabel} Fee Document${rollNoPart}`;
  }

  return `${feeTypeLabel} Fee Document${rollNoPart}`;
}

/**
 * Creates a title from a file name (for upload previews)
 */
export function createPdfTitleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "") || "Document Preview";
}
