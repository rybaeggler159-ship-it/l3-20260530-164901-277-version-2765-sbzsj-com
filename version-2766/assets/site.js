(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.cover-image').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      if (slides.length <= 1) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  });

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var panel = input.closest('.section-shell') || document;
    var clearButton = panel.querySelector('[data-search-clear]');
    var emptyState = panel.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-card]'));

    function update() {
      var query = normalizeText(input.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalizeText(card.getAttribute('data-title')) + ' ' + normalizeText(card.textContent);
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-filtered', !matched);
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    input.addEventListener('input', update);

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        input.value = '';
        input.focus();
        update();
      });
    }
  });

  function playVideo(video, overlay) {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-source');

    if (!source) {
      return;
    }

    if (video.getAttribute('data-bound-source') !== source) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        if (video.hlsInstance) {
          video.hlsInstance.destroy();
        }

        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        video.hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-bound-source', source);
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }).catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    } else if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video[data-video-source]');
    var overlay = shell.querySelector('[data-play-button]');

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(video, overlay);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(video, overlay);
        }
      });
    }
  });
})();
