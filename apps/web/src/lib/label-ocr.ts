import { labelImageDimensions } from './label-image';
import type { Worker } from 'tesseract.js';
import { LABEL_ENGINE, labelProposals } from './label-proposals';
let activeWorker = false;
export async function recognizeLabel(blob: Blob, signal: AbortSignal, progress: (value: number) => void) {
  if (blob.size > 2097152 || !['image/jpeg', 'image/png'].includes(blob.type)) throw new Error('INVALID_IMAGE');
  if (activeWorker) throw new Error('OCR_BUSY');
  activeWorker = true;
  let image: ImageBitmap | undefined;
  let initialization: Promise<Worker> | undefined;
  let worker: Worker | undefined;
  let expired = false;
  let rejectCancellation: (error: Error) => void;
  const cancelled = new Promise<never>((_resolve, reject) => { rejectCancellation = reject; });
  void cancelled.catch(() => undefined);
  const abort = () => { expired = true; if (worker) void worker.terminate(); rejectCancellation(new Error('CANCELLED')); };
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 60000);
  try {
    if (signal.aborted) throw new Error('CANCELLED');
    labelImageDimensions(new Uint8Array(await blob.arrayBuffer()));
    if (expired || signal.aborted) throw new Error('CANCELLED');
    image = await createImageBitmap(blob);
    if (image.width < 1 || image.height < 1 || image.width * image.height > 24000000) throw new Error('INVALID_DIMENSIONS');
    const canvas = document.createElement('canvas'), scale = Math.min(1, 2200 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d'); if (!context) throw new Error('UNAVAILABLE');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { createWorker } = await import('tesseract.js');
    initialization = createWorker('fra', 1, { workerPath: '/api/label-ocr/worker.min.js', corePath: '/api/label-ocr/core', langPath: '/api/label-ocr/lang', workerBlobURL: false, cacheMethod: 'none', errorHandler: abort, logger: message => { if (!expired && !signal.aborted && message.status === 'recognizing text') progress(Math.round(message.progress * 100)); } }).then(created => { if (expired || signal.aborted) void created.terminate(); return created; });
    worker = await Promise.race([initialization, cancelled]);
    if (expired || signal.aborted) throw new Error('CANCELLED');
    const { data } = await Promise.race([worker.recognize(canvas), cancelled]);
    if (expired || signal.aborted) throw new Error('CANCELLED');
    return { engine: LABEL_ENGINE, extractedAt: new Date().toISOString(), ...labelProposals(data.text, data.confidence) };
  } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); image?.close(); if (worker) { await worker.terminate(); activeWorker = false; } else if (initialization) { void initialization.then(() => { activeWorker = false; }, () => { activeWorker = false; }); } else activeWorker = false; }
}
