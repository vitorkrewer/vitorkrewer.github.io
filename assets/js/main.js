// ============================================================
// main.js — Lógica global do portfolio
// ============================================================

// ── THEME TOGGLE ─────────────────────────────────────────────
const THEME_KEY = 'vk-theme';

// Migração segura: limpar tema salvo automaticamente no passado (que gravava 'dark' compulsoriamente)
try {
  if (!localStorage.getItem('vk-theme-initialized')) {
    localStorage.removeItem(THEME_KEY);
    localStorage.setItem('vk-theme-initialized', 'true');
  }
} catch (e) {}

function applyTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (save) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }
}

function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
  } catch (e) {}
  return 'light';
}

// Aplica o tema e o estado da sidebar ANTES do render para evitar flash
const SIDEBAR_COLLAPSED_KEY = 'vk-sidebar-collapsed';

function applySidebarCollapsed(collapsed, save = true) {
  if (collapsed) {
    document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
  } else {
    document.documentElement.removeAttribute('data-sidebar-collapsed');
  }
  if (save) {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? 'true' : 'false');
    } catch (e) {}
  }
}

(function () {
  const theme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  try {
    if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true') {
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
    }
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  const theme = getPreferredTheme();
  applyTheme(theme, false);

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
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'light' ? 'dark' : 'light');
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

  // --- AUTHOR SIDEBAR CONTROLS ---

  // 1. Language Pill Switcher
  const updateLangPills = () => {
    const currentLang = (window.i18n && window.i18n.currentLanguage()) || localStorage.getItem('vk-lang') || 'pt-br';
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === currentLang);
    });
  };
  updateLangPills();

  document.querySelectorAll('.lang-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && window.i18n && typeof window.i18n.setLanguage === 'function') {
        window.i18n.setLanguage(targetLang);
        updateLangPills();
      }
    });
  });

  window.addEventListener('languageChanged', updateLangPills);

  // 2. Sidebar Theme Toggle Button
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  });

  // 3. Mobile Sidebar Drawer & Backdrop
  const mobileMenuBtn = document.getElementById('mobile-menu-trigger');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  const closeSidebarDrawer = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  };

  const openSidebarDrawer = () => {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  };

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeSidebarDrawer();
      } else {
        openSidebarDrawer();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebarDrawer);
  }

  if (sidebar) {
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          closeSidebarDrawer();
        }
      });
    });

    // 4. Minimalist Desktop Sidebar Collapse / Expand Toggle
    const appLayout = document.querySelector('.app-layout');
    if (!sidebar.querySelector('.sidebar-collapse-btn')) {
      const collapseBtn = document.createElement('button');
      collapseBtn.type = 'button';
      collapseBtn.className = 'sidebar-collapse-btn';
      collapseBtn.setAttribute('aria-label', 'Recolher barra lateral (modo leitura)');
      collapseBtn.setAttribute('title', 'Recolher barra lateral [');
      collapseBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M9 3v18"></path>
          <path d="m16 15-3-3 3-3"></path>
        </svg>
      `;
      collapseBtn.addEventListener('click', () => {
        applySidebarCollapsed(true);
      });
      sidebar.insertBefore(collapseBtn, sidebar.firstChild);
    }

    if (appLayout && !document.querySelector('.sidebar-expand-btn')) {
      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'sidebar-expand-btn';
      expandBtn.setAttribute('aria-label', 'Mostrar barra lateral');
      expandBtn.setAttribute('title', 'Mostrar barra lateral [');
      expandBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M9 3v18"></path>
          <path d="m14 9 3 3-3 3"></path>
        </svg>
        <span>menu</span>
        <kbd class="expand-kbd">[</kbd>
      `;
      expandBtn.addEventListener('click', () => {
        applySidebarCollapsed(false);
      });
      appLayout.insertBefore(expandBtn, appLayout.firstChild);
    }

    // Atalho discreto de teclado '[' para alternar modo leitura em desktop
    document.addEventListener('keydown', (e) => {
      if (window.innerWidth <= 992) return;
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const isCollapsed = document.documentElement.getAttribute('data-sidebar-collapsed') === 'true';
        applySidebarCollapsed(!isCollapsed);
      }
    });
  }

  // --- NAV: highlight active link ---
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .sidebar-nav-link').forEach(a => {
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

  // --- YEAR in footer & sidebar ---
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

