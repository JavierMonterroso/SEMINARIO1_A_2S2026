requireSession();

async function loadFiles() {
  const { files } = await apiRequest('/files');
  const list = document.getElementById('file-list');
  list.innerHTML = '';

  if (files.length === 0) {
    list.innerHTML = '<p class="empty-state">Todavia no has subido archivos.</p>';
    return;
  }

  files.forEach((file) => {
    const item = document.createElement('li');
    item.className = 'item-card';
    item.innerHTML = `
      <div class="item-info">
        <strong>${file.name}</strong>
        <span class="badge pendiente">${file.type}</span>
      </div>
      <div class="item-actions">
        <a class="btn-ghost" href="${file.url}" target="_blank" rel="noopener">Ver</a>
      </div>
    `;
    list.appendChild(item);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleUploadFile(event) {
  event.preventDefault();
  const errorBox = document.getElementById('error-box');
  errorBox.textContent = '';

  const input = document.getElementById('file-input');
  const file = input.files[0];
  if (!file) return;

  try {
    const base64Data = await fileToBase64(file);
    const isImage = file.type.startsWith('image/');
    const uploadUrl = isImage ? CONFIG.UPLOAD_IMAGE_URL : CONFIG.UPLOAD_TEXT_URL;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        data: base64Data,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error('No se pudo subir el archivo');
    }

    const { url } = await uploadResponse.json();

    await apiRequest('/files', {
      method: 'POST',
      body: JSON.stringify({ name: file.name, type: file.type || 'text/plain', url }),
    });

    event.target.reset();
    loadFiles();
  } catch (err) {
    errorBox.textContent = err.message;
  }
}

loadFiles();
