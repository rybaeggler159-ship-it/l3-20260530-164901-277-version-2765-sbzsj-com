
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const menuBtn = $('.menu-toggle');
  const nav = $('.site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const quick = $('#quickSearch');
  const quickBtn = $('#quickSearchBtn');
  if (quick && quickBtn) {
    const go = () => {
      const q = quick.value.trim();
      const url = q ? `/search.html?q=${encodeURIComponent(q)}` : '/search.html';
      location.href = url;
    };
    quickBtn.addEventListener('click', go);
    quick.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  const global = $('#globalSearch');
  const globalBtn = $('#globalSearchBtn');
  const results = $('#searchResults');
  const searchCount = $('#searchCount');
  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q') || '';
  if (global) global.value = initialQ;

  function renderCatalog(q) {
    if (!results || !window.CATALOG) return;
    const query = (q || '').trim().toLowerCase();
    const list = !query ? window.CATALOG.slice(0, 120) : window.CATALOG.filter(item => {
      const hay = [item.title, item.region, item.type, item.genre, item.tags, String(item.year), item.one_line].join(' ').toLowerCase();
      return hay.includes(query);
    }).slice(0, 240);
    if (searchCount) searchCount.textContent = `共找到 ${list.length} 条结果`;
    results.innerHTML = list.map(item => `
      <article class="movie-card" style="--h1:${item.h1};--h2:${item.h2};--h3:${item.h3};">
        <a class="movie-link" href="${item.path}">
          <div class="poster">
            <div class="poster-top">${item.category}</div>
            <div class="poster-mid">
              <span class="poster-year">${item.year}</span>
              <h3>${item.title}</h3>
              <p>${item.region} · ${item.genre}</p>
            </div>
            <div class="poster-bottom">${item.one_line}</div>
          </div>
          <div class="card-body">
            <div class="card-title">${item.title}</div>
            <div class="card-meta">${item.region} · ${item.year} · ${item.genre}</div>
          </div>
        </a>
      </article>`).join('') || '<div class="tip-card">没有找到匹配内容。</div>';
  }
  if (results && window.CATALOG) {
    renderCatalog(initialQ);
    if (global) {
      const go = () => renderCatalog(global.value);
      globalBtn && globalBtn.addEventListener('click', go);
      global.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      if (initialQ) renderCatalog(initialQ);
    }
  }

  $$('[data-filter]').forEach(wrapper => {
    const input = $('.page-filter', wrapper) || $('.page-filter');
    const clear = $('.filter-clear', wrapper) || $('.filter-clear');
    if (!input) return;
    const cards = $$('.movie-card', wrapper.closest('.section') || document);
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.classList.toggle('filter-hidden', q && !text.includes(q));
      });
    };
    input.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', () => { input.value=''; apply(); });
  });

  const heroSlides = $$('.hero-slide');
  const dotsWrap = $('.hero-dots');
  const prev = $('.hero-prev');
  const next = $('.hero-next');
  if (heroSlides.length && dotsWrap) {
    let idx = heroSlides.findIndex(s => s.classList.contains('active'));
    if (idx < 0) idx = 0;
    const dots = heroSlides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      dotsWrap.appendChild(b);
      return b;
    });
    function show(i) {
      idx = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((s, j) => s.classList.toggle('active', j === idx));
      dots.forEach((d, j) => d.classList.toggle('active', j === idx));
    }
    prev && prev.addEventListener('click', () => show(idx - 1));
    next && next.addEventListener('click', () => show(idx + 1));
    show(idx);
    let timer = setInterval(() => show(idx + 1), 5200);
    const shell = $('.hero-shell');
    if (shell) {
      shell.addEventListener('mouseenter', () => clearInterval(timer));
      shell.addEventListener('mouseleave', () => timer = setInterval(() => show(idx + 1), 5200));
    }
  }

  const video = $('.js-player');
  if (video) {
    const url = video.dataset.hls;
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }
  }
})();
