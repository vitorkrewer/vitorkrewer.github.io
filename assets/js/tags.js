// ============================================================
// tags.js — Gerencia a Nuvem Dinâmica de Tópicos e Tags
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

document.addEventListener('DOMContentLoaded', async () => {
    const cloudContainer = document.getElementById('tag-cloud');
    const statsContainer = document.getElementById('tag-stats');
    const searchInput = document.getElementById('tag-search');
    const resultsSection = document.getElementById('tag-results-section');
    const resultsContainer = document.getElementById('tag-results-container');
    const resultsTitle = document.getElementById('tag-results-title');

    if (!cloudContainer) return;

    cloudContainer.innerHTML = `<div class="loading-state" style="width:100%"><div class="spinner"></div><span>Carregando tópicos...</span></div>`;

    let allPosts = [];
    let projects = [];
    const postToProject = {};

    try {
        const [postsRes, projRes] = await Promise.all([
            fetch('content/posts/index.json'),
            fetch('content/projects.json').catch(() => null)
        ]);

        const rawPosts = await postsRes.json();
        allPosts = rawPosts.filter(p => p.status && p.status.toLowerCase() === 'publicado');

        if (projRes && projRes.ok) {
            projects = await projRes.json();
            projects.forEach(proj => {
                if (proj.blog && proj.blog.includes('slug=')) {
                    const slug = proj.blog.split('slug=')[1].split('&')[0];
                    postToProject[slug] = proj;
                }
                allPosts.forEach(post => {
                    if (proj.id && post.project === proj.id) {
                        postToProject[post.slug] = proj;
                    } else if (proj.series && post.series && proj.series.toLowerCase() === post.series.toLowerCase()) {
                        postToProject[post.slug] = proj;
                    }
                });
            });
        }
    } catch {
        cloudContainer.innerHTML = `<div class="empty-state">Erro ao carregar tópicos.</div>`;
        return;
    }

    // Calcula frequências das tags
    const tagCounts = {};
    allPosts.forEach(p => {
        (p.tags || []).forEach(tg => {
            tagCounts[tg] = (tagCounts[tg] || 0) + 1;
        });
    });

    const uniqueTags = Object.keys(tagCounts).sort((a, b) => {
        // Ordena por popularidade decrescente, e em caso de empate, alfabeticamente
        return tagCounts[b] - tagCounts[a] || a.localeCompare(b);
    });

    // Renderiza barra de estatísticas
    if (statsContainer) {
        const topTag = uniqueTags[0] || '—';
        statsContainer.innerHTML = `
            <div class="tag-stat-item">
                <span>Total de Publicações:</span>
                <span class="tag-stat-value">${allPosts.length}</span>
            </div>
            <div class="tag-stat-item">
                <span>Tópicos & Tecnologias:</span>
                <span class="tag-stat-value">${uniqueTags.length}</span>
            </div>
            <div class="tag-stat-item">
                <span>Tópico Mais Frequente:</span>
                <span class="tag-stat-value">#${topTag} (${tagCounts[topTag]} posts)</span>
            </div>
        `;
    }

    let selectedTag = null;
    let query = '';

    // Determina o peso visual da tag para escalonamento elegante
    function getTagWeight(count) {
        if (count >= 10) return 'weight-5';
        if (count >= 5) return 'weight-4';
        if (count >= 3) return 'weight-3';
        if (count >= 2) return 'weight-2';
        return 'weight-1';
    }

    function renderCloud() {
        const filteredTags = query 
            ? uniqueTags.filter(tg => tg.toLowerCase().includes(query))
            : uniqueTags;

        if (!filteredTags.length) {
            cloudContainer.innerHTML = `<div class="empty-state" style="width:100%">Nenhum tópico encontrado para "${query}".</div>`;
            return;
        }

        cloudContainer.innerHTML = filteredTags.map((tg, idx) => {
            const count = tagCounts[tg];
            const weightClass = getTagWeight(count);
            const isActive = selectedTag === tg ? 'active' : '';

            return `
                <button class="cloud-tag ${weightClass} ${isActive}" data-tag="${tg}" title="${count} artigo(s) sobre ${tg}">
                    <span class="cloud-tag-name">#${tg}</span>
                    <span class="cloud-tag-count">${count}</span>
                </button>
            `;
        }).join('');

        // Eventos de clique nas tags
        cloudContainer.querySelectorAll('.cloud-tag[data-tag]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tg = btn.dataset.tag;
                if (selectedTag === tg) {
                    selectedTag = null;
                } else {
                    selectedTag = tg;
                }
                renderCloud();
                renderResults();
            });
        });
    }

    function renderResults() {
        if (!resultsSection || !resultsContainer) return;

        if (!selectedTag) {
            resultsSection.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }

        const matchingPosts = allPosts.filter(p => (p.tags || []).includes(selectedTag));
        resultsSection.style.display = 'block';

        if (resultsTitle) {
            resultsTitle.innerHTML = `
                <span>Artigos com a tag <strong style="color:var(--accent-blue)">#${selectedTag}</strong></span>
                <span style="font-size:0.85rem;color:var(--text-muted);font-weight:normal">(${matchingPosts.length} encontrados)</span>
            `;
        }

        const lang = localStorage.getItem('vk-lang') || 'pt-br';

        resultsContainer.innerHTML = matchingPosts.map(post => {
            const linkedProject = postToProject[post.slug];
            const projectTitle = linkedProject ? (
                (typeof linkedProject.title === 'object' ? (linkedProject.title[lang] || linkedProject.title['pt-br']) : linkedProject.title)
            ) : null;

            return `
              <article class="post-card observe" style="margin-bottom:1.5rem">
                <div style="flex:1">
                  <div class="post-card-meta">
                    <span class="post-date">${formatDate(post.date)}</span>
                    ${post.series ? `<span class="post-series-badge">📖 ${post.series}${post.seriesOrder ? ` #${post.seriesOrder}` : ''}</span>` : ''}
                    ${(post.tags || []).map(tg => `
                        <span class="post-tag ${tg === selectedTag ? 'active' : ''}" style="${tg === selectedTag ? 'background:var(--accent-blue);color:#fff;border-color:var(--accent-blue)' : ''}">#${tg}</span>
                    `).join('')}
                    <span class="post-read-time">⏱ ${post.readTime}</span>
                  </div>
                  
                  <h2 class="post-title" style="margin-top:0.4rem">
                    <a href="blog/post.html?slug=${post.slug}">${post.title}</a>
                  </h2>

                  <p class="post-excerpt">${post.excerpt}</p>
                  
                  <div class="post-card-footer">
                    <a href="blog/post.html?slug=${post.slug}" class="read-more-link">
                      ${t('btn_read_more') || 'Ler artigo'} →
                    </a>

                    <div style="display:flex;gap:0.75rem;align-items:center;">
                        <a href="index.html?tag=${encodeURIComponent(selectedTag)}" class="btn btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.75rem">
                            Ver no feed do blog →
                        </a>
                        ${linkedProject ? `
                          <a href="projects.html?highlight=${linkedProject.id}" class="post-project-badge" title="${t('related_project')}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span>${t('related_project')}: <strong>${projectTitle}</strong></span>
                          </a>
                        ` : ''}
                    </div>
                  </div>
                </div>
              </article>
            `;
        }).join('');

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Busca rápida em tempo real
    if (searchInput) {
        searchInput.placeholder = t('search_tags_placeholder') || 'Buscar por tópico ou tecnologia...';
        searchInput.addEventListener('input', () => {
            query = searchInput.value.toLowerCase().trim();
            renderCloud();
        });
    }

    // Suporte a parâmetro inicial via URL (?tag=...)
    const initialTag = new URLSearchParams(window.location.search).get('tag');
    if (initialTag && tagCounts[initialTag]) {
        selectedTag = initialTag;
    }

    renderCloud();
    if (selectedTag) {
        renderResults();
    }
});
