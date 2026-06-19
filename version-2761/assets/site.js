
(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('mainNav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dots button'));
    if (slides.length > 1) {
        let active = 0;
        const show = function (index) {
            active = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        setInterval(function () {
            show((active + 1) % slides.length);
        }, 5200);
    }

    const form = document.querySelector('[data-search-form]');
    if (form) {
        const input = form.querySelector('[name="q"]');
        const year = form.querySelector('[name="year"]');
        const type = form.querySelector('[name="type"]');
        const cards = Array.from(document.querySelectorAll('[data-title]'));
        const apply = function () {
            const q = (input.value || '').trim().toLowerCase();
            const y = year.value || '';
            const t = type.value || '';
            cards.forEach(function (card) {
                const text = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year
                ].join(' ').toLowerCase();
                const okQ = !q || text.indexOf(q) !== -1;
                const okY = !y || card.dataset.year === y;
                const okT = !t || card.dataset.type === t;
                card.classList.toggle('hidden-by-filter', !(okQ && okY && okT));
            });
        };
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });
        [input, year, type].forEach(function (el) {
            el.addEventListener('input', apply);
            el.addEventListener('change', apply);
        });
    }
})();
