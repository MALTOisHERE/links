/**
 * Theme toggle. The initial theme is set synchronously by the inline
 * script in <head> (before paint) to avoid a flash of the wrong theme.
 * This file only wires up the toggle button.
 */
(function () {
  const STORAGE_KEY = "theme";
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    button.setAttribute("aria-checked", String(theme === "light"));
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* storage unavailable (private mode, blocked, etc.); safe to ignore */
    }
  }

  button.setAttribute("aria-checked", String(currentTheme() === "light"));

  button.addEventListener("click", function () {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
})();
