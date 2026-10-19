// ============================================================
// readings.js — Gerencia a Estante e o Leitor de Ensaios Literários
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

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getParam('slug');
    const listSection = document.getElementById('readings-list-section');
    const readerSection = document.getElementById('readings-reader-section');
    const listContainer = document.getElementById('readings-list');
    const searchInput = document.getElementById('readings-search');
    const readerContainer = document.getElementById('reading-content');
    const readerMeta = document.getElementById('reading-meta');

    let allReadings = [];

    try {
        const res = await fetch('content/readings/index.json');
        const raw = await res.json();
        // Apenas ensaios publicados aparecem
        allReadings = raw.filter(r => r.status && r.status.toLowerCase() === 'publicado');
    } catch {
        if (listContainer) listContainer.innerHTML = `<div class="empty-state">Erro ao carregar leituras.</div>`;
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
                    <a href="readings.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar às leituras</a>
                  </div>`;
            }
            return;
        }

        document.title = `${item.title} (${item.author}) · Vitor Krewer`;

        if (readerMeta) {
            readerMeta.innerHTML = `
              <div style="margin-bottom:1.25rem;">
                <a href="readings.html" class="read-more-link" style="display:inline-flex;align-items:center;gap:0.4rem;margin-bottom:1.5rem;">
                  ← Voltar às leituras
                </a>
                
                <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                  <span class="reading-author-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    ${item.author}
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

                // Valida rascunho no frontmatter
                if (fm.status && fm.status.toLowerCase() === 'rascunho') {
                    readerContainer.innerHTML = `
                      <div class="empty-state">
                        Este ensaio ainda é um rascunho em desenvolvimento.<br>
                        <a href="readings.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar às leituras</a>
                      </div>`;
                    return;
                }

                // Dados consolidados do livro (Markdown frontmatter tem precedência sobre index.json)
                const bookTitle = fm.title || item.title || '';
                const bookAuthor = fm.author || item.author || '';
                const bookPublisher = fm.publisher || fm.editora || item.publisher || item.editora || '';
                const bookYear = fm.year || fm.ano || item.year || item.ano || '';
                const bookOrigYear = fm.originalYear || fm.anoOriginal || item.originalYear || item.anoOriginal || '';

                let yearDisplay = '';
                if (bookYear && bookOrigYear && String(bookYear) !== String(bookOrigYear)) {
                    yearDisplay = `${bookYear} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">(Original: ${bookOrigYear})</span>`;
                } else if (bookYear) {
                    yearDisplay = String(bookYear);
                } else if (bookOrigYear) {
                    yearDisplay = String(bookOrigYear);
                }

                // Card elegante no início com os dados do livro
                const bookCardHtml = (bookPublisher || bookYear || bookAuthor) ? `
                  <div class="book-info-card">
                    <div class="book-info-header">
                      <span class="mono-label" style="font-size:0.72rem;margin:0;">// DADOS DO LIVRO</span>
                      <span class="book-info-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        Ficha da Obra
                      </span>
                    </div>
                    <div class="book-info-grid">
                      <div class="book-info-item">
                        <span class="book-info-label">Título da Obra</span>
                        <span class="book-info-value book-info-highlight">${bookTitle}</span>
                      </div>
                      <div class="book-info-item">
                        <span class="book-info-label">Autor</span>
                        <span class="book-info-value">${bookAuthor}</span>
                      </div>
                      ${bookPublisher ? `
                      <div class="book-info-item">
                        <span class="book-info-label">Editora</span>
                        <span class="book-info-value">${bookPublisher}</span>
                      </div>` : ''}
                      ${yearDisplay ? `
                      <div class="book-info-item">
                        <span class="book-info-label">Ano de Publicação</span>
                        <span class="book-info-value">${yearDisplay}</span>
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
                          </figure>
                        `;
                    };

                    marked.setOptions({ breaks: true, gfm: true, renderer });
                    proseHtml = `<div class="prose">${marked.parse(mdBody)}</div>`;
                } else {
                    proseHtml = `<div class="prose"><pre style="white-space:pre-wrap">${mdBody}</pre></div>`;
                }

                const footerHtml = `
                  <div style="margin-top:3.5rem;padding-top:1.75rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                    <a href="readings.html" class="btn btn-secondary">← Voltar para todas as leituras</a>
                    <a href="index.html" class="read-more-link">Ir para o Blog de Tecnologia →</a>
                  </div>
                `;

                readerContainer.innerHTML = bookCardHtml + proseHtml + footerHtml;
            } catch {
                readerContainer.innerHTML = `
                  <div class="empty-state">
                    Não foi possível carregar o texto completo deste ensaio.<br>
                    <a href="readings.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar às leituras</a>
                  </div>`;
            }
        }
        return;
    }

    // ── MODO LISTAGEM DE ENSAIOS ──────────────────────────────
    if (readerSection) readerSection.style.display = 'none';
    if (listSection) listSection.style.display = 'block';

    let filtered = [...allReadings];
    let query = '';

    function renderList() {
        if (!listContainer) return;

        if (!filtered.length) {
            listContainer.innerHTML = `<div class="empty-state">Nenhum ensaio encontrado${query ? ` para "${query}"` : ''}.</div>`;
            return;
        }

        listContainer.innerHTML = filtered.map(item => {
            const pubInfo = item.publisher ? `${item.publisher}${item.year ? ` (${item.year})` : ''}` : '';
            return `
              <article class="post-card observe reading-card">
                <div style="flex:1">
                  <div class="post-card-meta">
                    <span class="reading-author-badge">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      ${item.author}
                    </span>
                    ${pubInfo ? `
                    <span class="book-meta-inline">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
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
                      Ler ensaio sobre a obra →
                    </a>
                    <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted)">
                      ${item.author}
                    </span>
                  </div>
                </div>
              </article>
            `;
        }).join('');
    }

    if (searchInput) {
        searchInput.placeholder = t('search_readings_placeholder') || 'Buscar por título, autor, editora ou tema...';
        searchInput.addEventListener('input', () => {
            query = searchInput.value.toLowerCase().trim();
            filtered = allReadings.filter(r => 
                r.title.toLowerCase().includes(query) ||
                r.author.toLowerCase().includes(query) ||
                (r.publisher && r.publisher.toLowerCase().includes(query)) ||
                (r.year && String(r.year).includes(query)) ||
                r.excerpt.toLowerCase().includes(query) ||
                (r.tags || []).some(tg => tg.toLowerCase().includes(query))
            );
            renderList();
        });
    }

    renderList();
});
