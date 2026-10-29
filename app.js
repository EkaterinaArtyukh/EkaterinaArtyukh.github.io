"use strict";
const translations = window.siteTranslations;

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open
      ? translations[document.documentElement.lang]?.menuClose || "Закрити меню"
      : translations[document.documentElement.lang]?.menuOpen ||
          "Відкрити меню",
  );
  mobileNav.classList.toggle("open", open);
  mobileNav.inert = !open;
  document.body.classList.toggle("menu-open", open);
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
mobileNav
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 1050) setMenu(false);
});
function setLanguage(lang) {
  const t = translations[lang];
  if (!t) return;
  document.documentElement.lang = lang;
  const menuToggle = document.querySelector(".menu-toggle");
  if (menuToggle)
    menuToggle.setAttribute(
      "aria-label",
      menuToggle.getAttribute("aria-expanded") === "true"
        ? t.menuClose
        : t.menuOpen,
    );
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!Object.prototype.hasOwnProperty.call(t, key)) return;
    if (key === "title" || key === "aboutSubtitle" || key === "aboutDetailsWork" || key === "aboutDetailsGeography") el.innerHTML = t[key];
    else el.textContent = t[key];
  });

  document
    .querySelectorAll(
      "[data-i18n-aria-label], [data-i18n-title], [data-i18n-alt], [data-i18n-content]",
    )
    .forEach((el) => {
      for (const attr of ["aria-label", "title", "alt", "content"]) {
        const key = el.getAttribute("data-i18n-" + attr);
        if (key && Object.prototype.hasOwnProperty.call(t, key))
          el.setAttribute(attr, t[key]);
      }
    });
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  document.title =
    "Ekaterina Artyukh — " +
    (lang === "uk"
      ? "Стратегічна логістика та консалтинг"
      : lang === "en"
        ? "Strategic Logistics & Consulting"
        : "Strategische Logistik & Beratung");
}
setLanguage(document.documentElement.lang);
document
  .querySelectorAll("[data-lang]")
  .forEach((btn) =>
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang)),
  );



(() => {
  const carousels = document.querySelectorAll(
    "#benefitsCarousel, #trainingBenefitsCarousel",
  );

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".benefits-track");
    if (!track) return;

    const originals = [...track.children];
    if (!originals.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("id");
      track.appendChild(clone);
    });

    let position = 0;
    let cycleWidth = 0;
    let lastTime = 0;
    let dragging = false;
    let pointerStart = 0;
    let positionStart = 0;
    let paused = false;
    let resumeAt = 0;

    const speed = 32;

    function normalize(value) {
      if (!cycleWidth) return 0;
      return ((value % cycleWidth) + cycleWidth) % cycleWidth;
    }

    function render() {
      track.style.transform = `translate3d(${-normalize(position)}px, 0, 0)`;
    }

    function measure() {
      const previousWidth = cycleWidth;

      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap) || 0;

      cycleWidth = originals.reduce(
        (total, item) => total + item.getBoundingClientRect().width + gap,
        0,
      );

      if (previousWidth > 0) {
        position = (position / previousWidth) * cycleWidth;
      }

      render();
    }

    function animate(time) {
      if (!lastTime) lastTime = time;

      const delta = Math.min((time - lastTime) / 1000, 0.05);

      lastTime = time;

      if (
        !dragging &&
        !paused &&
        time >= resumeAt &&
        !reduceMotion.matches &&
        !document.hidden
      ) {
        position = normalize(position + speed * delta);
        render();
      }

      requestAnimationFrame(animate);
    }

    carousel.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      dragging = true;
      pointerStart = event.clientX;
      positionStart = position;

      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(event.pointerId);
    });

    carousel.addEventListener("pointermove", (event) => {
      if (!dragging) return;

      position = normalize(positionStart - (event.clientX - pointerStart));

      render();
    });

    function endDrag() {
      if (!dragging) return;

      dragging = false;
      carousel.classList.remove("is-dragging");
      resumeAt = performance.now() + 1800;
    }

    carousel.addEventListener("pointerup", endDrag);
    carousel.addEventListener("pointercancel", endDrag);
    carousel.addEventListener("lostpointercapture", endDrag);

    carousel.addEventListener("mouseenter", () => {
      paused = true;
    });

    carousel.addEventListener("mouseleave", () => {
      paused = false;
    });

    carousel.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    window.addEventListener("resize", measure);

    measure();
    requestAnimationFrame(animate);
  });
})();


(() => {
  const section = document.querySelector(".about-section");
  if (!section) return;

  const targets = [
    section.querySelector(".about-visual"),
    section.querySelector(".about-title"),
    section.querySelector(".about-subtitle"),
    ...section.querySelectorAll(".about-text p"),
  ].filter(Boolean);

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  section.classList.add("about-motion-ready");
  targets.forEach((element, index) => {
    element.classList.add("about-reveal");
    element.style.setProperty("--about-delay", `${Math.min(index, 6) * 95}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("is-visible");
        observer.unobserve(target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -25px 0px" },
  );

  targets.forEach((element) => observer.observe(element));
})();



(() => {
  const section = document.querySelector(".quote-section");
  if (!section) return;

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  section.classList.add("quote-motion-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  observer.observe(section);
})();





(() => {
  const carousel = document.querySelector("#statsCarousel");
  if (!carousel) return;

  const track = carousel.querySelector(".stats-track");
  const originals = [...track.children];
  if (!originals.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let position = 0;
  let cycleWidth = 0;
  let lastTime = 0;

  let dragging = false;
  let pointerStart = 0;
  let positionStart = 0;
  let paused = false;
  let resumeAt = 0;

  const speed = 28;

  
  originals.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    track.appendChild(clone);
  });

  function normalize(value) {
    if (!cycleWidth) return 0;
    return ((value % cycleWidth) + cycleWidth) % cycleWidth;
  }

  function render() {
    track.style.transform = `translate3d(${-normalize(position)}px, 0, 0)`;
  }

  function measure() {
    const oldWidth = cycleWidth;

    cycleWidth = originals.reduce(
      (total, item) => total + item.getBoundingClientRect().width,
      0,
    );

    if (oldWidth > 0) {
      position = (position / oldWidth) * cycleWidth;
    }

    render();
  }

  function animate(time) {
    if (!lastTime) lastTime = time;

    const delta = Math.min((time - lastTime) / 1000, 0.05);

    lastTime = time;

    if (
      !dragging &&
      !paused &&
      time >= resumeAt &&
      !reduceMotion.matches &&
      !document.hidden
    ) {
      position = normalize(position + speed * delta);
      render();
    }

    requestAnimationFrame(animate);
  }

  

  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragging = true;
    pointerStart = event.clientX;
    positionStart = position;

    carousel.classList.add("is-dragging");
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    position = normalize(positionStart - (event.clientX - pointerStart));

    render();
  });

  function endDrag() {
    if (!dragging) return;

    dragging = false;
    carousel.classList.remove("is-dragging");

    resumeAt = performance.now() + 1800;
  }

  carousel.addEventListener("pointerup", endDrag);
  carousel.addEventListener("pointercancel", endDrag);
  carousel.addEventListener("lostpointercapture", endDrag);

  carousel.addEventListener("mouseenter", () => {
    paused = true;
  });

  carousel.addEventListener("mouseleave", () => {
    paused = false;
  });

  carousel.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  window.addEventListener("resize", measure);

  measure();
  requestAnimationFrame(animate);
})();





(() => {
  const section = document.querySelector(".expertise-section");
  const viewport = document.getElementById("expertiseCarousel");
  const modal = document.getElementById("expertiseModal");

  if (!section || !viewport || !modal) return;

  const cards = [...section.querySelectorAll(".expertise-card")];
  const prev = section.querySelector(".expertise-prev");
  const next = section.querySelector(".expertise-next");
  const counter = document.getElementById("expertiseCurrent");

  const modalTitle = document.getElementById("expertiseModalTitle");
  const modalIntro = document.getElementById("expertiseModalIntro");
  const modalList = document.getElementById("expertiseModalList");
  const closeButton = modal.querySelector(".expertise-modal-close");

  let activeIndex = 0;
  let lastFocus = null;

  const details = {
    uk: {
      international: [
        "Організація міжнародних перевезень автомобільним, авіаційним, морським та залізничним транспортом.",
        "Планування оптимальних маршрутів, термінів і логістичних витрат.",
        "Координація перевізників, партнерів та учасників ланцюга постачання.",
        "Оптимізація міжнародних логістичних процесів.",
      ],
      warehouse: [
        "Оптимізація складських операцій і внутрішніх процесів.",
        "Управління запасами, зберіганням та товарними потоками.",
        "Організація дистрибуції та підвищення швидкості виконання замовлень.",
        "Покращення прозорості та керованості складської логістики.",
      ],
      pharma: [
        "Організація перевезень фармацевтичної продукції.",
        "Планування температурно-контрольованих поставок.",
        "Управління холодовим ланцюгом.",
        "Врахування вимог GDP/GxP та контролю якості.",
      ],
      clinical: [
        "Міжнародна логістика для клінічних досліджень.",
        "Організація перевезень чутливих біологічних матеріалів.",
        "Температурний контроль і координація спеціалізованих поставок.",
        "Управління документацією, термінами та логістичними ризиками.",
      ],
      customs: [
        "Координація експортно-імпортних операцій.",
        "Підготовка та перевірка логістичної документації.",
        "Застосування правил Incoterms.",
        "Урахування митних процедур і регуляторних вимог.",
      ],
      dangerous: [
        "Планування спеціалізованих перевезень небезпечних вантажів.",
        "Координація відповідних перевізників.",
        "Організація необхідної транспортної документації.",
        "Урахування міжнародних вимог безпеки.",
      ],
      risks: [
        "Аналіз ризиків міжнародних ланцюгів постачання.",
        "Розроблення альтернативних маршрутів і сценаріїв.",
        "Планування безперервності логістичних операцій.",
        "Підготовка до кризових ситуацій та збоїв у постачанні.",
      ],
    },

    en: {
      international: [
        "International road, air, sea and rail transportation.",
        "Optimization of routes, delivery times and logistics costs.",
        "Coordination of carriers, partners and supply chain stakeholders.",
        "Improvement of international logistics operations.",
      ],
      warehouse: [
        "Optimization of warehouse operations and processes.",
        "Inventory, storage and goods flow management.",
        "Distribution planning and order fulfillment efficiency.",
        "Improved visibility and control of warehouse logistics.",
      ],
      pharma: [
        "Pharmaceutical transportation planning.",
        "Temperature-controlled shipments.",
        "Cold chain management.",
        "Consideration of GDP/GxP and quality requirements.",
      ],
      clinical: [
        "International logistics for clinical trials.",
        "Transportation of sensitive biological materials.",
        "Temperature control and specialized shipment coordination.",
        "Documentation, timeline and logistics risk management.",
      ],
      customs: [
        "Coordination of import and export operations.",
        "Preparation and review of logistics documentation.",
        "Application of Incoterms rules.",
        "Consideration of customs and regulatory requirements.",
      ],
      dangerous: [
        "Planning of specialized dangerous goods transportation.",
        "Coordination of qualified transport partners.",
        "Organization of relevant transport documentation.",
        "Consideration of international safety requirements.",
      ],
      risks: [
        "International supply chain risk assessment.",
        "Development of alternative routes and scenarios.",
        "Logistics business continuity planning.",
        "Preparation for disruptions and crisis situations.",
      ],
    },

    de: {
      international: [
        "Internationale Transporte per Straße, Luft, See und Schiene.",
        "Optimierung von Routen, Lieferzeiten und Logistikkosten.",
        "Koordination von Frachtführern und internationalen Partnern.",
        "Verbesserung internationaler Logistikprozesse.",
      ],
      warehouse: [
        "Optimierung von Lagerabläufen und Prozessen.",
        "Management von Beständen, Lagerung und Warenströmen.",
        "Distributionsplanung und effiziente Auftragsabwicklung.",
        "Mehr Transparenz und Kontrolle in der Lagerlogistik.",
      ],
      pharma: [
        "Planung pharmazeutischer Transporte.",
        "Temperaturgeführte Lieferungen.",
        "Management der Kühlkette.",
        "Berücksichtigung von GDP/GxP- und Qualitätsanforderungen.",
      ],
      clinical: [
        "Internationale Logistik für klinische Studien.",
        "Transport empfindlicher biologischer Materialien.",
        "Temperaturkontrolle und Koordination spezieller Lieferungen.",
        "Management von Dokumentation, Terminen und Risiken.",
      ],
      customs: [
        "Koordination von Import- und Exportprozessen.",
        "Vorbereitung und Prüfung logistischer Dokumentation.",
        "Anwendung der Incoterms-Regeln.",
        "Berücksichtigung von Zoll- und regulatorischen Anforderungen.",
      ],
      dangerous: [
        "Planung spezialisierter Gefahrguttransporte.",
        "Koordination geeigneter Transportpartner.",
        "Organisation relevanter Transportdokumentation.",
        "Berücksichtigung internationaler Sicherheitsvorschriften.",
      ],
      risks: [
        "Bewertung internationaler Lieferkettenrisiken.",
        "Entwicklung alternativer Routen und Szenarien.",
        "Planung der Kontinuität logistischer Abläufe.",
        "Vorbereitung auf Störungen und Krisensituationen.",
      ],
    },
  };

  function language() {
    const lang = (document.documentElement.lang || "uk")
      .toLowerCase()
      .split("-")[0];

    return details[lang] ? lang : "uk";
  }

  function updateCounter() {
    if (counter) {
      counter.textContent = String(activeIndex + 1).padStart(2, "0");
    }

    if (prev) prev.disabled = activeIndex === 0;
    if (next) next.disabled = activeIndex === cards.length - 1;
  }

  function goTo(index) {
    activeIndex = Math.max(0, Math.min(cards.length - 1, index));

    const card = cards[activeIndex];
    const first = cards[0];

    viewport.scrollTo({
      left: card.offsetLeft - first.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });

    updateCounter();
  }

  prev?.addEventListener("click", () => {
    goTo(activeIndex - 1);
  });

  next?.addEventListener("click", () => {
    goTo(activeIndex + 1);
  });

  let scrollFrame = 0;

  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(scrollFrame);

      scrollFrame = requestAnimationFrame(() => {
        const center =
          viewport.getBoundingClientRect().left + viewport.clientWidth / 2;

        let closest = 0;
        let distance = Infinity;

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const delta = Math.abs(center - cardCenter);

          if (delta < distance) {
            distance = delta;
            closest = index;
          }
        });

        activeIndex = closest;
        updateCounter();
      });
    },
    { passive: true },
  );

  function openModal(key, trigger) {
    const card = cards.find((item) => item.dataset.expertise === key);

    if (!card) return;

    lastFocus = trigger;

    modalTitle.textContent = card.querySelector("h3")?.textContent.trim() || "";

    modalIntro.textContent =
      card.querySelector(".expertise-card-body p")?.textContent.trim() || "";

    modalList.replaceChildren();

    const items = details[language()][key] || [];

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      modalList.appendChild(li);
    });

    modal.inert = false;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");

    document.body.classList.add("expertise-modal-open");
    closeButton?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;

    document.body.classList.remove("expertise-modal-open");
    lastFocus?.focus();
  }

  section.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-expertise]");

    if (!trigger) return;

    openModal(trigger.dataset.openExpertise, trigger);
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-expertise]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [
      ...modal.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => element.getClientRects().length);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  updateCounter();
})();


(() => {
  const accordion = document.getElementById("trainingAccordion");
  if (!accordion) return;
  const items = [...accordion.querySelectorAll(".training-item")];
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();


(() => {
  const section = document.getElementById("services");
  const viewport = document.getElementById("consultingCarousel");
  const modal = document.getElementById("consultingModal");
  if (!section || !viewport || !modal) return;

  const cards = [
    ...section.querySelectorAll(".expertise-card[data-consulting]"),
  ];
  const prev = section.querySelector(".expertise-prev");
  const next = section.querySelector(".expertise-next");
  const counter = document.getElementById("consultingCurrent");
  const modalTitle = document.getElementById("consultingModalTitle");
  const modalIntro = document.getElementById("consultingModalIntro");
  const modalDetails = document.getElementById("consultingModalDetails");
  const modalCTA = document.getElementById("consultingModalCTA");
  const closeButton = modal.querySelector(".expertise-modal-close");
  if (!cards.length || !modalTitle || !modalIntro || !modalDetails || !modalCTA)
    return;

  let activeIndex = 0;
  let lastFocus = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const getLang = () =>
    document.documentElement.lang in translations
      ? document.documentElement.lang
      : "uk";
  const getDict = () => translations[getLang()] || translations.uk;

  function updateCounter() {
    if (counter) counter.textContent = String(activeIndex + 1).padStart(2, "0");
    if (prev) prev.disabled = activeIndex === 0;
    if (next) next.disabled = activeIndex === cards.length - 1;
  }

  function goTo(index) {
    activeIndex = Math.max(0, Math.min(cards.length - 1, index));
    const card = cards[activeIndex];
    viewport.scrollTo({
      left: card.offsetLeft - cards[0].offsetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
    updateCounter();
  }

  prev?.addEventListener("click", () => goTo(activeIndex - 1));
  next?.addEventListener("click", () => goTo(activeIndex + 1));

  let scrollFrame = 0;
  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const center =
          viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
        let best = Infinity;
        cards.forEach((card, i) => {
          const rect = card.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - center);
          if (distance < best) {
            best = distance;
            activeIndex = i;
          }
        });
        updateCounter();
      });
    },
    { passive: true },
  );

  function addDetail(label, value) {
    const group = document.createElement("div");
    group.className = "consulting-detail-group";
    const heading = document.createElement("h3");
    heading.textContent = label;
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    group.append(heading, paragraph);
    modalDetails.append(group);
  }

  function openModal(key, trigger) {
    const card = cards.find((item) => item.dataset.consulting === key);
    if (!card) return;
    const t = getDict();
    const prefix = `svc_${key}_`;
    lastFocus = trigger;
    modalTitle.textContent =
      t[prefix + "title"] || card.querySelector("h3")?.textContent.trim() || "";
    modalIntro.textContent = t[prefix + "desc"] || "";
    modalDetails.replaceChildren();
    addDetail(t.consultingFor, t[prefix + "for"] || "");
    addDetail(t.consultingProblem, t[prefix + "problem"] || "");
    addDetail(t.consultingResult, t[prefix + "result"] || "");
    addDetail(t.consultingOrder, t.consultingOrderText);
    modalCTA.textContent = t.consultingCTA;
    const message =
      getLang() === "uk"
        ? `Вітаю! Хочу замовити консультацію: ${modalTitle.textContent}.`
        : getLang() === "de"
          ? `Guten Tag! Ich möchte eine Beratung anfragen: ${modalTitle.textContent}.`
          : `Hello! I would like to request a consultation: ${modalTitle.textContent}.`;
    modalCTA.href = `https://wa.me/491627633221?text=${encodeURIComponent(message)}`;
    modal.inert = false;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("expertise-modal-open");
    closeButton?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;
    if (!document.querySelector(".expertise-modal.is-open")) {
      document.body.classList.remove("expertise-modal-open");
    }
    lastFocus?.focus();
  }

  section.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-consulting]");
    if (trigger) openModal(trigger.dataset.openConsulting, trigger);
  });
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-consulting]")) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...modal.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((el) => el.getClientRects().length);
    if (!focusable.length) return;
    if (event.shiftKey && document.activeElement === focusable[0]) {
      event.preventDefault();
      focusable[focusable.length - 1].focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === focusable[focusable.length - 1]
    ) {
      event.preventDefault();
      focusable[0].focus();
    }
  });
  updateCounter();
})();



(() => {
  const section = document.querySelector(".blog-slider-section");
  if (!section) return;

  const slides = [...section.querySelectorAll(".blog-slide")];
  const prev = section.querySelector(".blog-prev");
  const next = section.querySelector(".blog-next");
  const current = section.querySelector("#blogCurrent");
  const viewport = section.querySelector(".blog-slider-viewport");

  let active = 0;
  let touchStartX = 0;

  function goTo(index) {
    if (index < 0 || index >= slides.length) return;

    active = index;

    slides.forEach((slide, i) => {
      const visible = i === active;
      slide.classList.toggle("is-active", visible);
      slide.setAttribute("aria-hidden", String(!visible));
      slide.inert = !visible;
    });

    current.textContent = String(active + 1).padStart(2, "0");

    prev.disabled = active === 0;
    next.disabled = active === slides.length - 1;
  }

  prev.addEventListener("click", () => goTo(active - 1));
  next.addEventListener("click", () => goTo(active + 1));

  viewport.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (e) => {
      const delta = touchStartX - e.changedTouches[0].screenX;

      if (Math.abs(delta) < 55) return;

      if (delta > 0) goTo(active + 1);
      else goTo(active - 1);
    },
    { passive: true },
  );

  goTo(0);
})();

const contactsFooterYear = document.getElementById("contactsFooterYear");

if (contactsFooterYear) {
  contactsFooterYear.textContent = new Date().getFullYear();
}


(() => {
  const modal = document.getElementById("aboutDetailModal");
  const trigger = document.querySelector("[data-about-open]");
  if (!modal || !trigger) return;
  const panel = modal.querySelector(".about-detail-panel");
  const close = modal.querySelector("[data-about-close]");
  const slides = [...modal.querySelectorAll(".about-cert-slide")];
  const prev = modal.querySelector(".about-cert-prev");
  const next = modal.querySelector(".about-cert-next");
  const count = document.getElementById("aboutCertCurrent");
  let index = 0;
  let lastFocus = null;
  function render() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.setAttribute("aria-hidden", String(i !== index));
      slide.inert = i !== index;
    });
    count.textContent = String(index + 1).padStart(2, "0");
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  }
  function open() {
    lastFocus = document.activeElement;
    modal.inert = false;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("about-detail-open");
    render();
    panel.focus();
  }
  function dismiss() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;
    document.body.classList.remove("about-detail-open");
    if (lastFocus) lastFocus.focus();
  }
  trigger.addEventListener("click", open);
  close.addEventListener("click", dismiss);
  modal.addEventListener("click", (event) => { if (event.target === modal) dismiss(); });
  prev.addEventListener("click", () => { index = Math.max(0, index - 1); render(); });
  next.addEventListener("click", () => { index = Math.min(slides.length - 1, index + 1); render(); });
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
    if (event.key === "ArrowLeft") { index = Math.max(0, index - 1); render(); }
    if (event.key === "ArrowRight") { index = Math.min(slides.length - 1, index + 1); render(); }
    if (event.key === "Tab") {
      const focusable = [...modal.querySelectorAll('button:not(:disabled),a[href]:not([tabindex="-1"])')].filter(el => !el.closest('[inert]'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  let touchX = 0;
  modal.querySelector(".about-cert-viewport").addEventListener("touchstart", e => { touchX = e.changedTouches[0].screenX; }, {passive:true});
  modal.querySelector(".about-cert-viewport").addEventListener("touchend", e => {
    const delta = touchX - e.changedTouches[0].screenX;
    if (Math.abs(delta) > 55) { index = Math.max(0, Math.min(slides.length - 1, index + (delta > 0 ? 1 : -1))); render(); }
  }, {passive:true});
  render();
})();
