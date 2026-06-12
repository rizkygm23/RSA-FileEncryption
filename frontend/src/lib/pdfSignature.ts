'use client';

// Browser-only helpers for the document-signature feature:
// hashing, canonical payload, QR generation, PDF stamping (pdf-lib),
// and PDF rendering / QR scanning (pdfjs + jsqr).

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Lazy-load pdf.js so its browser-only module (DOMMatrix, etc.) never evaluates
// during SSR/prerender. The worker is configured once on first use.
// If Turbopack ever fails to resolve the worker URL, copy pdf.worker.min.mjs
// into /public and use '/pdf.worker.min.mjs' instead.
type PdfjsModule = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<PdfjsModule> | null = null;
const loadPdfjs = async (): Promise<PdfjsModule> => {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
      return lib;
    });
  }
  return pdfjsPromise;
};

export interface SignaturePayload {
  v: number;
  name: string;
  reason: string;
  date: string;
  filename: string;
  doc_hash: string;
  sig: string;
}

export interface PlacedSignature {
  pageIndex: number; // 0-based
  xRatio: number; // top-left X of the QR, as a fraction of page width
  yRatio: number; // top-left Y of the QR, as a fraction of page height
  sizeRatio: number; // QR width as a fraction of page width
}

// --- Hash -----------------------------------------------------------------

export const sha256Hex = async (bytes: ArrayBuffer): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// --- Canonical payload (signed + verified identically) --------------------

export interface CanonicalFields {
  name: string;
  reason: string;
  date: string;
  filename: string;
  docHash: string;
}

export const buildCanonicalPayload = (fields: CanonicalFields): string =>
  ['v1', fields.name, fields.reason, fields.date, fields.filename, fields.docHash].join('\n');

// --- QR -------------------------------------------------------------------

export const makeQrDataUrl = async (text: string): Promise<string> =>
  // Lower error-correction + larger render keeps the modules big enough to
  // survive being shrunk onto a PDF page and re-scanned.
  QRCode.toDataURL(text, {
    errorCorrectionLevel: 'L',
    margin: 3,
    width: 1024,
    color: { dark: '#000000', light: '#ffffff' },
  });

const dataUrlToBytes = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// --- PDF stamping ---------------------------------------------------------

export const stampQrOntoPdf = async (
  pdfBytes: ArrayBuffer,
  qrPngDataUrl: string,
  placement: PlacedSignature,
  caption?: string,
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[placement.pageIndex] ?? pages[0];
  const { width: pageW, height: pageH } = page.getSize();

  const qrImage = await pdfDoc.embedPng(dataUrlToBytes(qrPngDataUrl));
  const sizePt = placement.sizeRatio * pageW;
  const xPt = placement.xRatio * pageW;
  const yTopPt = placement.yRatio * pageH;
  const yPt = pageH - yTopPt - sizePt; // pdf-lib origin is bottom-left

  page.drawImage(qrImage, { x: xPt, y: yPt, width: sizePt, height: sizePt });

  if (caption) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = Math.max(6, Math.min(10, sizePt * 0.12));
    page.drawText(caption, {
      x: xPt,
      y: yPt - fontSize - 2,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
};

// --- PDF rendering (pdfjs) -------------------------------------------------

export const getPdfDocument = async (bytes: ArrayBuffer): Promise<PDFDocumentProxy> => {
  const pdfjsLib = await loadPdfjs();
  // pdfjs transfers/detaches the buffer, so hand it a copy.
  const data = bytes.slice(0);
  return pdfjsLib.getDocument({ data }).promise;
};

export const renderPageToCanvas = async (
  doc: PDFDocumentProxy,
  pageNumber: number, // 1-based
  canvas: HTMLCanvasElement,
  targetWidth: number,
): Promise<void> => {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvas, canvasContext: context, viewport }).promise;
};

// --- QR scanning (for verify) ---------------------------------------------

export const scanQrFromPdf = async (bytes: ArrayBuffer): Promise<string | null> => {
  const doc = await getPdfDocument(bytes);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  // Try increasing render resolutions: a small dense stamp needs more pixels
  // per QR module before jsQR can lock onto the finder patterns.
  const scales = [3, 4, 6];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);

    for (const scale of scales) {
      const viewport = page.getViewport({ scale });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      if (result?.data) return result.data;
    }
  }

  return null;
};
