const SESSION_KEY = 'semi-social.session';

// localStorage puede no estar disponible (modo privado o sitio bloqueado).
export function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // La sesion sigue activa en memoria hasta recargar la pagina.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nada que limpiar.
  }
}
