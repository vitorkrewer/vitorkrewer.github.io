// ============================================================
// projects.js — Carrega e filtra projetos com paginação
// ============================================================

const PROJECTS_PER_PAGE = 6;

// ── Paginação (reutiliza a mesma lógica do blog.js) ──────────
function buildPagination(container, currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const buttons = [];

    buttons.push(`
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="Página anterior">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>
  `);

    const delta = 1;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }

    buttons.push(`<button class="page-btn ${currentPage === 1 ? 'active' : ''}" data-page="1">1</button>`);

    if (range[0] > 2) {
        buttons.push(`<button class="page-btn page-ellipsis" disabled>…</button>`);
    }

    range.forEach(p => {
        buttons.push(`<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`);
    });

    if (range[range.length - 1] < totalPages - 1) {
        buttons.push(`<button class="page-btn page-ellipsis" disabled>…</button>`);
    }

    if (totalPages > 1) {
        buttons.push(`<button class="page-btn ${currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`);
    }

    buttons.push(`
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" aria-label="Próxima página">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  `);

    container.innerHTML = `
    <div class="pagination">${buttons.join('')}</div>
    <p class="pagination-info">Página ${currentPage} de ${totalPages}</p>
  `;

    container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page)) onPageChange(page);
        });
    });
}

// ── Render micro terminal modal ──────────────────────────────
function openProjectTerminal(p) {
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const pTitle = p.title?.[lang] || p.title || '';
    
    const old = document.getElementById('proj-terminal-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'proj-terminal-overlay';
    overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;
    padding:1.5rem;
    animation: fadeOverlay 0.2s ease;
  `;

    overlay.innerHTML = `
    <div id="proj-terminal-box" style="
      background:var(--bg-secondary);
      border:1px solid var(--border);
      border-radius:12px;
      overflow:hidden;
      width:100%;
      max-width:640px;
      box-shadow:0 0 0 1px rgba(88,166,255,0.08), 0 24px 64px rgba(0,0,0,0.5);
      animation: slideUp 0.25s ease;
    ">
      <!-- Titlebar -->
      <div style="
        display:flex;align-items:center;padding:0.65rem 1rem;
        background:var(--bg-tertiary);
        border-bottom:1px solid var(--border);
        gap:.5rem;
      ">
        <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57;display:inline-block"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#febc2e;display:inline-block"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#28c840;display:inline-block"></span>
        <span style="flex:1;text-align:center;font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted)">
          cat ~/projects/${p.id}.json
        </span>
        <button id="proj-terminal-close" aria-label="Fechar" style="
          background:none;border:none;color:var(--text-muted);
          cursor:pointer;font-family:var(--font-mono);font-size:0.8rem;
          padding:.2rem .4rem;border-radius:4px;transition:all .2s;
        " onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
      </div>

      <!-- Terminal body -->
      <div style="padding:1.25rem 1.5rem;font-family:var(--font-mono);font-size:0.82rem;line-height:1.9; max-height:70vh; overflow-y:auto;">
        <div style="color:var(--text-muted);margin-bottom:1rem">
          <span style="color:#3fb950">vitor@krewer-dev</span><span style="color:var(--text-secondary)">:</span><span style="color:#58a6ff">~/projects</span><span style="color:var(--text-secondary)">$</span>
          <span style="color:var(--text-primary)"> cat ${typeof pTitle === 'string' ? pTitle.toLowerCase().replace(/\s+/g, '-') : 'project'}.json</span>
        </div>

        <div id="proj-terminal-output" style="color:var(--text-secondary)"></div>

        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
          <span style="color:#3fb950">vitor@krewer-dev</span><span style="color:var(--text-secondary)">:</span><span style="color:#58a6ff">~/projects</span><span style="color:var(--text-secondary)">$</span>
          <span class="proj-cursor" style="
            display:inline-block;width:8px;height:1em;
            background:var(--accent-blue);vertical-align:text-bottom;
            animation:blink 1s step-end infinite;margin-left:4px;
          "></span>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeProjectTerminal();
    });
    document.getElementById('proj-terminal-close').addEventListener('click', closeProjectTerminal);
    document.addEventListener('keydown', handleProjectEsc);

    typeProjectLines(p);
}

function closeProjectTerminal() {
    const overlay = document.getElementById('proj-terminal-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleProjectEsc);
}

function handleProjectEsc(e) {
    if (e.key === 'Escape') closeProjectTerminal();
}

function typeProjectLines(p) {
    const output = document.getElementById('proj-terminal-output');
    if (!output) return;

    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const l = {
        'pt-br': { title: 'título', cat: 'categoria', status: 'status', year: 'ano', tags: 'tags', desc: 'descrição', repo: 'repositório', blog: 'blog post', read_blog: 'Ler postagem sobre' },
        'en': { title: 'title', cat: 'category', status: 'status', year: 'year', tags: 'tags', desc: 'description', repo: 'repository', blog: 'blog post', read_blog: 'Read post about' },
        'es': { title: 'título', cat: 'categoría', status: 'estado', year: 'año', tags: 'etiquetas', desc: 'descripción', repo: 'repositorio', blog: 'entrada de blog', read_blog: 'Leer entrada sobre' }
    }[lang];

    const pTitle = p.title?.[lang] || p.title || '';
    const pDesc = p.description?.[lang] || p.description || '';
    
    const tFn = (window.i18n && window.i18n.t) || ((k) => k);
    
    // Map category string via i18n dictionaries
    let catKey = p.category === 'sistema' ? 'filter_systems' : (p.category === 'ferramenta' ? 'filter_tools' : 'filter_education');
    const pCat = tFn(catKey);

    let statusColor = p.status === 'production' || p.status === 'open-source' ? '#3fb950' : 'var(--text-secondary)';
    let catColor = p.category === 'sistema' ? '#58a6ff' : (p.category === 'ferramenta' ? '#d2a8ff' : '#f78166');

    const lines = [
        { label: l.title, value: pTitle, color: '#e6edf3' },
        { label: l.cat, value: pCat, color: catColor },
        { label: l.status, value: p.status, color: statusColor },
        { label: l.year, value: String(p.year), color: '#f78166' },
        { label: l.tags, value: p.tags.join(' · '), color: '#58a6ff' },
        { label: '', value: '', color: '' },
        { label: l.desc, value: pDesc, color: 'var(--text-secondary)', wrap: true },
        { label: '', value: '', color: '' }
    ];

    if (p.github) {
        lines.push({ label: l.repo, value: p.github, color: '#58a6ff', link: p.github });
    }
    
    if (p.blog) {
        lines.push({ label: l.blog, value: `${l.read_blog} ${pTitle}`, color: '#d2a8ff', link: p.blog });
    }

    let delay = 0;
    lines.forEach(line => {
        setTimeout(() => {
            if (!document.getElementById('proj-terminal-output')) return;
            if (!line.label && !line.value) {
                output.innerHTML += '<br>';
                return;
            }
            const label = line.label
                ? `<span style="color:var(--text-muted);user-select:none">${line.label.padEnd(12)}</span><span style="color:var(--text-muted)">: </span>`
                : '';
            const value = line.link
                ? `<a href="${line.link}" target="${line.link.startsWith('http') ? '_blank' : '_self'}" ${line.link.startsWith('http') ? 'rel="noopener"' : ''} style="color:${line.color};text-decoration:none" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${line.value}</a>`
                : `<span style="${line.wrap ? 'color:' + line.color : 'color:' + line.color}">${line.value}</span>`;
            output.innerHTML += `<div style="${line.wrap ? 'white-space:normal;line-height:1.7' : 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis'}">${label}${value}</div>`;
        }, delay);
        delay += 55;
    });
}

// ── Card HTML ───────────────────────────────────────────────
function projectCardHTML(p) {
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const l = {
        'pt-br': { btn_details: 'Detalhes', btn_repo: 'Ver repo' },
        'en': { btn_details: 'Details', btn_repo: 'View repo' },
        'es': { btn_details: 'Detalles', btn_repo: 'Ver repo' }
    }[lang];

    const pTitle = p.title?.[lang] || p.title || '';
    const pDesc = p.description?.[lang] || p.description || '';
    const tFn = (window.i18n && window.i18n.t) || ((k) => k);
    let catKey = p.category === 'sistema' ? 'filter_systems' : (p.category === 'ferramenta' ? 'filter_tools' : 'filter_education');
    const pCat = tFn(catKey);

    const catClass = `cat-${p.category}`;
    const statusDot = (p.status === 'production' || p.status === 'open-source')
        ? `<span class="project-status"><span class="dot"></span>${p.status}</span>`
        : `<span class="project-status" style="color:var(--text-muted)">${p.status}</span>`;

    const githubSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

    return `
    <article class="project-card observe">
      <div class="project-card-header">
        <span class="project-category ${catClass}">${pCat}</span>
        ${statusDot}
      </div>
      <h3 class="project-name">${pTitle}</h3>
      <p class="project-desc">${pDesc}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
      </div>
      <div class="project-card-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <span class="project-year">${p.year}</span>
        <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary btn-details" data-id="${p.id}" style="font-size:0.75rem;padding:0.35rem 0.75rem;font-family:var(--font-mono);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> ${l.btn_details}
            </button>
            ${p.github
                ? `<a href="${p.github}" target="_blank" rel="noopener" class="btn btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.75rem">${githubSVG} ${l.btn_repo}</a>`
                : ''}
        </div>
      </div>
    </article>
  `;
}

// ── Main ─────────────────────────────────────────────────────
async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    const paginationContainer = document.getElementById('projects-pagination');
    const tabs = document.querySelectorAll('.filter-tab');
    if (!grid) return;

    grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1"><div class="spinner"></div><span>Carregando projetos...</span></div>`;

    let allProjects = [];
    try {
        const res = await fetch('content/projects.json');
        allProjects = await res.json();
    } catch {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Erro ao carregar projetos.</div>`;
        return;
    }

    let filteredProjects = [...allProjects];
    let currentPage = 1;

    function renderPage(projects, page) {
        const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
        const start = (page - 1) * PROJECTS_PER_PAGE;
        const slice = projects.slice(start, start + PROJECTS_PER_PAGE);

        if (!slice.length) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Nenhum projeto nesta categoria.</div>`;
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        grid.innerHTML = slice.map(projectCardHTML).join('');

        // Animação com stagger
        grid.querySelectorAll('.project-card.observe').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = `opacity 0.35s ease ${i * 0.07}s, transform 0.35s ease ${i * 0.07}s`;
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        });

        if (paginationContainer) {
            buildPagination(paginationContainer, page, totalPages, (newPage) => {
                currentPage = newPage;
                renderPage(filteredProjects, currentPage);
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        // Add event listeners for terminal details
        grid.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = parseInt(btn.dataset.id);
                const project = allProjects.find(p => p.id === projectId);
                if (project) openProjectTerminal(project);
            });
        });
    }

    // Filtro por categoria
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            filteredProjects = filter === 'all' ? [...allProjects] : allProjects.filter(p => p.category === filter);
            currentPage = 1;
            renderPage(filteredProjects, currentPage);
        });
    });

    document.addEventListener('languageChanged', () => {
        renderPage(filteredProjects, currentPage);
    });

    renderPage(filteredProjects, currentPage);
}

document.addEventListener('DOMContentLoaded', loadProjects);
