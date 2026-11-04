(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem("medicalQrTheme");
  if (stored === "dark" || stored === "light") root.dataset.theme = stored;

  const labels = () => window.MEDICAL_QR_THEME_LABELS || { dark: "الوضع النهاري", light: "الوضع الليلي" };

  const apply = () => {
    const dark = root.dataset.theme === "dark";
    const button = document.getElementById("themeToggle");
    if (!button) return;
    const text = dark ? labels().dark : labels().light;
    button.setAttribute("aria-label", text);
    button.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
    button.querySelector(".theme-label").textContent = text;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("themeToggle");
    apply();
    if (!button) return;
    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("medicalQrTheme", root.dataset.theme);
      apply();
    });
  });
})();
