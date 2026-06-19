(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
    forms.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
      var empty = scope.querySelector('[data-empty-search]');
      if (!input || cards.length === 0) {
        return;
      }
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = keyword === '' || text.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      });
    });
  }

  function attachHls(video, source) {
    if (!source) {
      return Promise.reject(new Error('empty source'));
    }
    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve, reject) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error(data.type || 'hls error'));
          }
        });
        video._hls = hls;
      });
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }
    video.src = source;
    return Promise.resolve();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('[data-player-cover]');
      var button = box.querySelector('[data-player-button]');
      var source = box.getAttribute('data-src');
      if (!video || !button) {
        return;
      }

      function play() {
        button.disabled = true;
        attachHls(video, source)
          .then(function () {
            if (cover) {
              cover.classList.add('hidden');
            }
            video.controls = true;
            return video.play();
          })
          .catch(function () {
            button.disabled = false;
            video.controls = true;
            if (source) {
              video.src = source;
              video.play().catch(function () {});
            }
          });
      }

      button.addEventListener('click', play);
      if (cover) {
        cover.addEventListener('click', function (event) {
          if (event.target !== button) {
            play();
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
