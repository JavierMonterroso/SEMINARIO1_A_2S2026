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
function validateFile(file) {
  if (!file || !file.size) throw new Error('Selecciona un archivo con contenido');
  if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera el limite de 5 MB');
}
function imageType(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', avif: 'image/avif', ico: 'image/x-icon' };
  return file.type || types[extension] || '';
}
async function uploadRequest(uploadUrl, payload) {
  if (!uploadUrl) throw new Error('La carga de archivos no esta disponible. Intenta mas tarde.');
  const response = await fetch(uploadUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'No se pudo subir el archivo');
  if (typeof data.url !== 'string' || !/^https?:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/.test(data.url)) {
    throw new Error('El servicio de carga no devolvio una URL valida');
  }
  return data.url;
}
async function uploadImage(file) {
  validateFile(file);
  const contentType = imageType(file);
  if (!contentType.startsWith('image/')) throw new Error('Selecciona una imagen');
  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
  const url = await uploadRequest(CONFIG.UPLOAD_IMAGE_URL, { filename: file.name, contentType, image });
  return { url, type: contentType };
}
async function uploadSelectedFile(file) {
  validateFile(file);
  if (imageType(file).startsWith('image/')) return uploadImage(file);
  if (!file.name.toLowerCase().endsWith('.txt')) throw new Error('Solo se permiten imagenes y archivos .txt');
  const content = await file.text();
  if (!content) throw new Error('Selecciona un archivo con contenido');
  const url = await uploadRequest(CONFIG.UPLOAD_TEXT_URL, { filename: file.name, content });
  return { url, type: 'text/plain' };
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
