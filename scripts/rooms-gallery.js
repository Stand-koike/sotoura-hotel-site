(function () {
  "use strict";

  var AUTOPLAY_MS = 4500;

  var lightboxState = {
    images: [],
    index: 0,
    label: "",
    onChange: null,
  };

  function isDevRuntime() {
    return Boolean(document.querySelector('script[src*="load-sections.js"]'));
  }

  function openLightbox(images, index, label, onChange) {
    var lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox || !images.length) {
      return;
    }

    lightboxState.images = images;
    lightboxState.index = index;
    lightboxState.label = label || "";
    lightboxState.onChange = onChange || null;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("warm-lightbox-open");
    renderLightbox();

    var closeBtn = lightbox.querySelector("[data-lightbox-close]");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeLightbox() {
    var lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox) {
      return;
    }
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("warm-lightbox-open");
  }

  function renderLightbox() {
    var lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox) {
      return;
    }

    var img = lightbox.querySelector("[data-lightbox-img]");
    var caption = lightbox.querySelector("[data-lightbox-caption]");
    var images = lightboxState.images;
    var i = lightboxState.index;

    if (img) {
      img.src = images[i];
      img.alt = lightboxState.label;
    }

    if (caption) {
      caption.textContent =
        lightboxState.label + " — " + (i + 1) + " / " + images.length;
    }

    if (typeof lightboxState.onChange === "function") {
      lightboxState.onChange(i);
    }
  }

  function initLightbox() {
    var lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox || lightbox.dataset.lightboxReady === "true") {
      return;
    }
    lightbox.dataset.lightboxReady = "true";

    var closeBtn = lightbox.querySelector("[data-lightbox-close]");
    var prevBtn = lightbox.querySelector("[data-lightbox-prev]");
    var nextBtn = lightbox.querySelector("[data-lightbox-next]");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        var len = lightboxState.images.length;
        lightboxState.index = (lightboxState.index - 1 + len) % len;
        renderLightbox();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var len = lightboxState.images.length;
        lightboxState.index = (lightboxState.index + 1) % len;
        renderLightbox();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) {
        return;
      }
      if (e.key === "Escape") {
        closeLightbox();
      }
      if (e.key === "ArrowLeft") {
        var lenL = lightboxState.images.length;
        lightboxState.index = (lightboxState.index - 1 + lenL) % lenL;
        renderLightbox();
      }
      if (e.key === "ArrowRight") {
        var lenR = lightboxState.images.length;
        lightboxState.index = (lightboxState.index + 1) % lenR;
        renderLightbox();
      }
    });
  }

  function initRoomPanel(panel) {
    var dataEl = panel.querySelector("[data-room-data]");
    if (!dataEl) {
      return;
    }

    var roomData;
    try {
      roomData = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    var typeBtns = Array.prototype.slice.call(
      panel.querySelectorAll("[data-room-type]")
    );
    var islandWrap = panel.querySelector("[data-island-tabs]");
    var islandNote = panel.querySelector("[data-island-note]");
    var mainBtn = panel.querySelector("[data-gallery-main]");
    var mainImg = mainBtn && mainBtn.querySelector("img");
    var thumbsWrap = panel.querySelector("[data-gallery-thumbs]");
    var dotsWrap = panel.querySelector("[data-gallery-dots]");
    var prevBtn = panel.querySelector("[data-gallery-prev]");
    var nextBtn = panel.querySelector("[data-gallery-next]");
    var enEl = panel.querySelector("[data-room-en]");
    var titleEl = panel.querySelector("[data-room-title]");
    var leadEl = panel.querySelector("[data-room-lead]");
    var specsEl = panel.querySelector("[data-room-specs]");
    var noteEl = panel.querySelector("[data-room-note]");
    var lightbox = document.querySelector("[data-lightbox]");

    var typeKey = typeBtns.length
      ? typeBtns[0].getAttribute("data-room-type")
      : Object.keys(roomData)[0];
    var roomIndex = 0;
    var imageIndex = 0;
    var timer = null;
    var paused = false;

    function currentType() {
      return roomData[typeKey];
    }

    function currentRoom() {
      return currentType().rooms[roomIndex];
    }

    function currentImages() {
      return currentRoom().images;
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (paused || currentImages().length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        goImage(imageIndex + 1);
      }, AUTOPLAY_MS);
    }

    function setTypeButtonStyles() {
      typeBtns.forEach(function (btn) {
        var active = btn.getAttribute("data-room-type") === typeKey;
        btn.classList.toggle("is-active", active);
        if (active) {
          btn.style.backgroundColor = "#4A5D5B";
          btn.style.color = "#FFFFFF";
        } else {
          btn.style.backgroundColor = "#E8EEEA";
          btn.style.color = "#4A5D5B";
        }
      });
    }

    function renderIslandTabs() {
      if (!islandWrap) {
        return;
      }
      var rooms = currentType().rooms;
      islandWrap.innerHTML = "";
      rooms.forEach(function (room, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "rooms-island-tab text-[15px]/[normal] box-border font-['Shippori_Mincho',system-ui,sans-serif] text-left [white-space:nowrap] bg-transparent border-0 p-0 cursor-pointer" +
          (i === roomIndex ? " is-active" : "");
        btn.style.color = i === roomIndex ? "#2E3334" : "#4A5456";
        btn.style.fontWeight = i === roomIndex ? "500" : "400";
        btn.textContent = room.tab;
        btn.setAttribute("data-island-index", String(i));
        btn.addEventListener("click", function () {
          roomIndex = i;
          imageIndex = 0;
          renderAll();
          start();
        });
        islandWrap.appendChild(btn);
      });
      if (islandNote) {
        islandNote.textContent = currentType().tabNote || "";
      }
    }

    function renderThumbsAndDots() {
      var images = currentImages();
      if (thumbsWrap) {
        thumbsWrap.innerHTML = "";
        images.forEach(function (src, i) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className =
            "rooms-gallery__thumb box-border w-[120px] shrink-0 h-[80px] overflow-hidden p-0 cursor-pointer bg-transparent" +
            (i === imageIndex ? " is-active" : "");
          btn.style.border =
            i === imageIndex ? "2px solid #4A5D5B" : "2px solid transparent";
          btn.setAttribute("aria-label", "写真" + (i + 1));
          var img = document.createElement("img");
          img.src = src;
          img.alt = "";
          img.width = 120;
          img.height = 80;
          img.className = "rooms-gallery__thumb-img";
          btn.appendChild(img);
          btn.addEventListener("click", function () {
            goImage(i);
            start();
          });
          thumbsWrap.appendChild(btn);
        });
      }
      if (dotsWrap) {
        dotsWrap.innerHTML = "";
        images.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className =
            "rooms-gallery__dot box-border w-[6px] shrink-0 h-[6px] rounded-full p-0 border-0 cursor-pointer" +
            (i === imageIndex ? " is-active" : "");
          dot.style.backgroundColor = i === imageIndex ? "#BFA170" : "#C8D0CC";
          dot.setAttribute("aria-label", "スライド" + (i + 1));
          dot.addEventListener("click", function () {
            goImage(i);
            start();
          });
          dotsWrap.appendChild(dot);
        });
      }
    }

    function renderText() {
      var room = currentRoom();
      if (enEl) {
        enEl.textContent = room.en;
      }
      if (titleEl) {
        titleEl.textContent = room.title;
      }
      if (leadEl) {
        leadEl.textContent = room.lead;
      }
      if (specsEl) {
        specsEl.innerHTML = "";
        (room.specs || []).forEach(function (line) {
          var row = document.createElement("div");
          row.className =
            "text-[13px]/[21px] box-border text-[#2E3334] font-['Shippori_Mincho',system-ui,sans-serif] font-normal text-left [white-space:nowrap]";
          row.textContent = line;
          specsEl.appendChild(row);
        });
      }
      if (noteEl) {
        noteEl.textContent = currentType().note || "";
      }
    }

    function renderImage() {
      var images = currentImages();
      if (!mainImg || !images.length) {
        return;
      }
      mainImg.style.opacity = "0";
      window.setTimeout(function () {
        mainImg.src = images[imageIndex];
        mainImg.alt = currentRoom().tab;
        mainImg.style.opacity = "1";
      }, 160);

      if (thumbsWrap) {
        Array.prototype.forEach.call(thumbsWrap.children, function (el, i) {
          var active = i === imageIndex;
          el.classList.toggle("is-active", active);
          el.style.border = active
            ? "2px solid #4A5D5B"
            : "2px solid transparent";
        });
      }
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (el, i) {
          var active = i === imageIndex;
          el.classList.toggle("is-active", active);
          el.style.backgroundColor = active ? "#BFA170" : "#C8D0CC";
        });
      }
    }

    function goImage(i) {
      var len = currentImages().length;
      if (!len) {
        return;
      }
      imageIndex = (i + len) % len;
      renderImage();
    }

    function renderAll() {
      setTypeButtonStyles();
      renderIslandTabs();
      renderThumbsAndDots();
      renderText();
      renderImage();
    }

    typeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        typeKey = btn.getAttribute("data-room-type");
        roomIndex = 0;
        imageIndex = 0;
        renderAll();
        start();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goImage(imageIndex - 1);
        start();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goImage(imageIndex + 1);
        start();
      });
    }

    var galleryRoot = panel.querySelector(".rooms-gallery");
    if (galleryRoot) {
      galleryRoot.addEventListener("mouseenter", function () {
        paused = true;
        stop();
      });
      galleryRoot.addEventListener("mouseleave", function () {
        paused = false;
        start();
      });
    }

    if (mainBtn && lightbox) {
      mainBtn.addEventListener("click", function () {
        openLightbox(currentImages(), imageIndex, currentRoom().tab, function (i) {
          imageIndex = i;
          renderImage();
        });
      });
    }

    document.querySelectorAll("[data-jump-type]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        typeKey = el.getAttribute("data-jump-type");
        roomIndex = 0;
        imageIndex = 0;
        renderAll();
        start();
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    renderAll();
    start();
  }

  function initAll() {
    initLightbox();
    document.querySelectorAll("[data-room-panel]").forEach(function (panel) {
      if (panel.dataset.roomPanelReady === "true") {
        return;
      }
      panel.dataset.roomPanelReady = "true";
      initRoomPanel(panel);
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
