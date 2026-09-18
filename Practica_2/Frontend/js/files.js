requireSession();
async function loadFiles() {
  const { files } = await apiRequest('/files');
  const list = document.getElementById('file-list');
  list.replaceChildren();
  if (!files.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'Todavia no has subido archivos.';
    list.appendChild(empty);
  }
  files.forEach((file) => {
    const item = document.createElement('li');
    item.className = 'item-card';
    const info = document.createElement('div');
    info.className = 'item-info';
    const name = document.createElement('strong');
    name.textContent = file.name;
    const type = document.createElement('span');
    type.className = 'badge pendiente';
    type.textContent = file.type;
    info.append(name, type);
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const view = document.createElement('button');
    view.type = 'button';
    view.className = 'btn-ghost';
    view.textContent = 'Ver';
    view.addEventListener('click', () => previewFile(file).catch(showError));
    const open = document.createElement('a');
    open.className = 'btn-ghost';
    open.textContent = 'Abrir archivo';
    if (/^https?:\/\//.test(file.url)) open.href = file.url;
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
    actions.append(view, open);
    item.append(info, actions);
    list.appendChild(item);
  });
}
async function previewFile(file) {
  clearError();
  if (!/^https?:\/\//.test(file.url)) throw new Error('No se puede abrir este archivo');
  if (!file.type.startsWith('image/') && !file.type.startsWith('text/') && file.type !== 'application/json') {
    window.open(file.url, '_blank', 'noopener,noreferrer');
    return;
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'file-preview';
  const title = document.createElement('h2');
  title.textContent = file.name;
  const close = document.createElement('button');
  close.className = 'btn-ghost';
  close.textContent = 'Cerrar';
  close.addEventListener('click', () => dialog.close());
  dialog.append(title, close);
  dialog.addEventListener('close', () => dialog.remove());
  document.body.appendChild(dialog);
  dialog.showModal();
  if (file.type.startsWith('image/')) {
    const image = document.createElement('img');
    image.alt = file.name;
    image.src = file.url;
    image.onerror = () => showError(new Error('No se pudo cargar la imagen'));
    dialog.appendChild(image);
  } else {
    const content = document.createElement('pre');
    content.textContent = 'Cargando...';
    dialog.appendChild(content);
    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error('No se pudo leer el archivo');
      content.textContent = await response.text();
    } catch {
      content.textContent = 'No se pudo cargar la vista previa. Usa Abrir archivo.';
    }
  }
}
async function handleUploadFile(event) {
  event.preventDefault();
  clearError();
  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const file = document.getElementById('file-input').files[0];
    const { url, type } = await uploadSelectedFile(file);
    await apiRequest('/files', { method: 'POST', body: JSON.stringify({ name: file.name, type, url }) });
    event.target.reset();
    await loadFiles();
  } catch (error) { showError(error); }
  finally { button.disabled = false; }
}
if (getToken()) loadFiles().catch(showError);
