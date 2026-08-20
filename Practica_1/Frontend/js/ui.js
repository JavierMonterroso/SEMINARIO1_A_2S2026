const FLASH_MESSAGE_KEY = "cloudcinema_flash_message";

function showToast(message, isError = false) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "toast-error" : "toast-success"}`;
  toast.setAttribute("role", isError ? "alert" : "status");
  toast.setAttribute("aria-live", "polite");

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = isError ? "!" : "✓";

  const text = document.createElement("span");
  text.textContent = message;

  toast.append(icon, text);
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setFlashMessage(message) {
  sessionStorage.setItem(FLASH_MESSAGE_KEY, message);
}

function showFlashMessage() {
  const message = sessionStorage.getItem(FLASH_MESSAGE_KEY);
  if (!message) return;

  sessionStorage.removeItem(FLASH_MESSAGE_KEY);
  showToast(message);
}

function initializePasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;

    button.addEventListener("click", () => {
      const willShowPassword = input.type === "password";
      input.type = willShowPassword ? "text" : "password";
      button.textContent = willShowPassword ? "Ocultar" : "Mostrar";
      button.setAttribute(
        "aria-label",
        `${willShowPassword ? "Ocultar" : "Mostrar"} ${input.labels?.[0]?.textContent?.trim().toLowerCase() || "contraseña"}`
      );
      button.classList.toggle("is-visible", willShowPassword);
    });
  });
}

function initializeFilePickers() {
  document.querySelectorAll("[data-file-input]").forEach((input) => {
    const fileName = document.querySelector(`[data-file-name-for="${input.id}"]`);
    const emptyLabel = fileName?.textContent || "Ningún archivo seleccionado";

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (fileName) {
        fileName.textContent = file ? file.name : emptyLabel;
        fileName.classList.toggle("has-file", Boolean(file));
      }

      const previewId = input.dataset.previewTarget;
      const preview = previewId ? document.getElementById(previewId) : null;
      if (file && preview) {
        preview.src = URL.createObjectURL(file);
      }
    });
  });
}

function initializeUiControls() {
  initializePasswordToggles();
  initializeFilePickers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeUiControls);
} else {
  initializeUiControls();
}

function imageUrl(relativePath) {
  if (!relativePath) return "";
  return `${CONFIG.IMAGES_BASE_URL}/${relativePath}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
