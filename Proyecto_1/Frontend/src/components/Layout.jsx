import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import ChatbotWidget from './ChatbotWidget';

// Plantilla de las paginas que requieren sesion iniciada.
export default function Layout() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <nav className="navbar">
        <strong className="brand">Semi-Social</strong>
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/users">Usuarios</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/profile" className="row">
          <Avatar user={user} size={28} />
          Perfil
        </NavLink>
        <button type="button" className="link" onClick={logout}>Salir</button>
      </nav>
      <main className="container">
        <Outlet />
      </main>
      <ChatbotWidget />
    </>
  );
}
