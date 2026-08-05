const LUXURY = {
  duration: 1.1,
  durationSlow: 1.2,
  y: 24,
  stagger: 0.12,
  ease: "power2.out",
  start: "top 85%",
};

const STAGGER_GRID_SELECTOR = [
  '[data-pencil-name="News Grid"]',
  '[data-pencil-name="Anxiety Grid"]',
  '[data-pencil-name="Room Row"]',
  '[data-pencil-name="Bath Row"]',
  '[data-pencil-name="Featured Activities"]',
  '[data-pencil-name="Food Gallery"]',
].join(", ");

let animationsInitialized = false;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDevRuntime() {
  return Boolean(document.querySelector('script[src*="load-sections.js"]'));
}

function isHeroBlock(element) {
  if (!element) {
    return false;
  }

  if (element.querySelector('[data-animate="hero"]')) {
    return true;
  }

  if (element.matches('[data-pencil-name="Page Hero"]')) {
    return true;
  }

  return Boolean(element.querySelector('[data-pencil-name="Page Hero"]'));
}

function isStaggerGrid(element) {
  return element && element.matches(STAGGER_GRID_SELECTOR);
}

function fromReveal(targets, options = {}) {
  gsap.from(targets, {
    opacity: 0,
    y: LUXURY.y,
    duration: LUXURY.duration,
    ease: LUXURY.ease,
    ...options,
  });
}

function isTopLuxuryPage() {
  return document.body?.dataset.page === "top";
}

function isFaqPage() {
  return document.body?.dataset.page === "faq";
}

function initFaqPageAnimation() {
  // FAQ はアコーディオンで高さが変わるため、重いセクション fade は行わない。
  // Hero Content のみ短めに表示する。
  document.querySelectorAll('[data-pencil-name="Page Hero"]').forEach((hero) => {
    const content = hero.querySelector('[data-pencil-name="Hero Content"]');
    if (!content || content.children.length === 0) {
      return;
    }

    gsap.from(content.children, {
      opacity: 0,
      y: 16,
      duration: 0.7,
      stagger: 0.1,
      ease: LUXURY.ease,
    });
  });
}

function initTopHeaderOverlay() {
  const header = document.querySelector('[data-pencil-name="Header"]');
  if (!header) {
    return;
  }

  header.dataset.headerOverlay = "";
  const threshold = 48;

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > threshold);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initTopHeroAnimation() {
  const hero = document.querySelector('[data-animate="hero"]');
  if (!hero) {
    return;
  }

  gsap.from(hero.children, {
    opacity: 0,
    y: LUXURY.y,
    duration: LUXURY.durationSlow,
    stagger: 0.15,
    ease: LUXURY.ease,
  });
}

function initPageHeroAnimation() {
  document.querySelectorAll('[data-pencil-name="Page Hero"]').forEach((hero) => {
    const content = hero.querySelector('[data-pencil-name="Hero Content"]');
    if (!content || content.children.length === 0) {
      return;
    }

    gsap.from(content.children, {
      opacity: 0,
      y: LUXURY.y,
      duration: LUXURY.durationSlow,
      stagger: 0.15,
      ease: LUXURY.ease,
    });
  });
}

function initMainBlockReveal() {
  const blocks = document.querySelectorAll("main > div, main > section");

  blocks.forEach((block) => {
    if (isHeroBlock(block)) {
      return;
    }

    const staggerGrids = block.querySelectorAll(STAGGER_GRID_SELECTOR);

    if (staggerGrids.length > 0) {
      const others = Array.from(block.children).filter((child) => !isStaggerGrid(child));
      if (others.length > 0) {
        fromReveal(others, {
          scrollTrigger: {
            trigger: block,
            start: LUXURY.start,
          },
          stagger: LUXURY.stagger,
        });
      }
      return;
    }

    fromReveal(block, {
      scrollTrigger: {
        trigger: block,
        start: LUXURY.start,
      },
    });
  });
}

function initMarkedReveal() {
  const main = document.querySelector("main");

  gsap.utils.toArray('[data-animate="reveal"]').forEach((element) => {
    if (main && element.parentElement === main) {
      return;
    }

    if (element.closest('[data-pencil-name="Page Hero"]') || element.closest('[data-animate="hero"]')) {
      return;
    }

    if (element.closest(STAGGER_GRID_SELECTOR)) {
      return;
    }

    fromReveal(element, {
      scrollTrigger: {
        trigger: element,
        start: LUXURY.start,
      },
    });
  });
}

function initStaggerGroup(grid, items) {
  if (!items || items.length === 0) {
    return;
  }

  fromReveal(items, {
    scrollTrigger: {
      trigger: grid,
      start: LUXURY.start,
    },
    stagger: LUXURY.stagger,
  });
}

function initCardAnimation() {
  document.querySelectorAll(STAGGER_GRID_SELECTOR).forEach((grid) => {
    const markedCards = grid.querySelectorAll('[data-animate="card"]');
    if (markedCards.length > 0) {
      initStaggerGroup(grid, markedCards);
      return;
    }

    const children = Array.from(grid.children).filter((child) => child.nodeType === 1);
    initStaggerGroup(grid, children);
  });
}

function initLabelAnimation() {
  gsap.utils.toArray('[data-animate="label"]').forEach((label) => {
    gsap.from(label, {
      scrollTrigger: {
        trigger: label,
        start: LUXURY.start,
      },
      opacity: 0,
      scale: 0.98,
      duration: LUXURY.durationSlow,
      ease: LUXURY.ease,
    });
  });
}

function initAnimations() {
  if (animationsInitialized) {
    return;
  }

  if (prefersReducedMotion() || typeof gsap === "undefined") {
    return;
  }

  animationsInitialized = true;

  // TOP: Hero Content のみ GSAP。以降のセクションは luxury-reveal.js
  if (isTopLuxuryPage()) {
    initTopHeroAnimation();
    initTopHeaderOverlay();
    return;
  }

  // FAQ: セクション全体の遅い fade を止め、Hero のみ軽く動かす
  // （アコーディオン開閉で高さが変わり、ScrollTrigger と食い違うため）
  if (isFaqPage()) {
    initFaqPageAnimation();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  initTopHeroAnimation();
  initPageHeroAnimation();
  initMainBlockReveal();
  initMarkedReveal();
  initCardAnimation();
  initLabelAnimation();
}

function bootstrapAnimations() {
  if (isDevRuntime()) {
    document.addEventListener("page:ready", initAnimations);
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnimations);
  } else {
    initAnimations();
  }
}

bootstrapAnimations();
