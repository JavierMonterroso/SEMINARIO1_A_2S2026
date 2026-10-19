import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

// Verificacion del correo con el codigo que envia Cognito.
export default function ConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function run(action) {
    setError('');
    setNotice('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    run(async () => {
      await api.confirm(email, code);
      navigate('/login');
    });
  };

  const resend = () => run(async () => {
    const { message } = await api.resendCode(email);
    setNotice(message);
  });

  return (
    <main className="auth">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Verifica tu correo</h1>
        <p className="muted">Ingresa el código que Cognito envió a tu correo electrónico.</p>
        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Código de verificación
          <input value={code} onChange={(event) => setCode(event.target.value)} maxLength={10} required />
        </label>
        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Verificar</button>
        <button type="button" className="secondary" onClick={resend} disabled={!email}>Reenviar código</button>
        <p className="small"><Link to="/login">Volver al inicio de sesión</Link></p>
      </form>
    </main>
  );
}
