(function(){
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const searchInput = document.querySelector('[data-search-input]');
  const searchButton = document.querySelector('[data-search-button]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-title]'));

  function applyFilter() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const active = (filterButtons.find(b => b.classList.contains('active'))?.dataset.filter) || 'all';
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const genre = (card.dataset.genre || '').toLowerCase();
      const region = (card.dataset.region || '').toLowerCase();
      const year = (card.dataset.year || '').toLowerCase();
      const matchText = !q || title.includes(q) || genre.includes(q) || region.includes(q) || year.includes(q);
      const matchFilter = active === 'all' || genre.includes(active) || region.includes(active) || year === active;
      card.style.display = (matchText && matchFilter) ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFilter(); });
  }
  if (searchButton) searchButton.addEventListener('click', applyFilter);
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === index));
      dots.forEach((d, n) => d.classList.toggle('active', n === index));
    };
    const timer = setInterval(() => show(index + 1), 5000);
    prev?.addEventListener('click', () => { clearInterval(timer); show(index - 1); });
    next?.addEventListener('click', () => { clearInterval(timer); show(index + 1); });
    dots.forEach((dot, n) => dot.addEventListener('click', () => show(n)));
  }

  const video = document.querySelector('[data-player]');
  const sourceButtons = Array.from(document.querySelectorAll('[data-source]'));
  if (video && sourceButtons.length) {
    let hls = null;
    function setSource(url) {
      sourceButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.source === url));
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && Hls.isSupported()) {
        if (hls) { hls.destroy(); }
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    sourceButtons.forEach(btn => btn.addEventListener('click', () => setSource(btn.dataset.source)));
    setSource(sourceButtons[0].dataset.source);
  }
})();
