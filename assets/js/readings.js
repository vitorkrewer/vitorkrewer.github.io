// ============================================================
// readings.js — Gerencia a Estante de Livros, Cinema e Ensaios
// ============================================================

function t(key) {
    return window.i18n ? window.i18n.t(key) : key;
}

function formatDate(isoStr) {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length < 3) return isoStr;
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${parts[2]} ${month} ${parts[0]}`;
}

function getParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

function normalizeWorkType(rawType) {
    const val = String(rawType || 'book').toLowerCase().trim();
    if (val === 'movie' || val === 'filme' || val === 'cinema' || val === 'film') {
        return 'movie';
    }
    return 'book';
}

function parseFrontmatter(rawText) {
    const match = rawText.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!match) return { data: {}, content: rawText };
    const yaml = match[1];
    const content = rawText.slice(match[0].length).trim();
    const data = {};
    yaml.split(/\r?\n/).forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
            const key = line.slice(0, colonIdx).trim();
            let val = line.slice(colonIdx + 1).trim();
            if (val.startsWith('[') && val.endsWith(']')) {
                val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            } else {
                val = val.replace(/^['"]|['"]$/g, '');
            }
            data[key] = val;
        }
    });
    return { data, content };
}

const BOOK_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
const FILM_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`;
const PERSON_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getParam('slug');
    const listSection = document.getElementById('readings-list-section');
    const readerSection = document.getElementById('readings-reader-section');
    const listContainer = document.getElementById('readings-list');
    const searchInput = document.getElementById('readings-search');
    const typeTabsContainer = document.getElementById('readings-type-tabs');
    const readerContainer = document.getElementById('reading-content');
    const readerMeta = document.getElementById('reading-meta');

    let allReadings = [];

    try {
        const res = await fetch('content/readings/index.json');
        const raw = await res.json();
        allReadings = raw
            .filter(r => r.status && r.status.toLowerCase() === 'publicado')
            .map(r => ({ ...r, _type: normalizeWorkType(r.type) }));
    } catch {
        if (listContainer) listContainer.innerHTML = `<div class="empty-state">Erro ao carregar leituras e filmes.</div>`;
        return;
    }

    // ── MODO LEITOR DE ENSAIO (quando slug está presente) ───────
    if (slug) {
        if (listSection) listSection.style.display = 'none';
        if (readerSection) readerSection.style.display = 'block';

        const item = allReadings.find(r => r.slug === slug);
        if (!item) {
            if (readerContainer) {
                readerContainer.innerHTML = `
                  <div class="empty-state">
                    Ensaio não encontrado ou ainda em rascunho.<br>
                    <a href="readings.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar às leituras e filmes</a>
                  </div>`;
            }
            return;
        }

        const initialCreator = item.director || item.diretor || item.author || '';
        document.title = `${item.title}${initialCreator ? ` (${initialCreator})` : ''} · Vitor Krewer`;

        if (readerMeta) {
            readerMeta.innerHTML = `
              <div style="margin-bottom:1.25rem;">
                <a href="readings.html" class="read-more-link" style="display:inline-flex;align-items:center;gap:0.4rem;margin-bottom:1.5rem;">
                  ← Voltar para leituras e filmes
                </a>
                
                <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                  <span class="reading-author-badge">
                    ${item._type === 'movie' ? FILM_ICON_SVG : PERSON_ICON_SVG}
                    ${initialCreator}
                  </span>
                  <span class="post-date">${formatDate(item.date)}</span>
                  <span class="post-read-time">⏱ ${item.readTime}</span>
                </div>

                <h1 class="post-hero-title" style="font-size:clamp(1.75rem,3.5vw,2.5rem);margin-bottom:1rem;">
                  ${item.title}
                </h1>

                <div class="reading-card-tags" style="margin-bottom:1.25rem;">
                  ${(item.tags || []).map(tg => `<span class="post-tag">#${tg}</span>`).join(' ')}
                </div>
              </div>
            `;
        }

        if (readerContainer) {
            readerContainer.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
            try {
                const mdRes = await fetch(`content/readings/${slug}.md`);
                if (!mdRes.ok) throw new Error('not found');
                const rawMd = await mdRes.text();

                const { data: fm, content: mdBody } = parseFrontmatter(rawMd);

                if (fm.status && fm.status.toLowerCase() === 'rascunho') {
                    readerContainer.innerHTML = `
                      <div class="empty-state">
                        Este ensaio ainda é um rascunho em desenvolvimento.<br>
                        <a href="readings.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar para leituras e filmes</a>
                      </div>`;
                    return;
                }

                const workType = normalizeWorkType(fm.type || item._type);
                const isMovie = workType === 'movie';

                const workTitle = fm.title || item.title || '';
                const workCreator = fm.director || fm.diretor || fm.author || item.director || item.diretor || item.author || '';
                const workCompany = fm.studio || fm.estudio || fm.distribuidora || fm.publisher || fm.editora || item.studio || item.estudio || item.distribuidora || item.publisher || item.editora || '';
                const workYear = fm.year || fm.ano || item.year || item.ano || '';
                const workOrigYear = fm.originalYear || fm.anoOriginal || item.originalYear || item.anoOriginal || '';
                const workDuration = fm.duration || fm.duracao || item.duration || item.duracao || '';

                let yearDisplay = '';
                if (workYear && workOrigYear && String(workYear) !== String(workOrigYear)) {
                    yearDisplay = `${workYear} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">(Original: ${workOrigYear})</span>`;
                } else if (workYear) {
                    yearDisplay = String(workYear);
                } else if (workOrigYear) {
                    yearDisplay = String(workOrigYear);
                }

                const cardLabel = isMovie ? '// FICHA DO FILME' : '// DADOS DO LIVRO';
                const badgeText = isMovie ? 'Ficha do Filme' : 'Ficha da Obra';
                const creatorLabel = isMovie ? 'Direção' : 'Autor';
                const companyLabel = isMovie ? 'Estúdio / Distribuição' : 'Editora';
                const yearLabel = isMovie ? 'Ano de Lançamento' : 'Ano de Publicação';

                const workCardHtml = (workCompany || workYear || workCreator) ? `
                  <div class="book-info-card">
                    <div class="book-info-header">
                      <span class="mono-label" style="font-size:0.72rem;margin:0;">${cardLabel}</span>
                      <span class="book-info-badge">
                        ${isMovie ? FILM_ICON_SVG : BOOK_ICON_SVG}
                        ${badgeText}
                      </span>
                    </div>
                    <div class="book-info-grid">
                      <div class="book-info-item">
                        <span class="book-info-label">Título da Obra</span>
                        <span class="book-info-value book-info-highlight">${workTitle}</span>
                      </div>
                      ${workCreator ? `
                      <div class="book-info-item">
                        <span class="book-info-label">${creatorLabel}</span>
                        <span class="book-info-value">${workCreator}</span>
                      </div>` : ''}
                      ${workCompany ? `
                      <div class="book-info-item">
                        <span class="book-info-label">${companyLabel}</span>
                        <span class="book-info-value">${workCompany}</span>
                      </div>` : ''}
                      ${yearDisplay ? `
                      <div class="book-info-item">
                        <span class="book-info-label">${yearLabel}</span>
                        <span class="book-info-value">${yearDisplay}</span>
                      </div>` : ''}
                      ${workDuration ? `
                      <div class="book-info-item">
                        <span class="book-info-label">Duração</span>
                        <span class="book-info-value">${workDuration}</span>
                      </div>` : ''}
                    </div>
                  </div>
                ` : '';

                let proseHtml = '';
                if (typeof marked !== 'undefined') {
                    const renderer = new marked.Renderer();
                    renderer.image = function (hrefOrObj, title, text) {
                        let href = typeof hrefOrObj === 'object' && hrefOrObj !== null ? hrefOrObj.href : hrefOrObj;
                        let tit = typeof hrefOrObj === 'object' && hrefOrObj !== null ? hrefOrObj.title : title;
                        let alt = typeof hrefOrObj === 'object' && hrefOrObj !== null ? hrefOrObj.text : text;
                        const altAttr = alt ? `alt="${String(alt).replace(/"/g, '&quot;')}"` : '';
                        const titleAttr = tit ? `title="${String(tit).replace(/"/g, '&quot;')}"` : '';
                        const caption = alt ? `<figcaption class="post-figcaption">${alt}</figcaption>` : '';
                        return `
                          <figure class="post-figure">
                            <img src="${href}" ${altAttr} ${titleAttr} loading="lazy" />
                            ${caption}
                          </figure>`;
                    };
                    marked.setOptions({ breaks: true, gfm: true, renderer });
                    proseHtml = `<div class="prose">${marked.parse(mdBody)}</div>`;
                } else {
                    proseHtml = `<div class="prose"><pre style="white-space:pre-wrap">${mdBody}</pre></div>`;
                }

                const footerHtml = `
                  <div style="margin-top:3.5rem;padding-top:1.75rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                    <a href="readings.html" class="btn btn-secondary">← Voltar para leituras e filmes</a>
                    <a href="index.html" class="read-more-link">Ir para o Blog de Tecnologia →</a>
                  </div>
                `;

                readerContainer.innerHTML = workCardHtml + proseHtml + footerHtml;
            } catch {
                readerContainer.innerHTML = `
                  <div class="empty-state">
                    Não foi possível carregar o texto completo deste ensaio.<br>
                    <a href="readings.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar para leituras e filmes</a>
                  </div>`;
            }
        }
        return;
    }

    // ── MODO LISTAGEM DE ENSAIOS ──────────────────────────────
    if (readerSection) readerSection.style.display = 'none';
    if (listSection) listSection.style.display = 'block';

    let activeType = 'all';
    let query = '';

    function applyFilters() {
        const filtered = allReadings.filter(r => {
            const matchesType = activeType === 'all' || r._type === activeType;
            if (!matchesType) return false;
            if (!query) return true;
            const creator = (r.director || r.diretor || r.author || '').toLowerCase();
            const company = (r.studio || r.estudio || r.distribuidora || r.publisher || r.editora || '').toLowerCase();
            return (
                r.title.toLowerCase().includes(query) ||
                creator.includes(query) ||
                company.includes(query) ||
                (r.year && String(r.year).includes(query)) ||
                r.excerpt.toLowerCase().includes(query) ||
                (r.tags || []).some(tg => tg.toLowerCase().includes(query))
            );
        });
        renderList(filtered);
    }

    function renderList(items) {
        if (!listContainer) return;

        if (!items.length) {
            listContainer.innerHTML = `<div class="empty-state">Nenhum ensaio encontrado${query ? ` para "${query}"` : ''}.</div>`;
            return;
        }

        listContainer.innerHTML = items.map(item => {
            const isMovie = item._type === 'movie';
            const creator = item.director || item.diretor || item.author || '';
            const company = item.studio || item.estudio || item.distribuidora || item.publisher || item.editora || '';
            const pubInfo = company ? `${company}${item.year ? ` (${item.year})` : ''}` : (item.year ? String(item.year) : '');
            const typeBadge = isMovie ? 'Filme' : 'Livro';

            return `
              <article class="post-card observe reading-card">
                <div style="flex:1">
                  <div class="post-card-meta">
                    <span class="book-meta-inline">
                      ${isMovie ? FILM_ICON_SVG : BOOK_ICON_SVG}
                      ${typeBadge}
                    </span>
                    ${creator ? `
                    <span class="reading-author-badge">
                      ${PERSON_ICON_SVG}
                      ${creator}
                    </span>` : ''}
                    ${pubInfo ? `
                    <span class="book-meta-inline">
                      ${pubInfo}
                    </span>` : ''}
                    <span class="post-date">${formatDate(item.date)}</span>
                    <div class="reading-tags-group" style="display:inline-flex;align-items:center;flex-wrap:wrap;gap:0.4rem;margin:0;">
                      ${(item.tags || []).slice(0, 4).map(tg => `<span class="post-tag">#${tg}</span>`).join(' ')}
                    </div>
                    <span class="post-read-time">⏱ ${item.readTime}</span>
                  </div>

                  <h2 class="post-title" style="margin-top:0.4rem">
                    <a href="readings.html?slug=${item.slug}">${item.title}</a>
                  </h2>

                  <p class="post-excerpt">${item.excerpt}</p>

                  <div class="post-card-footer">
                    <a href="readings.html?slug=${item.slug}" class="read-more-link">
                      ${isMovie ? 'Ler ensaio sobre o filme →' : 'Ler ensaio sobre a obra →'}
                    </a>
                    <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted)">
                      ${creator}
                    </span>
                  </div>
                </div>
              </article>
            `;
        }).join('');
    }

    if (typeTabsContainer) {
        typeTabsContainer.querySelectorAll('.filter-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                typeTabsContainer.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeType = btn.getAttribute('data-type') || 'all';
                applyFilters();
            });
        });
    }

    if (searchInput) {
        searchInput.placeholder = t('search_readings_placeholder') || 'Buscar por título, autor, diretor, editora ou tema...';
        searchInput.addEventListener('input', () => {
            query = searchInput.value.toLowerCase().trim();
            applyFilters();
        });
    }

    applyFilters();
});