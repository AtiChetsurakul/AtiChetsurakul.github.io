(function () {
  const root = document.documentElement;
  const langButtons = document.querySelectorAll("[data-set-lang]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const langBlocks = document.querySelectorAll("[data-lang-content]");
  const sectionLinks = document.querySelectorAll("[data-scroll-section]");
  const languageLabels = document.querySelectorAll("[data-label-en][data-label-th]");
  const year = document.querySelector("[data-current-year]");

  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const savedTheme = localStorage.getItem("theme") || preferredTheme;
  const savedLang = localStorage.getItem("lang") || "en";

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    if (themeToggle) {
      const lang = localStorage.getItem("lang") || root.lang || "en";
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
      themeToggle.textContent = theme === "dark"
        ? (lang === "th" ? "สว่าง" : "Light")
        : (lang === "th" ? "มืด" : "Dark");
    }
  }

  function setLanguage(lang) {
    root.lang = lang;
    langBlocks.forEach((block) => {
      block.hidden = block.dataset.langContent !== lang;
    });
    langButtons.forEach((button) => {
      const active = button.dataset.setLang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    languageLabels.forEach((node) => {
      node.textContent = lang === "th" ? node.dataset.labelTh : node.dataset.labelEn;
    });
    localStorage.setItem("lang", lang);
    setTheme(root.dataset.theme || savedTheme);
  }

  langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.setLang));
  });

  sectionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const activeLang = localStorage.getItem("lang") || "en";
      const activeBlock = document.querySelector(`[data-lang-content="${activeLang}"]`);
      const target = activeBlock && activeBlock.querySelector(`[data-section="${link.dataset.scrollSection}"]`);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  setTheme(savedTheme);
  setLanguage(savedLang);
})();
