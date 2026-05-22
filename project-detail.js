/* ProjectDetail — single project page (trilingual, no lang labels) */

let pageLabels = null;

function renderTriBlock(i18n, options = {}) {
  const blockClass = options.className ? ` ${options.className}` : "";
  const compact = options.compact ? " tri-block--compact" : "";
  return `
    <div class="tri-block${blockClass}${compact}" lang="multi">
      <p class="tri-block__line tri-block__line--en">${escapeHtml(i18n.en)}</p>
      <p class="tri-block__line tri-block__line--cn">${escapeHtml(i18n.zh)}</p>
      <p class="tri-block__line tri-block__line--kr">${escapeHtml(i18n.kr)}</p>
    </div>
  `;
}

function renderTriSectionTitle(i18n) {
  return `
    <div class="tri-section-title" lang="multi">
      <h2 class="tri-section-title__line tri-section-title__line--en">${escapeHtml(i18n.en)}</h2>
      <p class="tri-section-title__line tri-section-title__line--cn">${escapeHtml(i18n.zh)}</p>
      <p class="tri-section-title__line tri-section-title__line--kr">${escapeHtml(i18n.kr)}</p>
    </div>
  `;
}

function renderProjectDetailNav(project) {
  const nav = document.getElementById("project-detail-nav");
  nav.innerHTML = `
    ${renderSiteNavLeading({ homeHref: "index.html", backLabel: pageLabels.endBack.en })}
    <span class="project-detail-nav-title">${escapeHtml(project.title)}</span>
  `;
}

function renderProjectHero(project) {
  return `
    <header class="project-detail-hero">
      <figure class="project-detail-hero__media">
        ${renderProjectImg({
          src: project.image,
          alt: project.title,
          priority: true,
          className: "project-detail-hero__img",
        })}
      </figure>
      <div class="project-detail-hero__text">
        <p class="project-detail-hero__label">${escapeHtml(project.categoryLabel)}</p>
        <h1 class="project-detail-hero__title">${escapeHtml(project.title)}</h1>
        <div class="project-detail-hero__tagline-wrap">
          ${renderTriBlock(project.tagline, { className: "tri-block--tagline" })}
        </div>
        <ul class="project-detail-hero__keywords" aria-label="Keywords">
          ${project.keywords.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}
        </ul>
      </div>
    </header>
  `;
}

function renderProjectOverview(project) {
  return `
    <section class="project-detail-section project-overview" aria-labelledby="overview-heading">
      ${renderTriSectionTitle(pageLabels.overview)}
      ${renderTriBlock(project.overview, { className: "tri-block--overview" })}
    </section>
  `;
}

function renderDesignHighlights(project) {
  const items = project.highlights
    .map(
      (h) => `
      <article class="highlight-item">
        <div class="highlight-item__title-wrap">
          ${renderTriBlock(h.title, { compact: true, className: "tri-block--highlight-title" })}
        </div>
        ${renderTriBlock(h.text, { className: "tri-block--highlight-text" })}
      </article>
    `
    )
    .join("");

  return `
    <section class="project-detail-section project-highlights" aria-labelledby="highlights-heading">
      ${renderTriSectionTitle(pageLabels.highlights)}
      ${renderTriBlock(pageLabels.highlightsIntro, { className: "tri-block--section-intro" })}
      <div class="highlights-grid">${items}</div>
    </section>
  `;
}

function renderImageGallery(project) {
  const figures = project.gallery
    .map(
      (img, i) => `
      <figure class="image-gallery__figure" data-board="${img.board}">
        ${renderProjectImg({
          src: img.src,
          alt: img.alt,
          priority: i === 0,
          className: "image-gallery__img",
        })}
      </figure>
    `
    )
    .join("");

  return `
    <section class="project-detail-section image-gallery" aria-labelledby="gallery-heading">
      ${renderTriSectionTitle(pageLabels.gallery)}
      <div class="image-gallery__grid">${figures}</div>
    </section>
  `;
}

function renderEndSection() {
  return `
    <footer class="end-section">
      <p class="end-section__label">END</p>
      <a href="portfolio.html#work" class="end-section__back">${escapeHtml(pageLabels.endBack.en)}</a>
    </footer>
  `;
}

function applyProjectTheme(project) {
  const body = document.body;
  body.className = "project-detail-page";
  body.style.removeProperty("--project-bg");
  body.style.removeProperty("--project-text");
  body.style.removeProperty("--project-text-muted");
  body.style.removeProperty("--project-text-light");
  body.style.removeProperty("--project-border");

  const theme = project.theme;
  if (!theme?.bg && !theme?.text) return;

  body.classList.add(`project-detail-page--${project.id}`);
  if (theme.bg) body.style.setProperty("--project-bg", theme.bg);
  if (theme.text) body.style.setProperty("--project-text", theme.text);
}

function renderProjectDetail(project) {
  applyProjectTheme(project);
  document.getElementById("project-detail-root").innerHTML = `
    ${renderProjectHero(project)}
    ${renderProjectOverview(project)}
    ${renderDesignHighlights(project)}
    ${renderImageGallery(project)}
    ${renderEndSection()}
  `;
  document.title = `${project.title} — Lynn Portfolio`;
}

async function init() {
  const loading = document.getElementById("project-loading");
  const app = document.getElementById("project-detail-app");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("project");
  if (id === "omni-mobility") {
    document.body.classList.add("project-detail-page--omni-mobility");
  }

  try {
    const { projects, labels } = await loadProjectsData();
    pageLabels = labels;
    const project = getProjectById(projects, id);

    if (!project) {
      loading.textContent = "未找到该项目";
      return;
    }

    renderProjectDetailNav(project);
    renderProjectDetail(project);
    loading.hidden = true;
    app.hidden = false;
  } catch (err) {
    loading.textContent = `${err.message} · 请通过本地服务器打开`;
    console.error("[Project Detail]", err);
  }
}

init();
