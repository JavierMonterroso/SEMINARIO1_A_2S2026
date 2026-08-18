const SESSION_KEY = "cloudcinema_user";

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Llamar al inicio de toda pagina que requiera estar logueado.
function requireAuth() {
  const user = getSession();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

function renderNav(activePage) {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  const links = [
    { href: "gallery.html", label: "Cartelera" },
    { href: "playlist.html", label: "Mi Lista" },
    { href: "profile.html", label: "Mi Perfil" }
  ];

  nav.innerHTML = `
    <a class="brand" href="gallery.html">Cinema</a>
    <div class="nav-links">
      ${links
        .map(
          (link) =>
            `<a href="${link.href}" class="${link.href === activePage ? "active" : ""}">${link.label}</a>`
        )
        .join("")}
      <button id="logout-btn" class="link-button">Cerrar sesion</button>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });
}
