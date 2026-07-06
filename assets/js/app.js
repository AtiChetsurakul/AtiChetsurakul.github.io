(function () {
  const root = document.documentElement;
  const langButtons = document.querySelectorAll("[data-set-lang]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const langBlocks = document.querySelectorAll("[data-lang-content]");
  const sectionLinks = document.querySelectorAll("[data-scroll-section]");
  const languageLabels = document.querySelectorAll("[data-label-en][data-label-th]");
  const markdownActions = document.querySelectorAll("[data-markdown-source]");
  const profileRevealButtons = document.querySelectorAll("[data-profile-reveal]");
  const year = document.querySelector("[data-current-year]");

  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const savedTheme = localStorage.getItem("theme") || preferredTheme;
  const savedLang = localStorage.getItem("lang") || "en";

  function updateMarkdownSources(lang) {
    markdownActions.forEach((action) => {
      const source = lang === "th" ? action.dataset.markdownSourceTh : action.dataset.markdownSourceEn;
      if (!source) {
        return;
      }
      action.dataset.markdownSource = source;
      action.querySelectorAll("[data-markdown-view], [data-markdown-download]").forEach((link) => {
        link.href = source;
      });
    });
  }

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
    updateMarkdownSources(lang);
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

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) {
      throw new Error("Clipboard copy failed");
    }
  }

  markdownActions.forEach((action) => {
    const button = action.querySelector("[data-copy-markdown]");
    const label = action.querySelector("[data-copy-label]");
    const status = action.querySelector("[data-copy-status]");
    const menu = action.querySelector(".markdown-menu");
    let resetTimer;

    button.addEventListener("click", async () => {
      window.clearTimeout(resetTimer);
      button.disabled = true;
      button.classList.remove("is-copied", "is-error");

      try {
        const response = await fetch(action.dataset.markdownSource);
        if (!response.ok) {
          throw new Error(`Could not load Markdown (${response.status})`);
        }
        await copyText(await response.text());
        const isThai = root.lang === "th";
        label.textContent = isThai ? "คัดลอกแล้ว" : "Copied";
        status.textContent = isThai
          ? "คัดลอก Markdown ไปยังคลิปบอร์ดแล้ว"
          : "Markdown copied to clipboard";
        button.classList.add("is-copied");
      } catch (error) {
        const isThai = root.lang === "th";
        label.textContent = isThai ? "คัดลอกไม่สำเร็จ" : "Copy failed";
        status.textContent = isThai
          ? "ไม่สามารถคัดลอก Markdown ได้"
          : "Could not copy Markdown";
        button.classList.add("is-error");
        console.error(error);
      } finally {
        button.disabled = false;
        resetTimer = window.setTimeout(() => {
          label.textContent = root.lang === "th"
            ? (label.dataset.labelTh || "คัดลอก Markdown")
            : (label.dataset.labelEn || "Copy Markdown");
          button.classList.remove("is-copied", "is-error");
        }, 2200);
      }
    });

    if (menu) {
      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          menu.open = false;
        });
      });
    }
  });

  profileRevealButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".profile-card");
      if (card) {
        card.classList.add("is-profile-revealed");
        button.setAttribute("aria-pressed", "true");
        button.blur();
      }
    });
  });

  document.addEventListener("click", (event) => {
    document.querySelectorAll(".markdown-menu[open]").forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.open = false;
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".markdown-menu[open]").forEach((menu) => {
        menu.open = false;
        menu.querySelector("summary").focus();
      });
    }
  });

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  setTheme(savedTheme);
  setLanguage(savedLang);
})();
