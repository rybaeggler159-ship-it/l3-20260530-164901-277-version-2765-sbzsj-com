(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-hero]').forEach(function (button) {
        button.addEventListener('click', function () {
            var direction = button.getAttribute('data-hero');
            showSlide(direction === 'prev' ? current - 1 : current + 1);
            startHero();
        });
    });

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide')) || 0);
            startHero();
        });
    });

    startHero();

    var filterForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var genreSelect = document.querySelector('[data-genre-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('.empty-message');

    function filterCards() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var genre = genreSelect ? genreSelect.value : '';
        var shown = 0;

        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var region = (card.getAttribute('data-region') || '').toLowerCase();
            var cardGenre = card.getAttribute('data-genre') || '';
            var text = card.textContent.toLowerCase() + ' ' + title + ' ' + region;
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || cardYear.indexOf(year) !== -1;
            var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
            var visible = matchQuery && matchYear && matchGenre;

            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards();
        });
    }

    [searchInput, yearSelect, genreSelect].forEach(function (item) {
        if (item) {
            item.addEventListener('input', filterCards);
            item.addEventListener('change', filterCards);
        }
    });

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q');
        if (queryValue) {
            searchInput.value = queryValue;
            filterCards();
        }
    }
})();
