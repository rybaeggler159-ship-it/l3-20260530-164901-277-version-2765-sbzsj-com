(function () {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('playerCover');
    var button = document.getElementById('playButton');
    var source = document.body.getAttribute('data-video-source');
    var hlsInstance = null;

    function loadVideo() {
        if (!video || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function start() {
        loadVideo();
        if (cover) {
            cover.style.display = 'none';
        }
        if (video) {
            video.play().catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
