(() => {
  // Chiavi e classi usate dal tema
  const themeKey = "theme";
  const toggleId = "themeToggle";
  const darkIcon = "bi-moon-stars-fill";
  const lightIcon = "bi-sun-fill";

  // Legge il tema salvato (default: light)
  const readTheme = () => {
    const stored = localStorage.getItem(themeKey);
    return stored === "dark" ? "dark" : "light";
  };

  // Applica tema e aggiorna bottone
  const applyTheme = (theme) => {
    document.body.setAttribute("data-bs-theme", theme);

    const button = document.getElementById(toggleId);
    if (!button) return;

    const icon = button.querySelector("i");
    if (theme === "dark") {
      button.classList.remove("btn-dark");
      button.classList.add("btn-light");
      button.setAttribute("aria-label", "Switch to light mode");
      if (icon) {
        icon.classList.remove(lightIcon);
        icon.classList.add(darkIcon);
      }
    } else {
      button.classList.remove("btn-light");
      button.classList.add("btn-dark");
      button.setAttribute("aria-label", "Switch to dark mode");
      if (icon) {
        icon.classList.remove(darkIcon);
        icon.classList.add(lightIcon);
      }
    }
  };

  // Inizializza al caricamento pagina
  document.addEventListener("DOMContentLoaded", () => {
    const initialTheme = readTheme();
    applyTheme(initialTheme);

    const button = document.getElementById(toggleId);
    if (!button) return;

    button.addEventListener("click", () => {
      const current =
        document.body.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
      const nextTheme = current === "dark" ? "light" : "dark";
      localStorage.setItem(themeKey, nextTheme);
      applyTheme(nextTheme);
    });
  });
})();
