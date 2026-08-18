async function apiRequest(path, { method = "GET", json, formData } = {}) {
  const options = { method };

  if (formData) {
    options.body = formData; // el navegador pone el Content-Type multipart solo
  } else if (json) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(json);
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const detail = body?.detail || `Error ${response.status}`;
    throw new Error(detail);
  }

  return body;
}

const Api = {
  login: (correo, contrasena) => apiRequest("/login", { method: "POST", json: { correo, contrasena } }),

  register: (formData) => apiRequest("/register", { method: "POST", formData }),

  getUser: (idUsuario) => apiRequest(`/users/${idUsuario}`),

  updateProfile: (idUsuario, formData) => apiRequest(`/users/${idUsuario}`, { method: "PATCH", formData }),

  getMovies: () => apiRequest("/movies"),

  addToPlaylist: (idUsuario, idPelicula) =>
    apiRequest(`/users/${idUsuario}/playlist`, { method: "POST", json: { id_pelicula: idPelicula } }),

  getPlaylist: (idUsuario) => apiRequest(`/users/${idUsuario}/playlist`),

  removeFromPlaylist: (idUsuario, idPelicula) =>
    apiRequest(`/users/${idUsuario}/playlist/${idPelicula}`, { method: "DELETE" })
};
