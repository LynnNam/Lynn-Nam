let siteData = null;
let osConfig = null;
let projectsData = null;

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
  const [siteRes, configRes, projectsRes] = await Promise.all([
    fetch("data/portfolio-site.json"),
    fetch("data/config.json"),
    fetch("data/projects.json"),
  ]);
  if (!siteRes.ok) throw new Error("无法加载作品集数据");
  if (!configRes.ok) throw new Error("无法加载主页配置");
  if (!projectsRes.ok) throw new Error("无法加载项目数据");
  siteData = await siteRes.json();
  osConfig = await configRes.json();
  projectsData = await projectsRes.json();
}

function renderNav() {
  const nav = document.getElementById("portfolio-nav");
  nav.innerHTML = `
    ${renderSiteNavLeading({ homeHref: "index.html", backLabel: siteData.site.backLabel })}
    <button class="menu-toggle" aria-label="菜单" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <ul class="portfolio-nav-links">
      <li><a href="#about">${escapeHtml(siteData.about.title)}</a></li>
      <li><a href="#work">${escapeHtml(projectsData?.section?.title || siteData.work.title)}</a></li>
    </ul>
  `;
  const menuBtn = nav.querySelector(".menu-toggle");
  const navLinks = nav.querySelector(".portfolio-nav-links");

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

function getEnrichedProjects() {
  return projectsData.projects.map(enrichProject);
}

/** ProjectsSection — grid header + filters */
function renderProjectsSection() {
  const section = projectsData.section;
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

  const projectsHtml = getEnrichedProjects().map((p) => renderProjectCard(p)).join("");

  const workEl = document.getElementById("work");
  workEl.innerHTML = `
    <div class="work-header projects-section-header">
      <p class="section-label">${escapeHtml(section.label)}</p>
      <h2 class="section-title" id="work-heading">${escapeHtml(section.title)}</h2>
      <p class="work-subtitle">${escapeHtml(section.subtitle)}</p>
    </div>
    <div class="portfolio-filters" role="tablist">${filtersHtml}</div>
    <div class="projects-grid" id="projects-grid">${projectsHtml}</div>
  `;

  workEl.classList.add("portfolio-work--projects");
  bindFilters();
}

/** ProjectCard — cover, title, description, keywords */
function renderProjectCard(project) {
  const keywordsHtml = project.keywords
    .slice(0, 4)
    .map((k) => `<li>${escapeHtml(k)}</li>`)
    .join("");

  return `
    <a
      href="project.html?project=${escapeHtml(project.id)}"
      class="project-card project-card--link"
      data-category="${escapeHtml(project.category)}"
      data-project-id="${escapeHtml(project.id)}"
    >
      <div class="project-visual project-visual--photo">
        ${renderProjectImg({
          src: project.image,
          alt: project.title,
          className: "portfolio-img",
        })}
      </div>
      <div class="project-info">
        <span class="project-tag">${escapeHtml(project.categoryLabel)}</span>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <ul class="project-keywords">${keywordsHtml}</ul>
      </div>
    </a>
  `;
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

/** Scroll to Selected Works (#work) after dynamic content is rendered */
function scrollToWorkSection() {
  const work = document.getElementById("work");
  if (!work) return;
  const shell = document.querySelector(".site-nav-shell");
  const offset = (shell?.offsetHeight || 72) + 20;
  const top = work.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function handleWorkHashScroll() {
  const hash = location.hash.replace(/^#/, "");
  if (hash !== "work" && hash !== "portfolio-work") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToWorkSection);
  });
}

async function init() {
  try {
    await loadSiteData();
    renderNav();
    renderHeroArchive();
    renderAbout();
    renderProjectsSection();
    renderFooter();
    document.title = siteData.site.name;
    document.getElementById("portfolio-loading").hidden = true;
    document.getElementById("portfolio-app").hidden = false;
    handleWorkHashScroll();
    window.addEventListener("hashchange", handleWorkHashScroll);
  } catch (err) {
    document.getElementById("portfolio-loading").textContent =
      `${err.message} · 请通过本地服务器打开`;
    console.error("[Lynn Portfolio]", err);
  }
}

init();
