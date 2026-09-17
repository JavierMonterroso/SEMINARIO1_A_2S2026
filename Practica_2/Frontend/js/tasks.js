requireSession();
function taskButton(label, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-ghost';
  button.textContent = label;
  button.addEventListener('click', () => action().catch(showError));
  return button;
}
async function loadTasks() {
  const { tasks } = await apiRequest('/tasks');
  const list = document.getElementById('task-list');
  list.replaceChildren();
  if (!tasks.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'Todavia no tienes tareas. Agrega la primera arriba.';
    list.appendChild(empty);
  }
  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = task.completed ? 'item-card completed' : 'item-card';
    const info = document.createElement('div');
    info.className = 'item-info';
    const title = document.createElement('strong');
    title.textContent = task.title;
    const description = document.createElement('p');
    description.textContent = task.description || '';
    const date = document.createElement('p');
    date.textContent = `Creada: ${new Date(task.created_at).toLocaleString('es-GT')}`;
    const status = document.createElement('span');
    status.className = `badge ${task.completed ? 'completada' : 'pendiente'}`;
    status.textContent = task.completed ? 'Completada' : 'Pendiente';
    info.append(title, description, date, status);
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    actions.append(
      taskButton(task.completed ? 'Reabrir' : 'Completar', () => toggleComplete(task.id, !task.completed)),
      taskButton('Editar', () => editTask(task)),
      taskButton('Eliminar', () => deleteTask(task.id)),
    );
    item.append(info, actions);
    list.appendChild(item);
  });
}
async function handleCreateTask(event) {
  event.preventDefault();
  clearError();
  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: document.getElementById('task-title').value.trim(), description: document.getElementById('task-description').value }),
    });
    event.target.reset();
    await loadTasks();
  } catch (error) { showError(error); }
  finally { button.disabled = false; }
}
async function toggleComplete(id, completed) {
  clearError();
  await apiRequest(`/tasks/${id}/complete`, { method: 'PATCH', body: JSON.stringify({ completed }) });
  await loadTasks();
}
async function editTask(task) {
  clearError();
  const title = prompt('Nuevo titulo', task.title);
  if (title === null) return;
  const description = prompt('Nueva descripcion', task.description || '');
  if (description === null) return;
  await apiRequest(`/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ title, description }) });
  await loadTasks();
}
async function deleteTask(id) {
  clearError();
  if (!confirm('Eliminar esta tarea?')) return;
  await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
  await loadTasks();
}
if (getToken()) loadTasks().catch(showError);
