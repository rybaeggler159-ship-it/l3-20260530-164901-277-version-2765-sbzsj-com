(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.getElementById('mobileNav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.hidden = expanded;
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilterScopes() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var activeToken = '';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var byQuery = !query || text.indexOf(query) !== -1;
          var byToken = !activeToken || text.indexOf(activeToken.toLowerCase()) !== -1;
          card.hidden = !(byQuery && byToken);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeToken = chip.getAttribute('data-filter-value') || '';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });
    });
  }

  function initPlayer() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-overlay');
      var message = box.querySelector('[data-player-message]');
      var stream = box.getAttribute('data-stream');
      var controller = null;

      if (!video || !stream) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('is-visible');
      }

      function attach() {
        if (controller || video.getAttribute('src')) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          controller = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          controller.loadSource(stream);
          controller.attachMedia(video);
          controller.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              controller.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              controller.recoverMediaError();
            } else {
              showMessage('播放暂时中断，请稍后重试');
            }
          });
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        box.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }

      attach();
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime <= 0) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '<div class="poster ratio-standard">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="rating">★ ' + escapeHtml(item.rating) + '</span>',
      '<span class="duration">' + escapeHtml(item.duration) + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p class="meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</p>',
      '<p class="desc line-2">' + escapeHtml(item.desc) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var form = root.querySelector('[data-search-form]');
    var input = root.querySelector('input[name="q"]');
    var state = root.querySelector('[data-search-state]');
    var results = root.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
      input.value = initial;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var list = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        if (!query) {
          return true;
        }
        return item.search.indexOf(query) !== -1;
      });
      if (!query) {
        list = list.slice(0, 60);
      }
      if (state) {
        state.textContent = query ? '搜索结果已更新。' : '精选内容已展示，可继续输入关键词。';
      }
      if (results) {
        results.innerHTML = list.map(cardTemplate).join('');
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
        var query = input ? input.value.trim() : '';
        var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', url);
      });
    }
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilterScopes();
    initPlayer();
    initSearchPage();
  });
})();
