(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // Hero Content（Hero Sub / Catch / Actions）は対象外。背景 Ken Burns のみ。
  var SECTIONS = [
    {
      sel: '[data-pencil-name="Intro"]',
      items: [
        { name: "Intro Label", dir: "fade" },
        { name: "Intro Heading", dir: "left" },
        { name: "Intro Body", dir: "up", lines: true },
        { name: "Intro Image", dir: "right" },
      ],
    },
    {
      sel: '[data-pencil-name="迎える人"]',
      items: [
        { name: "Host En", dir: "fade" },
        { name: "Host Main Photo", dir: "left" },
        { name: "Host Heading", dir: "right" },
        { name: "Host Quote", dir: "right" },
        { name: "Host Role", dir: "right" },
        { name: "Host Help List", dir: "right", child: '[data-pencil-name^="Help "]' },
        { name: "Host Phone CTA", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="料理"]',
      items: [
        { name: "Cuisine En", dir: "fade" },
        { name: "Cuisine Heading", dir: "left" },
        { name: "Cuisine Body", dir: "up", lines: true },
        { name: "Cuisine CTA", dir: "up" },
        { name: "Cuisine Hero Img", dir: "right" },
      ],
    },
    {
      sel: '[data-pencil-name="間奏 — 食卓から湯へ"]',
      kenBurns: true,
      items: [
        { name: "Bridge En", dir: "fade" },
        { name: "Bridge Ja", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="温泉と客室"]',
      items: [
        { name: "Stay En Label", dir: "fade" },
        { name: "Stay Heading", dir: "up" },
        { name: "Onsen Block", dir: "up" },
        { name: "Rooms Block", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="お知らせ"]',
      items: [
        { name: "News En", dir: "fade" },
        { name: "News Ja", dir: "up" },
        { name: "News Grid", dir: "up", child: '[data-pencil-name^="News 20"]' },
        { name: "News More", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="ご不安への答え"]',
      items: [
        { name: "Anxiety En", dir: "fade" },
        { name: "Anxiety Ja", dir: "up" },
        {
          name: "Anxiety Grid",
          dir: "up",
          child: '[data-pencil-name^="FAQ "]:not([data-pencil-name*="Row"])',
        },
        { name: "Anxiety CTA", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="アクセス"]',
      items: [
        { name: "Access Map", dir: "left" },
        { name: "Access En", dir: "right" },
        { name: "Access Heading", dir: "right" },
        { name: "Access Addr", dir: "right" },
        { name: "Access Text", dir: "right", child: '[data-pencil-name="Access Line"]' },
        { name: "Access CTA", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="最終CTA"]',
      kenBurns: true,
      items: [
        { name: "Final Heading", dir: "up" },
        { name: "Final Body", dir: "up", lines: true },
        { name: "Final Actions", dir: "up" },
      ],
    },
    {
      sel: '[data-pencil-name="Footer"]',
      items: [
        { name: "Footer Main", dir: "up" },
        { name: "Footer Bottom", dir: "fade" },
      ],
    },
  ];

  function q(name, root) {
    return (root || document).querySelector('[data-pencil-name="' + name + '"]');
  }

  function splitLines(el, dir) {
    if (!el || el.dataset.luxSplit) {
      return [];
    }
    var html = el.innerHTML;
    if (!/<br\s*\/?>/i.test(html)) {
      return [el];
    }

    el.dataset.luxSplit = "1";
    var parts = html.split(/<br\s*\/?>/i).filter(function (p) {
      return p.trim();
    });

    el.innerHTML = parts
      .map(function (part) {
        return (
          '<span class="lux-item" data-lux-dir="' +
          dir +
          '" style="display:block">' +
          part.trim() +
          "</span>"
        );
      })
      .join("");

    return Array.prototype.slice.call(el.querySelectorAll(".lux-item"));
  }

  function collectItems(section, cfg) {
    var list = [];

    cfg.items.forEach(function (item) {
      if (item.child) {
        var parent = q(item.name, section);
        if (!parent) {
          return;
        }
        parent.querySelectorAll(item.child).forEach(function (node) {
          node.setAttribute("data-lux-dir", item.dir);
          list.push(node);
        });
        return;
      }

      var el = q(item.name, section);
      if (!el) {
        return;
      }

      if (item.lines) {
        list = list.concat(splitLines(el, item.dir));
        return;
      }

      el.setAttribute("data-lux-dir", item.dir);
      list.push(el);
    });

    return list;
  }

  function prepareSection(cfg) {
    var section = document.querySelector(cfg.sel);
    if (!section) {
      return null;
    }

    section.classList.add("lux-section");
    if (cfg.kenBurns) {
      section.classList.add("lux-ken-burns");
      section.style.backgroundSize = "";
    }

    var items = collectItems(section, cfg);
    items.forEach(function (el, i) {
      el.classList.add("lux-item");
      if (!el.getAttribute("data-lux-dir")) {
        el.setAttribute("data-lux-dir", "up");
      }
      el.style.setProperty("--lux-i", String(i));
    });

    return { section: section, items: items };
  }

  function revealSection(section) {
    if (section.classList.contains("lux-inview")) {
      return;
    }
    section.classList.add("lux-inview");
  }

  function initLuxuryReveal() {
    document
      .querySelectorAll(
        '[data-pencil-name="News Img"], [data-pencil-name="Onsen Img"], [data-pencil-name="Rooms Img"]'
      )
      .forEach(function (el) {
        el.classList.add("lux-image-hover");
      });

    var heroSection = document.querySelector('[data-pencil-name="Hero"]');
    if (heroSection) {
      heroSection.classList.add("lux-ken-burns");
      // Ken Burns が background-size を制御できるよう、cover 指定を外す
      heroSection.style.backgroundSize = "";
    }

    var prepared = SECTIONS.map(prepareSection).filter(Boolean);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      prepared.forEach(function (entry) {
        revealSection(entry.section);
      });
      return;
    }

    prepared.forEach(function (entry) {
      if (!("IntersectionObserver" in window)) {
        revealSection(entry.section);
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) {
              return;
            }
            revealSection(e.target);
            observer.unobserve(e.target);
          });
        },
        { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.08 }
      );

      observer.observe(entry.section);
    });
  }

  function isDevRuntime() {
    return Boolean(document.querySelector('script[src*="load-sections.js"]'));
  }

  if (isDevRuntime()) {
    document.addEventListener("page:ready", initLuxuryReveal);
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLuxuryReveal);
  } else {
    initLuxuryReveal();
  }
})();
