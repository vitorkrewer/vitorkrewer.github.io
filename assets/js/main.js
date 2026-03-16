// ============================================================
// main.js — Lógica global do portfolio
// ============================================================

// ── THEME TOGGLE ─────────────────────────────────────────────
const THEME_KEY = 'vk-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Aplica o tema ANTES do render para evitar flash
(function () {
  const theme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {
  const theme = getPreferredTheme();
  applyTheme(theme);

  // Injeta botão de toggle em todas as navs
  const navInners = document.querySelectorAll('.nav-inner');
  navInners.forEach(navInner => {
    const existing = navInner.querySelector('.theme-toggle');
    if (existing) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    const t = window.i18n ? window.i18n.t : (k) => k;
    btn.setAttribute('aria-label', t('toggle_theme') || 'Alternar tema');
    btn.innerHTML = `
      <!-- Moon (dark theme icon) -->
      <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <!-- Sun (light theme icon) -->
      <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    `;

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Insere o botão antes do hamburger (ou no final do nav-inner)
    const hamburger = navInner.querySelector('.nav-hamburger');
    
    // -- Lang Switcher --
    const langBtn = document.createElement('button');
    langBtn.className = 'lang-toggle';
    langBtn.setAttribute('aria-label', t('toggle_lang') || 'Trocar idioma');
    langBtn.style.cssText = 'background:none; border:none; color:var(--text-muted); font-family:var(--font-mono); font-size:0.75rem; cursor:pointer; padding:0.25rem 0.5rem; transition:color 0.2s';
    
    const updateLangBtnText = () => {
        const lang = localStorage.getItem('vk-lang') || 'pt-br';
        langBtn.textContent = lang === 'pt-br' ? 'PT-BR' : (lang === 'en' ? 'EN' : 'ES');
    };
    updateLangBtnText();
    
    langBtn.addEventListener('click', () => {
        const current = localStorage.getItem('vk-lang') || 'pt-br';
        let next = 'en';
        if (current === 'en') next = 'es';
        if (current === 'es') next = 'pt-br';
        
        if (window.i18n && typeof window.i18n.setLanguage === 'function') {
            window.i18n.setLanguage(next);
            updateLangBtnText();
        }
    });

    // Escuta evento global para manter múltiplos botões sincronizados
    window.addEventListener('languageChanged', updateLangBtnText);

    // Box para agrupar os toggles
    const toolsBox = document.createElement('div');
    toolsBox.style.cssText = 'display:flex; align-items:center; gap:0.5rem; margin-right:1rem';
    toolsBox.appendChild(langBtn);
    toolsBox.appendChild(btn);

    if (hamburger) {
      navInner.insertBefore(toolsBox, hamburger);
    } else {
      navInner.appendChild(toolsBox);
    }
  });

  // --- NAV: Hamburger menu ---
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // --- NAV: highlight active link ---
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const linkPage = href.split('/').pop();
    a.classList.toggle('active', linkPage === currentPath ||
      (currentPath === '' && linkPage === 'index.html'));
  });

  // --- FADE IN on scroll ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.observe').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // --- YEAR in footer ---
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
