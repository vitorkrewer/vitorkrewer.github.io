// ============================================================
// blog.js — Sistema de blog com marked.js + paginação
// ============================================================

const POSTS_PER_PAGE = 5;

// ── Utilitários ─────────────────────────────────────────────
function formatDate(isoDate) {
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' });
}

function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

// ── Paginação ────────────────────────────────────────────────
function buildPagination(container, currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const buttons = [];

    // Prev
    buttons.push(`
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="Página anterior">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>
  `);

    // Pages with ellipsis
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

    // Next
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

// ── Animação de entrada dos cards ───────────────────────────
function animateCards(selector = '.observe') {
    document.querySelectorAll(selector).forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(14px)';
        el.style.transition = `opacity 0.35s ease ${i * 0.06}s, transform 0.35s ease ${i * 0.06}s`;
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    });
}

// ── LISTA DE POSTS (raiz index.html ou blog/index.html) ────────────────────────
async function loadPostList() {
    const listContainer = document.getElementById('post-list');
    const paginationContainer = document.getElementById('blog-pagination');
    const searchInput = document.getElementById('blog-search');
    const tagFilterContainer = document.getElementById('tag-filters');
    if (!listContainer) return;

    const t = (window.i18n && window.i18n.t) || ((k) => k);
    const getLang = () => (window.i18n && window.i18n.currentLanguage()) || localStorage.getItem('vk-lang') || 'pt-br';
    listContainer.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>${t('loading_posts')}</span></div>`;

    const isSubdir = window.location.pathname.includes('/blog/');
    const postsJsonPath = isSubdir ? '../content/posts/index.json' : 'content/posts/index.json';
    const projectsJsonPath = isSubdir ? '../content/projects.json' : 'content/projects.json';
    const postUrlPrefix = isSubdir ? 'post.html?slug=' : 'blog/post.html?slug=';
    const projectUrl = isSubdir ? '../projects.html' : 'projects.html';

    let allPosts = [];
    let postToProject = {};

    try {
        const [postsRes, projRes] = await Promise.all([
            fetch(postsJsonPath),
            fetch(projectsJsonPath).catch(() => null)
        ]);

        const rawPosts = await postsRes.json();
        // Apenas postagens com status 'Publicado' aparecem no site
        allPosts = rawPosts.filter(p => p.status && p.status.toLowerCase() === 'publicado');

        if (projRes && projRes.ok) {
            const projects = await projRes.json();
            projects.forEach(proj => {
                if (proj.blog && proj.blog.includes('slug=')) {
                    const slug = proj.blog.split('slug=')[1].split('&')[0];
                    postToProject[slug] = proj;
                }
            });
        }
    } catch (err) {
        listContainer.innerHTML = `<div class="empty-state">${t('ui_error') || 'Erro ao carregar artigos.'}</div>`;
        return;
    }

    // Gerar lista de tags únicas
    const allTags = new Set();
    allPosts.forEach(p => (p.tags || []).forEach(tag => allTags.add(tag)));

    let selectedTag = null;
    let searchQuery = '';
    let currentPage = 1;

    // Renderizar tags para filtro
    function renderTagFilters() {
        if (!tagFilterContainer) return;
        const tags = Array.from(allTags);
        tagFilterContainer.innerHTML = `
            <button class="tag-filter-btn ${!selectedTag ? 'active' : ''}" data-tag="">
                ${t('filter_all_tags') || 'Todos'}
            </button>
            ${tags.map(tag => `
                <button class="tag-filter-btn ${selectedTag === tag ? 'active' : ''}" data-tag="${tag}">
                    #${tag}
                </button>
            `).join('')}
        `;

        tagFilterContainer.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                selectedTag = tag === selectedTag ? null : (tag || null);
                currentPage = 1;
                filterAndRender();
                renderTagFilters();
            });
        });
    }

    function filterAndRender() {
        let filtered = [...allPosts];

        if (selectedTag) {
            filtered = filtered.filter(p => p.tags && p.tags.includes(selectedTag));
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery) ||
                p.excerpt.toLowerCase().includes(searchQuery) ||
                p.tags.some(t => t.toLowerCase().includes(searchQuery))
            );
        }

        renderPage(filtered, currentPage);
    }

    function renderPage(posts, page) {
        const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
        const start = (page - 1) * POSTS_PER_PAGE;
        const slice = posts.slice(start, start + POSTS_PER_PAGE);

        if (!slice.length) {
            listContainer.innerHTML = `<div class="empty-state">${t('no_posts_found') || 'Nenhum artigo encontrado.'}</div>`;
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        const lang = getLang();

        listContainer.innerHTML = slice.map(post => {
            const linkedProject = postToProject[post.slug];
            const projectTitle = linkedProject ? (
                (typeof linkedProject.title === 'object' ? (linkedProject.title[lang] || linkedProject.title['pt-br']) : linkedProject.title)
            ) : null;

            return `
              <article class="post-card observe">
                <div style="flex:1">
                  <div class="post-card-meta">
                    <span class="post-date">${formatDate(post.date)}</span>
                    ${(post.tags || []).slice(0, 3).map(tg => `<span class="post-tag">#${tg}</span>`).join('')}
                    <span class="post-read-time">⏱ ${post.readTime}</span>
                  </div>
                  
                  <h2 class="post-title">
                    <a href="${postUrlPrefix}${post.slug}">${post.title}</a>
                  </h2>

                  <p class="post-excerpt">${post.excerpt}</p>
                  
                  <div class="post-card-footer">
                    <a href="${postUrlPrefix}${post.slug}" class="read-more-link">
                      ${t('btn_read_more') || 'Ler artigo'} →
                    </a>

                    ${linkedProject ? `
                      <a href="${projectUrl}?highlight=${linkedProject.id}" class="post-project-badge" title="${t('related_project')}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>${t('related_project')}: <strong>${projectTitle}</strong></span>
                      </a>
                    ` : ''}
                  </div>
                </div>
              </article>
            `;
        }).join('');

        animateCards('.post-card.observe');

        if (paginationContainer) {
            buildPagination(paginationContainer, page, totalPages, (newPage) => {
                currentPage = newPage;
                filterAndRender();
                listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    // Pesquisa com debounce
    if (searchInput) {
        searchInput.placeholder = t('search_posts_placeholder');
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.toLowerCase().trim();
            currentPage = 1;
            filterAndRender();
        });
    }

    renderTagFilters();
    filterAndRender();

    // Re-render when language changes
    document.addEventListener('languageChanged', () => {
        if (searchInput) searchInput.placeholder = t('search_posts_placeholder');
        renderTagFilters();
        filterAndRender();
    });
}

// ── LEITOR DE POST (blog/post.html) ─────────────────────────
async function loadPost() {
    const slug = getParam('slug');
    const container = document.getElementById('post-content');
    const metaContainer = document.getElementById('post-meta');
    if (!container || !slug) {
        if (container) container.innerHTML = `<div class="empty-state">Post não encontrado.<br><a href="index.html" style="color:var(--accent-blue)">← Voltar ao blog</a></div>`;
        return;
    }

    let postMeta = null;
    let linkedProject = null;
    try {
        const [postsRes, projRes] = await Promise.all([
            fetch('../content/posts/index.json'),
            fetch('../content/projects.json').catch(() => null)
        ]);
        const posts = await postsRes.json();
        postMeta = posts.find(p => p.slug === slug);
        if (projRes && projRes.ok) {
            const projects = await projRes.json();
            linkedProject = projects.find(p => p.blog && p.blog.includes(slug));
        }
    } catch { /* sem meta */ }

    if (postMeta) {
        // Bloqueia exibição de post rascunho
        if (postMeta.status && postMeta.status.toLowerCase() !== 'publicado') {
            container.innerHTML = `
              <div class="empty-state">
                Este artigo ainda é um rascunho em desenvolvimento.<br>
                <a href="../index.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar ao blog</a>
              </div>`;
            return;
        }

        document.title = `${postMeta.title} · Vitor Krewer`;
        if (metaContainer) {
            const lang = localStorage.getItem('vk-lang') || 'pt-br';
            const projectTitle = linkedProject ? (
                (typeof linkedProject.title === 'object' ? (linkedProject.title[lang] || linkedProject.title['pt-br']) : linkedProject.title)
            ) : '';

            metaContainer.innerHTML = `
        <div class="post-card-meta" style="margin-bottom:1.25rem;display:flex;flex-wrap:wrap;align-items:center;gap:0.75rem;">
          <span class="post-date">${formatDate(postMeta.date)}</span>
          ${postMeta.tags.map(t => `<span class="post-tag">${t}</span>`).join('')}
          <span class="post-read-time">⏱ ${postMeta.readTime}</span>
          ${linkedProject ? `
            <a href="../projects.html?highlight=${linkedProject.id}" class="post-project-badge" title="${t('related_project')}" style="margin:0;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${t('related_project')}: <strong>${projectTitle}</strong></span>
            </a>
          ` : ''}
        </div>
      `;
        }
        const titleEl = document.getElementById('post-title');
        if (titleEl) titleEl.textContent = postMeta.title;
    }

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
    try {
        const res = await fetch(`../content/posts/${slug}.md`);
        if (!res.ok) throw new Error('not found');
        let rawMd = await res.text();
        
        // Bloqueia caso o frontmatter do markdown defina como rascunho
        const statusMatch = rawMd.match(/^---[\s\S]*?status:\s*([^\n\r]+)[\s\S]*?---/i);
        if (statusMatch && statusMatch[1].trim().toLowerCase() === 'rascunho') {
            container.innerHTML = `
              <div class="empty-state">
                Este artigo ainda é um rascunho em desenvolvimento.<br>
                <a href="../index.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar ao blog</a>
              </div>`;
            return;
        }

        let md = rawMd.replace(/^---[\s\S]*?---\n?/, '').trim();

        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true });
            container.innerHTML = `<div class="prose">${marked.parse(md)}</div>`;
        } else {
            container.innerHTML = `<div class="prose"><pre style="white-space:pre-wrap">${md}</pre></div>`;
        }
    } catch {
        container.innerHTML = `
      <div class="empty-state">
        Post não encontrado.<br>
        <a href="index.html" style="color:var(--accent-blue);margin-top:1rem;display:inline-block">← Voltar ao blog</a>
      </div>`;
    }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('post-list')) loadPostList();
    if (document.getElementById('post-content')) loadPost();
});
