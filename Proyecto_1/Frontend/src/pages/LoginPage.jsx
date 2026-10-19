import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PhotoInput from '../components/PhotoInput';

const USER_NOT_CONFIRMED = 'USER_NOT_CONFIRMED';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isFaceMode, setIsFaceMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (isFaceMode && !photo) {
      setError('Toma o elige una foto de tu rostro');
      return;
    }
    setIsSending(true);
    setError('');
    try {
      const session = isFaceMode ? await api.faceLogin(username, photo) : await api.login(username, password);
      login(session);
      navigate('/');
    } catch (err) {
      if (err.code === USER_NOT_CONFIRMED) navigate(`/confirm?email=${encodeURIComponent(username)}`);
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Semi-Social</h1>
        <div className="tabs">
          <button type="button" className={isFaceMode ? 'tab' : 'tab active'} onClick={() => setIsFaceMode(false)}>
            Usuario y contraseña
          </button>
          <button type="button" className={isFaceMode ? 'tab active' : 'tab'} onClick={() => setIsFaceMode(true)}>
            Reconocimiento facial
          </button>
        </div>

        <label>
          Usuario (correo electrónico)
          <input type="email" value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        {isFaceMode ? (
          <PhotoInput label="Foto de tu rostro" value={photo} onChange={setPhoto} />
        ) : (
          <label>
            Contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSending}>{isSending ? 'Ingresando…' : 'Iniciar sesión'}</button>
        <p className="small">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </form>
    </main>
  );
}
