import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmPage from './pages/ConfirmPage';
import FeedPage from './pages/FeedPage';
import UsersPage from './pages/UsersPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

// HashRouter evita errores 404 al recargar rutas en el hosting estatico de S3.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
