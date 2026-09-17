function getToken() { return localStorage.getItem('token'); }
function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
async function apiRequest(path, options = {}) {
  if (!CONFIG.API_BASE_URL) throw new Error('El servicio no esta disponible. Intenta mas tarde.');
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${CONFIG.API_BASE_URL.replace(/\/$/, '')}${path}`, { ...options, headers });
  if (response.status === 401 && token) {
    clearSession();
    window.location.href = 'index.html';
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'No se pudo completar la solicitud' }));
    throw new Error(error.error || 'No se pudo completar la solicitud');
  }
  return response.status === 204 ? null : response.json();
}
function requireSession() {
  if (!getToken()) window.location.href = 'index.html';
}
function showError(error) {
  const box = document.getElementById('error-box');
  if (box) box.textContent = error.message || 'No se pudo completar la solicitud';
}
function clearError() {
  const box = document.getElementById('error-box');
  if (box) box.textContent = '';
}
async function filePayload(file) {
  if (!file || !file.size) throw new Error('Selecciona un archivo con contenido');
  if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera el limite de 5 MB');
  const extension = file.name.split('.').pop().toLowerCase();
  const types = { txt: 'text/plain', md: 'text/markdown', csv: 'text/csv', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf' };
  const contentType = file.type || types[extension] || 'application/octet-stream';
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
  return { fileName: file.name, contentType, data };
}
function showUser() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    const badge = document.createElement('span');
    badge.className = 'user-summary';
    if (user.profile_image_url && /^https?:\/\//.test(user.profile_image_url)) {
      const image = document.createElement('img');
      image.src = user.profile_image_url;
      image.alt = 'Foto de perfil';
      badge.appendChild(image);
    }
    const name = document.createElement('span');
    name.textContent = user.username;
    badge.appendChild(name);
    nav.appendChild(badge);
  } catch { /* Una sesion incompleta se resolvera al volver a iniciar sesion. */ }
}
