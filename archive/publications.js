// ============================================================
// publications.js — Grid de publicações + micro terminal modal
// ============================================================

// ── Cores do micro terminal ──────────────────────────────────
const TYPE_COLORS = {
    'livro-didático': { badge: 'rgba(88,166,255,0.12)', text: '#58a6ff', label: 'Didático' },
    'livro-preparatório': { badge: 'rgba(63,185,80,0.12)', text: '#3fb950', label: 'Preparatório' },
    'livro-legislação': { badge: 'rgba(247,129,102,0.12)', text: '#f78166', label: 'Legislação' },
};

function typeInfo(type) {
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const lText = {
        'livro-didático': { 'pt-br': 'Didático', 'en': 'Textbook', 'es': 'Didáctico' },
        'livro-preparatório': { 'pt-br': 'Preparatório', 'en': 'Preparatory', 'es': 'Preparatorio' },
        'livro-legislação': { 'pt-br': 'Legislação', 'en': 'Legislation', 'es': 'Legislación' }
    }[type]?.[lang] || type;

    const info = TYPE_COLORS[type] || { badge: 'rgba(210,168,255,0.12)', text: '#d2a8ff', label: type };
    return { ...info, label: lText };
}

// ── Formata data de publicação ───────────────────────────────
function formatYear(y) { return `${y}`; }

// ── Render micro terminal ────────────────────────────────────
function openTerminal(pub) {
    // Remove modal anterior se existir
    const old = document.getElementById('pub-terminal-overlay');
    if (old) old.remove();

    const info = typeInfo(pub.type);

    const overlay = document.createElement('div');
    overlay.id = 'pub-terminal-overlay';
    overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;
    padding:1.5rem;
    animation: fadeOverlay 0.2s ease;
  `;

    overlay.innerHTML = `
    <div id="pub-terminal-box" style="
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
          cat ~/publications/${pub.slug}.json
        </span>
        <button id="pub-terminal-close" aria-label="Fechar" style="
          background:none;border:none;color:var(--text-muted);
          cursor:pointer;font-family:var(--font-mono);font-size:0.8rem;
          padding:.2rem .4rem;border-radius:4px;transition:all .2s;
        " onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
      </div>

      <!-- Terminal body -->
      <div style="padding:1.25rem 1.5rem;font-family:var(--font-mono);font-size:0.82rem;line-height:1.9">
        <div style="color:var(--text-muted);margin-bottom:1rem">
          <span style="color:#3fb950">vitor@krewer-dev</span><span style="color:var(--text-secondary)">:</span><span style="color:#58a6ff">~/publications</span><span style="color:var(--text-secondary)">$</span>
          <span style="color:var(--text-primary)"> cat ${pub.slug}.json</span>
        </div>

        <div id="pub-terminal-output" style="color:var(--text-secondary)"></div>

        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
          <span style="color:#3fb950">vitor@krewer-dev</span><span style="color:var(--text-secondary)">:</span><span style="color:#58a6ff">~/publications</span><span style="color:var(--text-secondary)">$</span>
          <span class="pub-cursor" style="
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

    // Fecha ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeTerminal();
    });
    document.getElementById('pub-terminal-close').addEventListener('click', closeTerminal);
    document.addEventListener('keydown', handleEsc);

    // Anima o texto linha a linha
    typeLines(pub, info);
}

function closeTerminal() {
    const overlay = document.getElementById('pub-terminal-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEsc);
}

function handleEsc(e) {
    if (e.key === 'Escape') closeTerminal();
}

function typeLines(pub, info) {
    const output = document.getElementById('pub-terminal-output');
    if (!output) return;

    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const l = {
        'pt-br': { title: 'título', sub: 'subtítulo', year: 'ano', type: 'tipo', authors: 'autores', role: 'função', area: 'área', publisher: 'editora', pages: 'páginas', pgs: 'pgs', tags: 'tags', desc: 'descrição', lattes: 'lattes' },
        'en': { title: 'title', sub: 'subtitle', year: 'year', type: 'type', authors: 'authors', role: 'role', area: 'area', publisher: 'publisher', pages: 'pages', pgs: 'pgs', tags: 'tags', desc: 'description', lattes: 'lattes' },
        'es': { title: 'título', sub: 'subtítulo', year: 'año', type: 'tipo', authors: 'autores', role: 'función', area: 'área', publisher: 'editorial', pages: 'páginas', pgs: 'pgs', tags: 'etiquetas', desc: 'descripción', lattes: 'lattes' }
    }[lang];

    const pTitle = pub.title?.[lang] || pub.title || '';
    const pSub = pub.subtitle?.[lang] || pub.subtitle || '';
    const pRole = pub.role?.[lang] || pub.role || '';
    const pArea = pub.area?.[lang] || pub.area || '';
    const pDesc = pub.description?.[lang] || pub.description || '';

    const lines = [
        { label: l.title, value: pTitle, color: '#e6edf3' },
        { label: l.sub, value: pSub, color: 'var(--text-secondary)' },
        { label: l.year, value: String(pub.year), color: '#f78166' },
        { label: l.type, value: info.label, color: info.text },
        { label: l.authors, value: pub.authors.join(', '), color: '#d2a8ff' },
        { label: l.role, value: pRole, color: '#58a6ff' },
        { label: l.area, value: pArea, color: '#3fb950' },
        { label: l.publisher, value: pub.publisher, color: 'var(--text-secondary)' },
        { label: l.pages, value: `${pub.pages} ${l.pgs}`, color: 'var(--text-secondary)' },
        { label: l.tags, value: pub.tags.join(' · '), color: '#58a6ff' },
        { label: '', value: '', color: '' },
        { label: l.desc, value: pDesc, color: 'var(--text-secondary)', wrap: true },
        { label: '', value: '', color: '' },
        { label: l.lattes, value: pub.lattes, color: '#58a6ff', link: pub.lattes },
    ];

    let delay = 0;
    lines.forEach(line => {
        setTimeout(() => {
            if (!document.getElementById('pub-terminal-output')) return;
            if (!line.label && !line.value) {
                output.innerHTML += '<br>';
                return;
            }
            const label = line.label
                ? `<span style="color:var(--text-muted);user-select:none">${line.label.padEnd(12)}</span><span style="color:var(--text-muted)">: </span>`
                : '';
            const value = line.link
                ? `<a href="${line.link}" target="_blank" rel="noopener" style="color:${line.color};text-decoration:none" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${line.value}</a>`
                : `<span style="color:${line.color}">${line.value}</span>`;
            output.innerHTML += `<div style="${line.wrap ? 'white-space:normal;line-height:1.7' : 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis'}">${label}${value}</div>`;
        }, delay);
        delay += 55;
    });
}

// ── Card HTML ────────────────────────────────────────────────
function publicationCardHTML(pub) {
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const info = typeInfo(pub.type);
    
    const pTitle = pub.title?.[lang] || pub.title || '';
    const pSub = pub.subtitle?.[lang] || pub.subtitle || '';
    
    const tFn = (window.i18n && window.i18n.t) || ((k) => k);
    const catText = tFn('cat_info') || 'cat info';

    return `
    <article class="pub-card observe" data-id="${pub.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${pTitle}">
      <div class="pub-card-header">
        <span class="pub-year">${pub.year}</span>
        <span class="pub-badge" style="background:${info.badge};color:${info.text}">${info.label}</span>
      </div>
      <h3 class="pub-title">${pTitle}</h3>
      <p class="pub-subtitle">${pSub}</p>
      <div class="pub-authors">${pub.authors.join(' — ')}</div>
      <div class="pub-footer">
        <div style="display:flex;flex-wrap:wrap;gap:.35rem">
          ${pub.tags.slice(0, 3).map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <span class="pub-cta">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          ${catText}
        </span>
      </div>
    </article>
  `;
}

// ── Main ─────────────────────────────────────────────────────
async function loadPublications() {
    const grid = document.getElementById('publications-grid');
    const counterEl = document.getElementById('pub-count');
    if (!grid) return;

    grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1"><div class="spinner"></div><span>Carregando publicações...</span></div>`;

    let pubs = [];
    try {
        const res = await fetch('content/publications.json');
        pubs = await res.json();
    } catch {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Erro ao carregar publicações.</div>`;
        return;
    }

    if (counterEl) counterEl.textContent = pubs.length;

    function renderPubs() {
        grid.innerHTML = pubs.map(publicationCardHTML).join('');

        // Animação stagger
        grid.querySelectorAll('.pub-card').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = `opacity 0.35s ease ${i * 0.07}s, transform 0.35s ease ${i * 0.07}s`;
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        });

        // Click handler — abre o micro terminal
        grid.querySelectorAll('.pub-card').forEach(card => {
            const handler = () => {
                const pub = pubs.find(p => p.id === parseInt(card.dataset.id));
                if (pub) openTerminal(pub);
            };
            card.addEventListener('click', handler);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
        });
    }

    document.addEventListener('languageChanged', renderPubs);
    renderPubs();
}

document.addEventListener('DOMContentLoaded', loadPublications);
