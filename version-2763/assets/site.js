(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showSlide(target) {
    if (!slides.length) {
      return;
    }
    index = (target + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(index - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      resetHero();
    });
  });

  showSlide(0);
  startHero();

  var liveSearch = document.querySelector('[data-live-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var empty = document.querySelector('[data-empty-result]');

  function filterCards(value) {
    var term = String(value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
      var matched = !term || haystack.indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (liveSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      liveSearch.value = query;
    }
    liveSearch.addEventListener('input', function () {
      filterCards(liveSearch.value);
    });
    filterCards(liveSearch.value);
  }
})();
