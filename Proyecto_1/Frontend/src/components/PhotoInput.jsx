import { useState } from 'react';
import CameraCapture from './CameraCapture';
import { fileToDataUrl, isAcceptedImage } from '../utils/image';

// Permite elegir una imagen de la computadora o tomarla con la webcam.
export default function PhotoInput({ label, value, onChange }) {
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!isAcceptedImage(file)) {
      setError('Solo se permiten imágenes JPG o PNG');
      return;
    }
    setError('');
    onChange(await fileToDataUrl(file));
  }

  function handleCapture(dataUrl) {
    setIsUsingCamera(false);
    onChange(dataUrl);
  }

  return (
    <fieldset className="photo-input">
      <legend>{label}</legend>
      {value && <img className="photo-preview" src={value} alt="Vista previa" />}
      <div className="row">
        <label className="button secondary">
          Elegir archivo
          <input type="file" accept="image/jpeg,image/png" onChange={handleFile} hidden />
        </label>
        <button type="button" className="secondary" onClick={() => setIsUsingCamera((current) => !current)}>
          {isUsingCamera ? 'Cerrar cámara' : 'Usar cámara'}
        </button>
      </div>
      {isUsingCamera && <CameraCapture onCapture={handleCapture} />}
      {error && <p className="error">{error}</p>}
    </fieldset>
  );
}
