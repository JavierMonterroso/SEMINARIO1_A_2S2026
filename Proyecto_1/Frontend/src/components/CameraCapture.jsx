import { useEffect, useRef, useState } from 'react';
import { videoFrameToDataUrl } from '../utils/image';

// El navegador solo permite la camara en HTTPS o localhost (contexto seguro).
function cameraUnavailableReason() {
  if (!window.isSecureContext) return 'La cámara requiere HTTPS o localhost. Sube una foto desde tu computadora.';
  if (!navigator.mediaDevices?.getUserMedia) return 'Este navegador no permite usar la cámara.';
  return null;
}

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(cameraUnavailableReason);

  useEffect(() => {
    if (error) return undefined;
    let stream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((mediaStream) => {
        stream = mediaStream;
        videoRef.current.srcObject = mediaStream;
      })
      .catch(() => setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.'));
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [error]);

  if (error) return <p className="notice">{error}</p>;

  return (
    <div className="camera">
      <video ref={videoRef} autoPlay playsInline muted />
      <button type="button" onClick={() => onCapture(videoFrameToDataUrl(videoRef.current))}>
        Tomar foto
      </button>
    </div>
  );
}
