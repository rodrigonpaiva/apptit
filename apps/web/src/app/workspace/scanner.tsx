'use client';
import { useEffect, useRef, useState } from 'react';
import { decodeProductFrame } from '../../lib/scanner';
export default function Scanner({ onRead, onClose }: { onRead: (code: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState('Autorisez la caméra pour lire un code.');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false; let stream: MediaStream | undefined; let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { stream?.getTracks().forEach(track => track.stop()); if (timer) clearTimeout(timer); };
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('CAMERA_UNAVAILABLE');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
        if (cancelled) { stop(); return; }
        const element = video.current;
        if (!element) { stop(); return; }
        element.srcObject = stream; await element.play();
        if (cancelled) { stop(); return; }
        setMessage('Cadrez le code-barres. Une lecture identifie un produit, sans ajouter de quantité.');
        const canvas = document.createElement('canvas'); const started = Date.now();
        async function scan() {
          if (cancelled) return;
          if (Date.now() - started > 30000) { stop(); setFailed(true); setMessage('Code non détecté. Réessayez ou saisissez-le manuellement.'); return; }
          try {
            if (element!.videoWidth && element!.videoHeight) {
              const scale = Math.min(1, 960 / element!.videoWidth); canvas.width = Math.round(element!.videoWidth * scale); canvas.height = Math.round(element!.videoHeight * scale);
              const context = canvas.getContext('2d', { willReadFrequently: true });
              if (!context) throw new Error('CANVAS_UNAVAILABLE');
              context.drawImage(element!, 0, 0, canvas.width, canvas.height);
              const code = await decodeProductFrame(context.getImageData(0, 0, canvas.width, canvas.height));
              if (cancelled) return;
              if (code && /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) { cancelled = true; stop(); onRead(code); return; }
            }
            timer = setTimeout(() => void scan(), 300);
          } catch { if (!cancelled) { stop(); setFailed(true); setMessage('Lecteur indisponible. La saisie manuelle reste disponible.'); } }
        }
        void scan();
      } catch { if (!cancelled) { stop(); setFailed(true); setMessage('Caméra inaccessible ou permission refusée. Saisissez le code manuellement.'); } }
    }
    void start();
    return () => { cancelled = true; stop(); };
  }, [onRead]);
  return <div className="scanner-panel"><div className="scanner-heading"><strong>Lire un code-barres</strong><button type="button" onClick={onClose}>Fermer la caméra</button></div><p role={failed ? 'alert' : 'status'}>{message}</p>{!failed && <div className="scanner-video"><video ref={video} playsInline muted autoPlay /><span aria-hidden="true" /></div>}<p className="lookup-small">Traitement sur cet appareil. Aucune image n’est envoyée au serveur. <a href="/licenses/zxing-wasm.txt" target="_blank" rel="noopener noreferrer">ZXing-WASM (MIT)</a> · <a href="/licenses/zxing-cpp.txt" target="_blank" rel="noopener noreferrer">ZXing-C++</a>.</p></div>;
}
