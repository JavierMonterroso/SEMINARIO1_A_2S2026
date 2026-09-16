async function handleLogin(event) {
  event.preventDefault();
  const errorBox = document.getElementById('error-box');
  errorBox.textContent = '';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setSession(data.token, data.user);
    window.location.href = 'tasks.html';
  } catch (err) {
    errorBox.textContent = err.message;
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const errorBox = document.getElementById('error-box');
  errorBox.textContent = '';

  const form = new FormData();
  form.append('username', document.getElementById('reg-username').value.trim());
  form.append('email', document.getElementById('reg-email').value.trim());
  form.append('password', document.getElementById('reg-password').value);
  form.append('confirmPassword', document.getElementById('reg-confirm-password').value);

  const imageInput = document.getElementById('reg-profile-image');
  if (imageInput.files[0]) {
    form.append('profileImage', imageInput.files[0]);
  }

  try {
    await apiRequest('/auth/register', { method: 'POST', body: form });
    window.location.href = 'index.html';
  } catch (err) {
    errorBox.textContent = err.message;
  }
}

function handleLogout() {
  clearSession();
  window.location.href = 'index.html';
}
