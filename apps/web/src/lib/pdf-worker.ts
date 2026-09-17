import * as pdfjsLib from 'pdfjs-dist';

export function setupPdfWorker() {
  if (typeof window === 'undefined') return;

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const blob = new Blob([`importScripts("${workerUrl}");`], { type: 'application/javascript' });
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
    } catch (_) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  }
}
