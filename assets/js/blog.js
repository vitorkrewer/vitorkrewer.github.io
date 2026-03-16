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

// ── LISTA DE POSTS (blog/index.html) ────────────────────────
async function loadPostList() {
    const listContainer = document.getElementById('post-list');
    const paginationContainer = document.getElementById('blog-pagination');
    const searchInput = document.getElementById('blog-search');
    if (!listContainer) return;

    const t = (window.i18n && window.i18n.t) || ((k) => k);
    listContainer.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>${t('loading_posts')}</span></div>`;

    let allPosts = [];
    try {
        const res = await fetch('../content/posts/index.json');
        allPosts = await res.json();
    } catch {
        listContainer.innerHTML = `<div class="empty-state">Erro ao carregar artigos.</div>`;
        return;
    }

    let filteredPosts = [...allPosts];
    let currentPage = 1;

    function renderPage(posts, page) {
        const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
        const start = (page - 1) * POSTS_PER_PAGE;
        const slice = posts.slice(start, start + POSTS_PER_PAGE);

        if (!slice.length) {
            listContainer.innerHTML = `<div class="empty-state">Nenhum artigo encontrado.</div>`;
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        listContainer.innerHTML = slice.map(post => `
      <a href="post.html?slug=${post.slug}" class="post-card observe">
        <div style="flex:1">
          <div class="post-card-meta">
            <span class="post-date">${formatDate(post.date)}</span>
            ${post.tags.slice(0, 2).map(t => `<span class="post-tag">${t}</span>`).join('')}
            <span class="post-read-time">⏱ ${post.readTime}</span>
          </div>
          <div class="post-title">${post.title}</div>
          <div class="post-excerpt">${post.excerpt}</div>
        </div>
      </a>
    `).join('');

        animateCards('.post-card.observe');

        if (paginationContainer) {
            buildPagination(paginationContainer, page, totalPages, (newPage) => {
                currentPage = newPage;
                renderPage(filteredPosts, currentPage);
                listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    // Pesquisa
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            filteredPosts = q
                ? allPosts.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.excerpt.toLowerCase().includes(q) ||
                    p.tags.some(t => t.toLowerCase().includes(q))
                )
                : [...allPosts];
            currentPage = 1;
            renderPage(filteredPosts, currentPage);
        });
    }

    renderPage(filteredPosts, currentPage);

    // Re-render when language changes
    document.addEventListener('languageChanged', () => {
        if (searchInput) {
            searchInput.placeholder = t('search_posts_placeholder');
        }
        renderPage(filteredPosts, currentPage);
    });
    
    // Initial placeholder
    if (searchInput) searchInput.placeholder = t('search_posts_placeholder');
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
    try {
        const res = await fetch('../content/posts/index.json');
        const posts = await res.json();
        postMeta = posts.find(p => p.slug === slug);
    } catch { /* sem meta */ }

    if (postMeta) {
        document.title = `${postMeta.title} · Vitor Krewer`;
        if (metaContainer) {
            metaContainer.innerHTML = `
        <div class="post-card-meta" style="margin-bottom:1rem">
          <span class="post-date">${formatDate(postMeta.date)}</span>
          ${postMeta.tags.map(t => `<span class="post-tag">${t}</span>`).join('')}
          <span class="post-read-time">⏱ ${postMeta.readTime}</span>
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
        let md = await res.text();
        md = md.replace(/^---[\s\S]*?---\n?/, '').trim();

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
