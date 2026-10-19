import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PhotoInput from '../components/PhotoInput';

const EMPTY_FORM = { fullName: '', email: '', dpi: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!photo) {
      setError('La foto de perfil es obligatoria');
      return;
    }
    setIsSending(true);
    setError('');
    try {
      const { email } = await api.register({ ...form, photo });
      navigate(`/confirm?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <label>
          Nombre completo
          <input name="fullName" value={form.fullName} onChange={updateField} maxLength={150} required />
        </label>
        <label>
          Correo electrónico
          <input name="email" type="email" value={form.email} onChange={updateField} required />
        </label>
        <label>
          DPI
          <input name="dpi" value={form.dpi} onChange={updateField} pattern="\d{13}" title="13 dígitos" required />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" value={form.password} onChange={updateField} minLength={8} required />
        </label>
        <label>
          Repetir contraseña
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} minLength={8} required />
        </label>
        <p className="muted small">Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos.</p>
        <PhotoInput label="Foto de perfil (se usa para el inicio de sesión facial)" value={photo} onChange={setPhoto} />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSending}>{isSending ? 'Registrando…' : 'Registrarme'}</button>
        <p className="small">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </main>
  );
}
