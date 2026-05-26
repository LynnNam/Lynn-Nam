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
  const pdf = siteData.site.pdfDownload;
  const pdfLabel = pdf ? `${pdf.label || "Download PDF Portfolio"}` : "";
  const pdfBtnHtml = pdf?.href
    ? `<li><a href="${escapeHtml(pdf.href)}" download="${escapeHtml(pdf.filename || "")}">${escapeHtml(pdfLabel)}</a></li>`
    : "";

  nav.innerHTML = `
    ${renderSiteNavLeading({ homeHref: "index.html", backLabel: siteData.site.backLabel })}
    <div class="portfolio-nav-actions">
      <button class="menu-toggle" aria-label="菜单" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="portfolio-nav-links">
        <li><a href="index.html#top">Home</a></li>
        <li><a href="#work">Projects</a></li>
        <li><a href="#about">${escapeHtml(siteData.about.title)}</a></li>
        <li><a href="#contact">Contact</a></li>
        ${pdfBtnHtml}
      </ul>
    </div>
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

/** Same-page anchor for portfolio CTAs (config uses `portfolio.html#work`). */
function portfolioPageAnchorHref(href) {
  if (!href) return "#work";
  if (href.startsWith("#")) return href;
  const idx = href.indexOf("#");
  if (href.includes("portfolio.html") && idx >= 0) return href.slice(idx);
  if (href.includes("portfolio.html")) return "#work";
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

/** Role lines + CTAs under portfolio hero (data/config.json homeLanding). */
function renderPortfolioHeroRoleCta() {
  const h = osConfig?.homeLanding;
  const el = document.getElementById("portfolio-hero-role-cta");
  if (!h || !el) return;
  const pfHref = portfolioPageAnchorHref(h.portfolioHref);
  const pdfHref = h.pdfHref || "#";
  const pdfName = h.pdfFilename || "";
  el.innerHTML = `
    <div class="portfolio-hero-role-cta__inner">
      <div class="portfolio-hero-role-cta__roles">
        <p class="portfolio-hero-role-cta__line portfolio-hero-role-cta__line--en">${escapeHtml(h.roleEn || "")}</p>
        <p class="portfolio-hero-role-cta__line portfolio-hero-role-cta__line--zh">${escapeHtml(h.roleZh || "")}</p>
        <p class="portfolio-hero-role-cta__line portfolio-hero-role-cta__line--kr">${escapeHtml(h.roleKr || "")}</p>
      </div>
      <div class="portfolio-hero-role-cta__actions">
        <a class="portfolio-strip-cta__primary" href="${escapeHtml(pfHref)}">VIEW PORTFOLIO</a>
        <a class="portfolio-strip-cta__ghost" href="${escapeHtml(pdfHref)}" download="${escapeHtml(pdfName)}">DOWNLOAD PDF PORTFOLIO</a>
      </div>
    </div>
  `;
}

function renderAbout() {
  const a = siteData.about;
  const i = a.intro;
  if (!i) return;

  document.getElementById("about").innerHTML = `
    <p class="section-label about-section-label">${escapeHtml(a.title)}</p>
    <div class="about-brief" lang="multi">
      <p class="about-brief__en-lead">${escapeHtml(i.enLead)}</p>
      <p class="about-brief__en-detail">${escapeHtml(i.enDetail)}</p>
      <p class="about-brief__zh">${escapeHtml(i.zh)}</p>
      <p class="about-brief__kr">${escapeHtml(i.kr)}</p>
    </div>
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

/** ProjectCard — cover, title, keywords line, role, year */
function renderProjectCard(project) {
  const keywordsHtml = project.keywords
    .slice(0, 5)
    .map((k) => `<li>${escapeHtml(k)}</li>`)
    .join("");
  const displayTitle = project.displayTitle || project.title;
  const line = project.portfolioLine || project.categoryLabel || "";
  const role = project.role || "Industrial Designer";
  const year = project.year || "";

  return `
    <a
      href="project.html?project=${escapeHtml(project.id)}"
      class="project-card project-card--link"
      data-category="${escapeHtml(project.category)}"
      data-project-id="${escapeHtml(project.id)}"
    >
      <div class="project-visual project-visual--photo">
        ${renderPortfolioImg({
          src: project.image,
          alt: displayTitle,
          priority: false,
        })}
      </div>
      <div class="project-info">
        <span class="project-tag project-tag--quiet">${escapeHtml(project.categoryLabel)}</span>
        <h3>${escapeHtml(displayTitle)}</h3>
        <p class="project-card__line">${escapeHtml(line)}</p>
        <p class="project-card__meta"><span>Role: ${escapeHtml(role)}</span>${year ? ` · <span>${escapeHtml(year)}</span>` : ""}</p>
        <ul class="project-keywords project-keywords--quiet">${keywordsHtml}</ul>
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

function renderContactSocialLinks(c, linkClass) {
  const parts = [];
  if (c.linkedin) {
    parts.push(
      `<a class="${linkClass}" href="${escapeHtml(c.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
    );
  }
  if (c.behance) {
    parts.push(
      `<a class="${linkClass}" href="${escapeHtml(c.behance)}" target="_blank" rel="noopener noreferrer">Behance</a>`
    );
  }
  if (c.instagram) {
    parts.push(
      `<a class="${linkClass}" href="${escapeHtml(c.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>`
    );
  }
  return parts.length ? `<p class="portfolio-contact__social">${parts.join(" · ")}</p>` : "";
}

function renderFooter() {
  const c = siteData.contact || {};
  const el = document.getElementById("contact");
  if (!el) return;

  const emailHtml = c.email
    ? `<a class="portfolio-contact__email" href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>`
    : "";

  el.innerHTML = `
    <div class="portfolio-contact">
      <p class="portfolio-contact__label">Contact</p>
      <p class="portfolio-contact__location">${escapeHtml(c.location || "")}</p>
      <p class="portfolio-contact__availability">${escapeHtml(c.availability || "")}</p>
      <div class="portfolio-contact__meta">
        <p class="portfolio-contact__languages">${escapeHtml(c.languages || "")}</p>
        ${emailHtml}
      </div>
      ${renderContactSocialLinks(c, "portfolio-contact__link")}
    </div>
    <p class="portfolio-footer__copy">© ${new Date().getFullYear()} ${escapeHtml(siteData.site.owner)} · Product & Industrial Design</p>
  `;
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
    renderPortfolioHeroRoleCta();
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
