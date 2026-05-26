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

function renderBoardOverlay(content) {
  if (!content) return "";

  if (content.layout === "bottom-copy") {
    const labels = (content.iconLabels || [])
      .map((label) => `<span class="board-slide__icon-label">${escapeHtml(label)}</span>`)
      .join("");
    const paragraphs = (content.paragraphs || [])
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--bottom-copy">
        ${labels ? `<div class="board-slide__icon-labels">${labels}</div>` : ""}
        <div class="board-slide__copy">${paragraphs}</div>
      </div>
    `;
  }

  if (content.layout === "title-top") {
    return `
      <div class="board-slide__overlay board-slide__overlay--title-top">
        <p class="board-slide__page-title">${escapeHtml(content.title || "")}</p>
        ${content.hint ? `<p class="board-slide__hint">${escapeHtml(content.hint)}</p>` : ""}
      </div>
    `;
  }

  if (content.layout === "split-right") {
    const features = (content.features || [])
      .map((f) => `<li>${escapeHtml(f)}</li>`)
      .join("");
    const callouts = (content.callouts || [])
      .map((c) => `<span class="board-slide__callout">${escapeHtml(c)}</span>`)
      .join("");
    const shiftClass =
      content.panelShift === "left" ? " board-slide__overlay--shift-left" : "";
    const mealClass = content.mealPanel ? " board-slide__overlay--meal-panel" : "";
    const panelOnly = content.panelOnly === true;
    const panelHeading = panelOnly
      ? content.panelTitle || ""
      : content.panelTitle || content.title || "";
    const headingTag = content.panelTitle && content.title && !panelOnly ? "h4" : "h3";
    return `
      <div class="board-slide__overlay board-slide__overlay--split-right${shiftClass}${mealClass}">
        <${headingTag} class="board-slide__panel-title">${escapeHtml(panelHeading)}</${headingTag}>
        ${features ? `<ul class="board-slide__features">${features}</ul>` : ""}
        ${content.body ? `<p class="board-slide__panel-body">${escapeHtml(content.body)}</p>` : ""}
        ${callouts ? `<div class="board-slide__callouts">${callouts}</div>` : ""}
      </div>
    `;
  }

  if (content.layout === "quad-columns") {
    const cols = (content.columns || [])
      .map(
        (col) => `
        <div class="board-slide__quad-col">
          <h4 class="board-slide__quad-title">${escapeHtml(col.title || "")}</h4>
          <p class="board-slide__quad-body">${escapeHtml(col.body || "")}</p>
        </div>
      `
      )
      .join("");
    return `<div class="board-slide__overlay board-slide__overlay--quad">${cols}</div>`;
  }

  if (content.layout === "stack-intro") {
    return `
      <div class="board-slide__overlay board-slide__overlay--section-label">
        <p class="board-slide__section-title">${escapeHtml(content.sectionTitle || "")}</p>
      </div>
    `;
  }

  if (content.layout === "overlay-intro-top") {
    const paragraphs = (content.paragraphs || [])
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--overlay-intro-top">
        <div class="board-slide__mayday-intro-copy">${paragraphs}</div>
      </div>
    `;
  }

  if (content.layout === "endangered-split") {
    const paragraphs = (content.paragraphs || [])
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--endangered-split">
        <div class="board-slide__endangered-block">
          ${content.title ? `<p class="board-slide__endangered-title">${escapeHtml(content.title)}</p>` : ""}
          <div class="board-slide__endangered-copy">${paragraphs}</div>
        </div>
      </div>
    `;
  }

  if (content.layout === "copy-right") {
    const paragraphs = (content.paragraphs || [])
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--copy-right">
        <div class="board-slide__mayday-right">
          <div class="board-slide__mayday-right-copy">${paragraphs}</div>
          ${content.displayTitle ? `<p class="board-slide__mayday-display-title">${escapeHtml(content.displayTitle)}</p>` : ""}
        </div>
      </div>
    `;
  }

  if (content.layout === "watch-keywords") {
    const cols = (content.columns || [])
      .map((col) => {
        const text = (col.keywords || []).join(" / ");
        return `<p class="board-slide__watch-keywords">${escapeHtml(text)}</p>`;
      })
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--watch-keywords">
        ${cols}
      </div>
    `;
  }

  if (content.layout === "watch-corner-title") {
    return `
      <div class="board-slide__overlay board-slide__overlay--watch-corner-title">
        <p class="board-slide__watch-section-title">${escapeHtml(content.title || "")}</p>
      </div>
    `;
  }

  if (content.layout === "voice-header") {
    const paragraphs = (content.paragraphs || [])
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--voice-header">
        <p class="board-slide__voice-title">${escapeHtml(content.title || "")}</p>
        ${content.subtitle ? `<p class="board-slide__voice-subtitle">${escapeHtml(content.subtitle)}</p>` : ""}
        ${paragraphs ? `<div class="board-slide__voice-intro">${paragraphs}</div>` : ""}
      </div>
    `;
  }

  if (content.layout === "voice-trends") {
    const tracks = (content.tracks || [])
      .map(
        (t) => `
        <div class="voice-trends__track voice-trends__track--${escapeHtml(t.zone || "top")}">
          <p class="voice-trends__mega">${escapeHtml(t.label || "")}</p>
          <p class="voice-trends__caption">${escapeHtml(t.caption || "")}</p>
        </div>
      `
      )
      .join("");
    const sublines = (content.sublines || [])
      .map((s) => `<p>${escapeHtml(s)}</p>`)
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--voice-trends">
        ${tracks}
        ${content.scenario ? `<p class="voice-trends__scenario">${escapeHtml(content.scenario)}</p>` : ""}
        <div class="voice-trends__conclusion">
          <p class="voice-trends__headline">
            ${escapeHtml(content.headline || "")}
            ${content.headlineAccent ? `<span class="voice-trends__accent">${escapeHtml(content.headlineAccent)}</span>` : ""}
          </p>
          ${sublines ? `<div class="voice-trends__sublines">${sublines}</div>` : ""}
        </div>
      </div>
    `;
  }

  if (content.layout === "voice-callouts") {
    const items = (content.callouts || [])
      .map(
        (c) =>
          `<span class="board-slide__voice-callout" style="left:${escapeHtml(c.left)};top:${escapeHtml(c.top)}">${escapeHtml(c.label)}</span>`
      )
      .join("");
    return `
      <div class="board-slide__overlay board-slide__overlay--voice-callouts" aria-hidden="true">
        ${items}
      </div>
    `;
  }

  return "";
}

function renderCircleCallouts(content) {
  if (!content?.circleCallouts?.length) return "";
  const items = content.circleCallouts
    .map(
      (c) =>
        `<span class="board-slide__circle-label" style="left:${escapeHtml(c.left)};top:${escapeHtml(c.top)}">${escapeHtml(c.label)}</span>`
    )
    .join("");
  return `<div class="board-slide__overlay board-slide__overlay--circle-labels" aria-hidden="true">${items}</div>`;
}

function renderBoardCornerTitle(content) {
  if (!content || (!content.title && !content.subtitle)) return "";
  return `
    <div class="board-slide__overlay board-slide__overlay--corner-title">
      ${content.title ? `<p class="board-slide__corner-title">${escapeHtml(content.title)}</p>` : ""}
      ${content.subtitle ? `<p class="board-slide__corner-subtitle">${escapeHtml(content.subtitle)}</p>` : ""}
    </div>
  `;
}

function renderBoardStackHeader(content) {
  if (!content) return "";
  return `
    <div class="board-slide__header">
      <p class="board-slide__mock-title">${escapeHtml(content.title || "")}</p>
      ${content.subtitle ? `<p class="board-slide__mock-subtitle">${escapeHtml(content.subtitle)}</p>` : ""}
    </div>
  `;
}

function renderBoardFigure(img, options = {}) {
  const content = img.content;
  const layoutClass = content?.layout ? ` board-slide--${content.layout}` : "";
  const priority = options.priority ?? false;
  const className = options.className || "image-gallery__img";

  if (content?.layout === "stack-header") {
    return `
      <figure class="board-slide board-slide--stack-header" data-board="${img.board}">
        ${renderBoardStackHeader(content)}
        ${renderProjectImg({
          src: img.src,
          alt: img.alt,
          priority,
          className,
        })}
      </figure>
    `;
  }

  if (content?.layout === "stack-intro") {
    return `
      <figure class="board-slide board-slide--stack-intro" data-board="${img.board}">
        <div class="board-slide__intro-block">
          <p class="board-slide__intro-title">${escapeHtml(content.title || "")}</p>
          ${content.intro ? `<p class="board-slide__intro-body">${escapeHtml(content.intro)}</p>` : ""}
        </div>
        <div class="board-slide__media-wrap">
          ${renderProjectImg({
            src: img.src,
            alt: img.alt,
            priority,
            className,
          })}
          ${renderBoardOverlay(content)}
        </div>
      </figure>
    `;
  }

  if (content?.layout === "meal-service") {
    const platformSrc = content.platformImage || img.src;
    const diningOverlay = {
      layout: "split-right",
      panelShift: content.panelShift,
      title: content.title,
      features: content.features,
      body: content.body,
      mealPanel: true,
    };
    return `
      <figure class="board-slide board-slide--meal-service" data-board="${img.board}">
        <div class="board-slide__meal-intro">
          <h3 class="board-slide__meal-title">${escapeHtml(content.platformTitle || "")}</h3>
          ${content.platformIntro ? `<p class="board-slide__meal-body">${escapeHtml(content.platformIntro)}</p>` : ""}
        </div>
        <div class="board-slide__platform-views">
          ${renderProjectImg({
            src: platformSrc,
            alt: `${img.alt} — platform views`,
            priority,
            className: "board-slide__platform-img",
          })}
        </div>
        <div class="board-slide__media-wrap">
          ${renderProjectImg({
            src: img.src,
            alt: img.alt,
            priority: false,
            className,
          })}
          ${renderBoardOverlay(diningOverlay)}
          ${renderCircleCallouts(content)}
        </div>
      </figure>
    `;
  }

  if (content?.layout === "stack-split") {
    return `
      <figure class="board-slide board-slide--stack-split" data-board="${img.board}">
        <div class="board-slide__media-wrap">
          ${renderProjectImg({
            src: img.src,
            alt: img.alt,
            priority,
            className,
          })}
          ${renderBoardCornerTitle(content)}
        </div>
        <div class="board-slide__panel-caption">
          <h3 class="board-slide__panel-caption-title">${escapeHtml(content.panelTitle || "")}</h3>
          ${content.body ? `<p class="board-slide__panel-caption-body">${escapeHtml(content.body)}</p>` : ""}
        </div>
      </figure>
    `;
  }

  return `
    <figure class="board-slide${layoutClass}" data-board="${img.board}">
      ${renderProjectImg({
        src: img.src,
        alt: img.alt,
        priority,
        className,
      })}
      ${renderBoardOverlay(content)}
      ${renderCircleCallouts(content)}
    </figure>
  `;
}

function renderProjectHero(project) {
  const coverSlide = project.gallery.find((img) => img.isCover) || {
    board: project.coverBoard,
    src: project.image,
    alt: project.title,
    content: project.boardContent?.[String(project.coverBoard)] ?? null,
  };

  return `
    <header class="project-detail-hero">
      <figure class="project-detail-hero__media${coverSlide.content?.layout ? ` board-slide board-slide--${coverSlide.content.layout}` : ""}">
        ${renderProjectImg({
          src: coverSlide.src,
          alt: project.title,
          priority: true,
          className: "project-detail-hero__img",
        })}
        ${renderBoardOverlay(coverSlide.content)}
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

  const count = project.highlights.length;
  return `
    <section class="project-detail-section project-highlights" aria-labelledby="highlights-heading" data-highlight-count="${count}">
      ${renderTriSectionTitle(pageLabels.highlights)}
      ${renderTriBlock(pageLabels.highlightsIntro, { className: "tri-block--section-intro" })}
      <div class="highlights-grid">${items}</div>
    </section>
  `;
}

function renderImageGallery(project) {
  const figures = project.gallery
    .map((img, i) => renderBoardFigure(img, { priority: i === 0 }))
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
