(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
            startHero();
        });
    });

    showHero(0);
    startHero();

    const quickForm = document.querySelector('[data-quick-search]');
    if (quickForm) {
        quickForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = quickForm.querySelector('input');
            const query = input ? input.value.trim() : '';
            const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
            window.location.href = target;
        });
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const filterCards = Array.from(document.querySelectorAll('[data-filter-card]'));
    const emptyState = document.querySelector('[data-empty-state]');
    const filterButtons = Array.from(document.querySelectorAll('[data-category-filter]'));
    let activeCategory = 'all';

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
        if (!filterCards.length) {
            return;
        }
        const keyword = normalize(filterInput ? filterInput.value : '');
        let visible = 0;
        filterCards.forEach(function (card) {
            const haystack = normalize(card.getAttribute('data-search'));
            const category = card.getAttribute('data-category') || '';
            const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const matchCategory = activeCategory === 'all' || category === activeCategory;
            const show = matchKeyword && matchCategory;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeCategory = button.getAttribute('data-category-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilter();
        });
    });

    applyFilter();

    const video = document.querySelector('[data-stream]');
    if (video) {
        const src = video.getAttribute('data-stream');
        const playerButton = document.querySelector('[data-player-button]');
        const shell = document.querySelector('[data-player-shell]');
        let prepared = false;
        let engine = null;

        function prepareVideo() {
            if (prepared || !src) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                engine = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                engine.loadSource(src);
                engine.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            }
        }

        function playVideo() {
            prepareVideo();
            const result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (playerButton) {
            playerButton.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
        }

        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target !== video) {
                    playVideo();
                }
            });
        }

        video.addEventListener('play', function () {
            if (playerButton) {
                playerButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (playerButton && video.currentTime < 0.1) {
                playerButton.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (engine && typeof engine.destroy === 'function') {
                engine.destroy();
            }
        });

        prepareVideo();
    }
})();
