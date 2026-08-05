(function () {
  "use strict";

  var LIST_SELECTORS = [
    '[data-pencil-name="Stay List"]',
    '[data-pencil-name="Dine List"]',
    '[data-pencil-name="Other List"]',
  ];

  function collectItems() {
    var items = [];
    LIST_SELECTORS.forEach(function (sel) {
      var list = document.querySelector(sel);
      if (!list) {
        return;
      }
      Array.prototype.forEach.call(list.children, function (child) {
        if (child.nodeType !== 1) {
          return;
        }
        var name = child.getAttribute("data-pencil-name") || "";
        if (name.indexOf("FAQ ") === 0) {
          items.push(child);
        }
      });
    });
    return items;
  }

  function enhanceItem(item) {
    item.classList.add("faq-acc-item");

    var qRow = item.querySelector('[data-pencil-name="Q Row"]');
    var icon = item.querySelector('[data-pencil-name="Icon"]');
    var answer = item.querySelector('[data-pencil-name="A"]');
    if (!qRow || !answer) {
      return null;
    }

    qRow.classList.add("faq-acc-item__q");
    qRow.setAttribute("role", "button");
    qRow.setAttribute("tabindex", "0");
    qRow.setAttribute("aria-expanded", "false");

    if (icon) {
      icon.classList.add("faq-acc-item__icon");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "＋";
    }

    answer.classList.add("faq-acc-item__a");
    if (!answer.querySelector(".faq-acc-item__a-inner")) {
      var inner = document.createElement("div");
      inner.className = "faq-acc-item__a-inner";
      while (answer.firstChild) {
        inner.appendChild(answer.firstChild);
      }
      answer.appendChild(inner);
    }

    return { item: item, qRow: qRow, icon: icon };
  }

  function closeItem(entry) {
    entry.item.classList.remove("is-open");
    entry.qRow.setAttribute("aria-expanded", "false");
    if (entry.icon) {
      entry.icon.textContent = "＋";
    }
  }

  function openItem(entry) {
    entry.item.classList.add("is-open");
    entry.qRow.setAttribute("aria-expanded", "true");
    if (entry.icon) {
      entry.icon.textContent = "−";
    }
  }

  function initFaqAccordion() {
    var rawItems = collectItems();
    if (!rawItems.length) {
      return;
    }

    var entries = rawItems.map(enhanceItem).filter(Boolean);

      entries.forEach(function (entry) {
      function toggle() {
        var isOpen = entry.item.classList.contains("is-open");
        entries.forEach(closeItem);
        if (!isOpen) {
          openItem(entry);
        }
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === "function") {
          window.ScrollTrigger.refresh();
        }
      }

      entry.qRow.addEventListener("click", toggle);
      entry.qRow.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });

    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === "function") {
      window.ScrollTrigger.refresh();
    }
  }

  function isDevRuntime() {
    return Boolean(document.querySelector('script[src*="load-sections.js"]'));
  }

  if (isDevRuntime()) {
    document.addEventListener("page:ready", initFaqAccordion);
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFaqAccordion);
  } else {
    initFaqAccordion();
  }
})();
