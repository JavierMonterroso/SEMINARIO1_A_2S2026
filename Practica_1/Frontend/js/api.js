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

  // tipo: "perfil" o "pelicula". Devuelve { path: "Fotos_Perfil/xxx.jpg" }.
  uploadImage: (file, tipo) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest(`/uploads/${tipo}`, { method: "POST", formData });
  },

  register: (payload) => apiRequest("/register", { method: "POST", json: payload }),

  getUser: (idUsuario) => apiRequest(`/users/${idUsuario}`),

  updateProfile: (idUsuario, payload) => apiRequest(`/users/${idUsuario}`, { method: "PATCH", json: payload }),

  getMovies: () => apiRequest("/movies"),

  addToPlaylist: (idUsuario, idPelicula) =>
    apiRequest(`/users/${idUsuario}/playlist`, { method: "POST", json: { id_pelicula: idPelicula } }),

  getPlaylist: (idUsuario) => apiRequest(`/users/${idUsuario}/playlist`),

  removeFromPlaylist: (idUsuario, idPelicula) =>
    apiRequest(`/users/${idUsuario}/playlist/${idPelicula}`, { method: "DELETE" })
};
