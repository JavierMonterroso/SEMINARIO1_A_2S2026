import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PhotoInput from '../components/PhotoInput';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [dpi, setDpi] = useState(user.dpi);
  const [photo, setPhoto] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setNotice('');
    setError('');
    try {
      const result = await api.updateMe({ fullName, dpi, password, photo: photo || null });
      updateUser(result.user);
      setPhoto('');
      setPassword('');
      setNotice('Datos actualizados');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h1>Mi perfil</h1>
      <div className="row">
        <img className="profile-photo" src={user.photoUrl} alt={user.fullName} />
        <div>
          <strong>{user.fullName}</strong>
          <div className="muted">{user.email}</div>
        </div>
      </div>
      <label>
        Nombre completo
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={150} required />
      </label>
      <label>
        DPI
        <input value={dpi} onChange={(event) => setDpi(event.target.value)} pattern="\d{13}" title="13 dígitos" required />
      </label>
      <PhotoInput label="Nueva foto de perfil (opcional)" value={photo} onChange={setPhoto} />
      <label>
        Contraseña actual (obligatoria para guardar)
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      {notice && <p className="notice">{notice}</p>}
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar cambios'}</button>
    </form>
  );
}
