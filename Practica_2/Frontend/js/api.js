function getToken() {
  return localStorage.getItem('token');
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || error.detail || 'Error en la solicitud');
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

function requireSession() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}
