'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

import { getPdfDocument, renderPageToCanvas, type PlacedSignature } from '@/lib/pdfSignature';

interface DocumentPreviewProps {
  pdfBytes: ArrayBuffer;
  qrDataUrl: string | null;
  placement: PlacedSignature | null;
  onPlacementChange: (placement: PlacedSignature) => void;
}

const RENDER_WIDTH = 720;

// Renders the PDF page to a canvas and overlays a draggable QR stamp.
// Placement is reported back as page-relative ratios so it survives scaling.
export default function DocumentPreview({
  pdfBytes,
  qrDataUrl,
  placement,
  onPlacementChange,
}: DocumentPreviewProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoc(null);
    getPdfDocument(pdfBytes)
      .then((loaded) => {
        if (cancelled) return;
        setDoc(loaded);
        setNumPages(loaded.numPages);
        setPageNumber(1);
      })
      .catch((err) => console.error('Failed to load PDF preview:', err));
    return () => {
      cancelled = true;
    };
  }, [pdfBytes]);

  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    let cancelled = false;
    setRendering(true);
    renderPageToCanvas(doc, pageNumber, canvasRef.current, RENDER_WIDTH)
      .catch((err) => console.error('Failed to render page:', err))
      .finally(() => {
        if (!cancelled) setRendering(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber]);

  // Drop the QR in the middle of the current page the first time it appears.
  useEffect(() => {
    if (qrDataUrl && !placement) {
      onPlacementChange({
        pageIndex: pageNumber - 1,
        xRatio: 0.4,
        yRatio: 0.4,
        sizeRatio: 0.28,
      });
    }
  }, [qrDataUrl, placement, pageNumber, onPlacementChange]);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage || !placement) return;
      const rect = stage.getBoundingClientRect();
      const half = placement.sizeRatio / 2;
      let xRatio = (clientX - rect.left) / rect.width - half;
      let yRatio = (clientY - rect.top) / rect.height - half;
      // Keep the stamp fully inside the page.
      xRatio = Math.max(0, Math.min(1 - placement.sizeRatio, xRatio));
      yRatio = Math.max(0, Math.min(1 - placement.sizeRatio, yRatio));
      onPlacementChange({ ...placement, pageIndex: pageNumber - 1, xRatio, yRatio });
    },
    [placement, pageNumber, onPlacementChange],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const showQrOnThisPage = qrDataUrl && placement && placement.pageIndex === pageNumber - 1;

  return (
    <div className="space-y-3">
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setPageNumber((n) => Math.max(1, n - 1))}
            disabled={pageNumber <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efefef] text-black transition-colors hover:bg-[#e2e2e2] disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-medium text-black">
            Page {pageNumber} / {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((n) => Math.min(numPages, n + 1))}
            disabled={pageNumber >= numPages}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efefef] text-black transition-colors hover:bg-[#e2e2e2] disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-center overflow-auto rounded-2xl border border-[#e2e2e2] bg-[#f3f3f3] p-3">
        <div ref={stageRef} className="relative inline-block">
          <canvas ref={canvasRef} className="block max-w-full rounded-lg shadow-sm" />

          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 text-xs text-[#5e5e5e]">
              Rendering...
            </div>
          )}

          {showQrOnThisPage && (
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="absolute cursor-move touch-none rounded border-2 border-dashed border-black bg-white/70 p-0.5"
              style={{
                left: `${placement.xRatio * 100}%`,
                top: `${placement.yRatio * 100}%`,
                width: `${placement.sizeRatio * 100}%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Signature QR" className="pointer-events-none w-full select-none" draggable={false} />
            </div>
          )}
        </div>
      </div>

      {qrDataUrl && (
        <p className="text-center text-xs text-[#5e5e5e]">
          Drag the QR stamp onto the signature spot{numPages > 1 ? ' (on any page)' : ''}.
        </p>
      )}
    </div>
  );
}
