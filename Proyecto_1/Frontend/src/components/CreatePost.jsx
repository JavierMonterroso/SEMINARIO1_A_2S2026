import { useState } from 'react';
import { api } from '../api/client';
import PhotoInput from './PhotoInput';

export default function CreatePost({ onCreated }) {
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!image) {
      setError('La imagen es obligatoria');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await api.createPost({ image, description });
      setImage('');
      setDescription('');
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Nueva publicación</h2>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="¿Qué quieres compartir? (opcional)"
        maxLength={2000}
        rows={3}
      />
      <PhotoInput label="Imagen" value={image} onChange={setImage} />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isSaving}>{isSaving ? 'Publicando…' : 'Publicar'}</button>
    </form>
  );
}
