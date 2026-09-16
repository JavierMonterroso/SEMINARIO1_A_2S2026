requireSession();

function escapeQuotes(value) {
  return value.replace(/'/g, "\\'");
}

async function loadTasks() {
  const { tasks } = await apiRequest('/tasks');
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty-state">Todavia no tienes tareas. Agrega la primera arriba.</p>';
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = task.completed ? 'item-card completed' : 'item-card';
    item.innerHTML = `
      <div class="item-info">
        <strong>${task.title}</strong>
        <p>${task.description || ''}</p>
        <span class="badge ${task.completed ? 'completada' : 'pendiente'}">${task.completed ? 'Completada' : 'Pendiente'}</span>
      </div>
      <div class="item-actions">
        <button class="btn-ghost" onclick="toggleComplete(${task.id}, ${!task.completed})">
          ${task.completed ? 'Reabrir' : 'Completar'}
        </button>
        <button class="btn-ghost" onclick="editTask(${task.id}, '${escapeQuotes(task.title)}', '${escapeQuotes(task.description || '')}')">Editar</button>
        <button class="btn-ghost" onclick="deleteTask(${task.id})">Eliminar</button>
      </div>
    `;
    list.appendChild(item);
  });
}

async function handleCreateTask(event) {
  event.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();

  await apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });

  event.target.reset();
  loadTasks();
}

async function toggleComplete(id, completed) {
  await apiRequest(`/tasks/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
  loadTasks();
}

async function editTask(id, currentTitle, currentDescription) {
  const title = prompt('Nuevo titulo', currentTitle);
  if (title === null) return;
  const description = prompt('Nueva descripcion', currentDescription);
  if (description === null) return;

  await apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description }),
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm('Eliminar esta tarea?')) return;
  await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

loadTasks();
