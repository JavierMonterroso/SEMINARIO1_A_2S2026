async function handleLogin(event) {
  event.preventDefault();
  clearError();
  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: document.getElementById('username').value.trim(), password: document.getElementById('password').value }),
    });
    setSession(data.token, data.user);
    window.location.href = 'tasks.html';
  } catch (error) { showError(error); }
  finally { button.disabled = false; }
}
async function handleRegister(event) {
  event.preventDefault();
  clearError();
  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    if (password !== confirmPassword) throw new Error('Las contrasenas no coinciden');
    const profileImage = await filePayload(document.getElementById('reg-profile-image').files[0]);
    if (!profileImage.contentType.startsWith('image/')) throw new Error('Selecciona una imagen de perfil');
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: document.getElementById('reg-username').value.trim(), email: document.getElementById('reg-email').value.trim(), password, confirmPassword, profileImage }),
    });
    window.location.href = 'index.html?registered=1';
  } catch (error) { showError(error); }
  finally { button.disabled = false; }
}
function handleLogout() {
  clearSession();
  window.location.href = 'index.html';
}
showUser();
if (new URLSearchParams(window.location.search).get('registered') === '1') {
  const box = document.getElementById('error-box');
  if (box) { box.textContent = 'Cuenta creada. Ya puedes iniciar sesion.'; box.style.color = 'var(--success)'; }
}
