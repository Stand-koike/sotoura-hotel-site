(function () {
  "use strict";

  var AUTOPLAY_MS = 4500;

  function isDevRuntime() {
    return Boolean(document.querySelector('script[src*="load-sections.js"]'));
  }

  function initSlideshow(root) {
    var mainImg = root.querySelector("[data-slide-main]");
    if (!mainImg) {
      return;
    }

    var thumbs = Array.prototype.slice.call(
      root.querySelectorAll("[data-slide-thumb]")
    );
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-slide-dot]"));
    var sources = [];

    if (thumbs.length) {
      sources = thumbs
        .map(function (thumb) {
          return (
            thumb.getAttribute("data-src") ||
            (thumb.querySelector("img") && thumb.querySelector("img").src)
          );
        })
        .filter(Boolean);
    } else if (root.dataset.slides) {
      try {
        sources = JSON.parse(root.dataset.slides);
      } catch (e) {
        sources = [];
      }
    }

    if (!sources.length) {
      return;
    }

    var index = 0;
    var timer = null;
    var paused = false;

    function render() {
      mainImg.style.opacity = "0";
      window.setTimeout(function () {
        mainImg.src = sources[index];
        mainImg.style.opacity = "1";
      }, 180);

      thumbs.forEach(function (thumb, i) {
        var active = i === index;
        thumb.classList.toggle("is-active", active);
        thumb.style.border = active
          ? "2px solid #4A5D5B"
          : "2px solid transparent";
      });

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        dot.style.backgroundColor = active ? "#BFA170" : "#C8D0CC";
      });
    }

    function go(nextIndex) {
      index = (nextIndex + sources.length) % sources.length;
      render();
    }

    function next() {
      go(index + 1);
    }

    function start() {
      stop();
      if (paused || sources.length < 2) {
        return;
      }
      timer = window.setInterval(next, AUTOPLAY_MS);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        go(i);
        start();
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        go(i);
        start();
      });
    });

    root.addEventListener("mouseenter", function () {
      paused = true;
      stop();
    });

    root.addEventListener("mouseleave", function () {
      paused = false;
      start();
    });

    render();
    start();
  }

  function initAll() {
    document.querySelectorAll("[data-slideshow]").forEach(function (root) {
      if (root.dataset.slideshowReady === "true") {
        return;
      }
      root.dataset.slideshowReady = "true";
      initSlideshow(root);
    });
  }

  function bootstrap() {
    if (isDevRuntime()) {
      document.addEventListener("page:ready", initAll);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAll);
    } else {
      initAll();
    }
  }

  bootstrap();
})();
