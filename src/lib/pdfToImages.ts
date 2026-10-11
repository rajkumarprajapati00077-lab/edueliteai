/**
 * PDF to Images converter using PDF.js
 * Converts PDF pages to JPEG images in the browser (100% free, client-side).
 * Used for handwritten answer sheets that can't be text-extracted.
 */

let pdfjsLib: any = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  // Dynamic import - install via: npm install pdfjs-dist
  const mod = await import("pdfjs-dist");
  pdfjsLib = mod;
  // Set worker source
  const workerMod = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  mod.GlobalWorkerOptions.workerSrc = workerMod.default;
  return pdfjsLib;
}

/**
 * Convert a PDF File to an array of JPEG data URLs (one per page).
 * @param file PDF file
 * @param maxPages Maximum pages to convert (default 12)
 * @param scale Render scale for readability (default 1.5)
 */
export async function pdfToImages(
  file: File,
  maxPages = 12,
  scale = 1.5
): Promise<string[]> {
  const lib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];
  const numPages = Math.min(pdf.numPages, maxPages);

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    // White background for scanned/handwritten PDFs
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.85));
  }
  return images;
}

/**
 * Check if a file is a PDF that needs conversion.
 */
export function isPdf(file: File): boolean {
  return file.type === "application/pdf";
}
