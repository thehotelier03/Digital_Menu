// Theme toggler: light/dark with persistence
(function () {
  const STORAGE_KEY = 'theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    if (toggleBtn) toggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    document.documentElement.setAttribute('data-theme', theme);
  }

  let toggleBtn;
  function injectToggle() {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.type = 'button';
    toggleBtn.title = 'Toggle theme';
    toggleBtn.setAttribute('aria-label', 'Toggle theme');
    document.body.appendChild(toggleBtn);
    toggleBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('light') ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectToggle();
      applyTheme(getPreferredTheme());
    });
  } else {
    injectToggle();
    applyTheme(getPreferredTheme());
  }
})();


