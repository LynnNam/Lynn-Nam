let siteData = null;
let osConfig = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPortfolioImg({ src, alt, priority }) {
  const priorityAttr = priority ? ' fetchpriority="high"' : "";
  return `<img class="portfolio-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" decoding="sync"${priorityAttr}>`;
}

async function loadSiteData() {
  const [siteRes, configRes] = await Promise.all([
    fetch("data/portfolio-site.json"),
    fetch("data/config.json"),
  ]);
  if (!siteRes.ok) throw new Error("无法加载作品集数据");
  if (!configRes.ok) throw new Error("无法加载主页配置");
  siteData = await siteRes.json();
  osConfig = await configRes.json();
}

function renderNav() {
  const s = siteData.site;
  document.getElementById("portfolio-nav").innerHTML = `
    <a href="${escapeHtml(s.backUrl)}" class="portfolio-back" aria-label="${escapeHtml(s.backLabel)}" title="${escapeHtml(s.backLabel)}">
      <span class="portfolio-back-icon" aria-hidden="true">←</span>
    </a>
    <a href="#home" class="portfolio-logo">${escapeHtml(s.name)}</a>
    <button class="menu-toggle" aria-label="菜单" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <ul class="portfolio-nav-links">
      <li><a href="#about">${escapeHtml(siteData.about.title)}</a></li>
      <li><a href="#work">${escapeHtml(siteData.work.title)}</a></li>
    </ul>
  `;

  const menuBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".portfolio-nav-links");

  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

function renderHero() {
  const h = siteData.hero;
  document.getElementById("portfolio-hero").innerHTML = `
    <p class="hero-role" id="home">${escapeHtml(h.greeting)}</p>
    <h1 class="hero-name">${escapeHtml(h.name)}</h1>
    <p class="hero-tagline">${escapeHtml(h.tagline)}</p>
    <p class="hero-focus">${escapeHtml(h.focus)}</p>
  `;
}

function portfolioHref(href) {
  if (!href) return href;
  if (href.startsWith("#")) return `index.html${href}`;
  return href;
}

function heroArchiveLink(href, inner) {
  if (!href) return inner;
  return `<a class="hero-archive__link" href="${escapeHtml(portfolioHref(href))}">${inner}</a>`;
}

function renderHeroArchive() {
  const h = osConfig?.hero;
  const portrait = osConfig?.site?.heroPortrait;
  const el = document.getElementById("portfolio-hero-archive");
  if (!h || !portrait || !el) return;

  const topMid = h.top[0];
  const topEnd = h.top[1];
  const topMidHtml = heroArchiveLink(
    topMid.href,
    `<span class="hero-archive__num">${escapeHtml(topMid.num)}</span> ${escapeHtml(topMid.label)}`
  );
  const topEndHtml = heroArchiveLink(
    topEnd.href,
    `${escapeHtml(topEnd.label)} <span class="hero-archive__num">${escapeHtml(topEnd.num)}</span> ${escapeHtml(topEnd.suffix || "")}`
  );

  const leftHtml = h.left
    .map((item) => {
      if (item.label) {
        return `<div class="hero-archive__tag">${heroArchiveLink(item.href, `<span>${escapeHtml(item.label)}</span>`)} <span class="hero-archive__num">${escapeHtml(item.num)}</span></div>`;
      }
      return `<span class="hero-archive__line">${heroArchiveLink(item.href, escapeHtml(item.text))}</span>`;
    })
    .join("");

  const rightHtml = h.right
    .map((item) => {
      const prefix = item.prefix ? `${escapeHtml(item.prefix)} ` : "";
      return `<span class="hero-archive__line">${heroArchiveLink(item.href, `${prefix}${escapeHtml(item.text)}`)}</span>`;
    })
    .join("");

  const bottomStart = h.bottom[0];
  const bottomMid = h.bottom[1];
  const bottomEnd = h.bottom[2];

  el.innerHTML = `
    <section class="hero-archive" aria-label="Profile archive">
      <div class="hero-archive__frame">
        <header class="hero-archive__top">
          <div class="hero-archive__brand">${escapeHtml(h.brand)}</div>
          <div class="hero-archive__top-mid">${topMidHtml}</div>
          <div class="hero-archive__top-end">${topEndHtml}</div>
        </header>

        <div class="hero-archive__body">
          <aside class="hero-archive__side hero-archive__side--left">${leftHtml}</aside>

          <figure class="hero-portrait">
            <img
              class="hero-portrait__img"
              src="${escapeHtml(portrait)}"
              alt="${escapeHtml(osConfig.site.heroPortraitAlt || "")}"
              loading="lazy"
              decoding="async"
            >
          </figure>

          <aside class="hero-archive__side hero-archive__side--right">${rightHtml}</aside>
        </div>

        <footer class="hero-archive__bottom">
          <div class="hero-archive__bottom-start">
            ${heroArchiveLink(
              bottomStart.href,
              `<span class="hero-archive__num">${escapeHtml(bottomStart.num)}</span> ${escapeHtml(bottomStart.label)}`
            )}
          </div>
          <div class="hero-archive__bottom-mid">${heroArchiveLink(bottomMid.href, escapeHtml(bottomMid.text))}</div>
          <div class="hero-archive__bottom-end">${heroArchiveLink(bottomEnd.href, escapeHtml(bottomEnd.text))}</div>
        </footer>
      </div>
    </section>
  `;
}

function renderAbout() {
  const a = siteData.about;
  const strengthsHtml = a.strengths
    .map(
      (item) => `
      <li>
        <span class="strength-num">${escapeHtml(item.num)}</span>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </li>
    `
    )
    .join("");

  document.getElementById("portfolio-about").innerHTML = `
    <p class="section-label">${escapeHtml(a.title)}</p>
    <p class="about-lead">${escapeHtml(a.lead)}</p>
    <p class="about-text">${escapeHtml(a.text)}</p>
    <ul class="strengths-list">${strengthsHtml}</ul>
  `;
}

function renderWork() {
  const w = siteData.work;
  const filtersHtml = w.categories
    .map(
      (cat, i) => `
      <button type="button" class="filter-btn${i === 0 ? " active" : ""}" data-filter="${escapeHtml(cat.key)}" aria-selected="${i === 0}">
        ${escapeHtml(cat.label)}
      </button>
    `
    )
    .join("");

  const projectsHtml = siteData.projects
    .map((p) => {
      const hasGallery = p.gallery && p.gallery.length > 0;
      const clickable = hasGallery ? " project-card--clickable" : "";
      const hint = hasGallery ? `<span class="project-view-hint">查看详情</span>` : "";
      return `
      <article class="project-card${clickable}" data-category="${escapeHtml(p.category)}" data-project-id="${escapeHtml(p.id)}" ${hasGallery ? 'tabindex="0" role="button"' : ""}>
        ${p.image
          ? `<div class="project-visual project-visual--photo">${renderPortfolioImg({
              src: p.image,
              alt: p.title,
            })}${hint}</div>`
          : `<div class="project-visual ${escapeHtml(p.visualClass || "")}" aria-hidden="true">${hint}</div>`}
        <div class="project-info">
          <span class="project-tag">${escapeHtml(p.categoryLabel)}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
        </div>
      </article>
    `;
    })
    .join("");

  document.getElementById("portfolio-work").innerHTML = `
    <div class="work-header" id="work">
      <p class="section-label">${escapeHtml(w.title)}</p>
      <h2 class="section-title">精选项目</h2>
      <p class="work-subtitle">${escapeHtml(w.subtitle)}</p>
    </div>
    <div class="portfolio-filters" role="tablist">${filtersHtml}</div>
    <div class="projects-grid" id="projects-grid">${projectsHtml}</div>
  `;

  bindFilters();
  bindProjectGallery();
}

function openProjectModal(projectId) {
  const project = siteData.projects.find((p) => p.id === projectId);
  if (!project || !project.gallery?.length) return;

  const modal = document.getElementById("project-modal");
  document.getElementById("project-modal-tag").textContent = project.categoryLabel;
  document.getElementById("project-modal-title").textContent = project.title;
  document.getElementById("project-modal-desc").textContent = project.description;

  document.getElementById("project-modal-gallery").innerHTML = project.gallery
    .map(
      (img, i) => `
      <figure class="project-modal-figure">
        ${renderPortfolioImg({
          src: img.src,
          alt: img.alt,
          priority: i === 0,
        })}
      </figure>
    `
    )
    .join("");

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector(".project-modal-close").focus();
}

function closeProjectModal() {
  const modal = document.getElementById("project-modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function bindProjectGallery() {
  const modal = document.getElementById("project-modal");

  document.querySelectorAll(".project-card--clickable").forEach((card) => {
    const open = () => openProjectModal(card.dataset.projectId);

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeProjectModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeProjectModal();
  });
}

function bindFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });
}

function renderFooter() {
  document.getElementById("portfolio-footer").textContent =
    `© ${new Date().getFullYear()} ${siteData.site.owner} · ${siteData.site.role}`;
}

async function init() {
  try {
    await loadSiteData();
    renderNav();
    renderHero();
    renderHeroArchive();
    renderAbout();
    renderWork();
    renderFooter();
    document.title = siteData.site.name;
    document.getElementById("portfolio-loading").hidden = true;
    document.getElementById("portfolio-app").hidden = false;
  } catch (err) {
    document.getElementById("portfolio-loading").textContent =
      `${err.message} · 请通过本地服务器打开`;
    console.error("[Lynn Portfolio]", err);
  }
}

init();
