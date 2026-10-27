(() => {
  const key = "medicalQrThemeOrbit";
  const root = document.documentElement;
  let saved = "";
  try { saved = localStorage.getItem(key) || ""; } catch {}
  let theme = saved || "dark";

  function applyTheme() {
    root.dataset.theme = theme;
    const button = document.getElementById("themeToggle");
    if (!button) return;
    const dark = theme === "dark";
    button.setAttribute("aria-label", dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي");
    button.querySelector(".theme-label").textContent = dark ? "الوضع الفاتح" : "الوضع الليلي";
    button.querySelector(".theme-icon").textContent = dark ? "☼" : "◐";
  }

  applyTheme();
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(key, theme); } catch {}
    applyTheme();
  });
})();
