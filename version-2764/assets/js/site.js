(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initImageFallbacks() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
                image.setAttribute('aria-hidden', 'true');
            }, { once: true });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5500);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function getCardValue(card, key) {
        if (key === 'title') {
            return (card.dataset.title || '').toLowerCase();
        }
        return Number(card.dataset[key] || 0);
    }

    function initFilteringAndSorting() {
        document.querySelectorAll('[data-toolbar]').forEach(function (toolbar) {
            var list = toolbar.parentElement.querySelector('[data-card-list]');
            if (!list) {
                return;
            }
            var input = toolbar.querySelector('[data-filter-input]');
            var select = toolbar.querySelector('[data-sort-select]');

            function applyFilter() {
                var term = input ? input.value.trim().toLowerCase() : '';
                Array.prototype.slice.call(list.querySelectorAll('[data-card]')).forEach(function (card) {
                    var title = (card.dataset.title || '').toLowerCase();
                    var year = String(card.dataset.year || '');
                    var category = (card.dataset.category || '').toLowerCase();
                    var text = card.textContent.toLowerCase();
                    var matched = !term || title.indexOf(term) !== -1 || year.indexOf(term) !== -1 || category.indexOf(term) !== -1 || text.indexOf(term) !== -1;
                    card.classList.toggle('is-hidden', !matched);
                });
            }

            function applySort() {
                if (!select) {
                    return;
                }
                var value = select.value;
                var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
                cards.sort(function (a, b) {
                    if (value === 'views-desc') {
                        return getCardValue(b, 'views') - getCardValue(a, 'views');
                    }
                    if (value === 'rating-desc') {
                        return getCardValue(b, 'rating') - getCardValue(a, 'rating');
                    }
                    if (value === 'title-asc') {
                        return getCardValue(a, 'title').localeCompare(getCardValue(b, 'title'), 'zh-CN');
                    }
                    return getCardValue(b, 'year') - getCardValue(a, 'year');
                });
                cards.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            if (select) {
                select.addEventListener('change', function () {
                    applySort();
                    applyFilter();
                });
            }
            applySort();
            applyFilter();
        });
    }

    function setupVideo(video, hlsSrc, mp4Src) {
        if (!video) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(hlsSrc);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function () {
                if (mp4Src) {
                    video.src = mp4Src;
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsSrc;
        } else if (mp4Src) {
            video.src = mp4Src;
        }
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var hlsSrc = player.dataset.hlsSrc;
            var mp4Src = player.dataset.mp4Src;
            var initialized = false;

            function startPlayback() {
                if (!initialized) {
                    setupVideo(video, hlsSrc, mp4Src);
                    initialized = true;
                }
                player.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        video.setAttribute('controls', 'controls');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', startPlayback);
            }
        });
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-card__cover" href="' + movie.url + '" aria-label="观看' + movie.title + '">',
            '        <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
            '        <span class="image-fallback">' + movie.title + '</span>',
            '        <span class="movie-card__play">▶</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <div class="movie-card__meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
            '        <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
            '        <p>' + movie.one_line + '</p>',
            '        <div class="tag-row"><span>' + movie.category_name + '</span><span>' + movie.genre + '</span></div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function initSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var title = document.querySelector('[data-search-title]');
        var index = window.MOVIES_INDEX || [];
        if (!form || !input || !results) {
            return;
        }

        function render(query) {
            var term = (query || '').trim().toLowerCase();
            if (!term) {
                results.innerHTML = index.slice(0, 24).map(createSearchCard).join('\n');
                if (title) {
                    title.textContent = '推荐浏览';
                }
                initImageFallbacks();
                return;
            }
            var matched = index.filter(function (movie) {
                return movie.search_text.indexOf(term) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(createSearchCard).join('\n');
            if (title) {
                title.textContent = '共找到 ' + matched.length + ' 条相关结果';
            }
            initImageFallbacks();
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;
        render(initialQuery);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState({}, '', url);
            render(query);
        });

        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    ready(function () {
        initMenu();
        initImageFallbacks();
        initHero();
        initFilteringAndSorting();
        initPlayers();
        initSearchPage();
    });
})();
