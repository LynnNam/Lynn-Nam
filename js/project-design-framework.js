/** Project Background / Design Strategy — WHAT · HOW · WHERE · WHO */

const DESIGN_FRAMEWORK_ICONS = {
  retail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12L6 6z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>`,
  dining: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M4 11h16v2H4z"/><path d="M8 11V7a2 2 0 0 1 4 0v4"/><path d="M12 11V5"/><path d="M16 11V8a2 2 0 0 1 2 2v1"/></svg>`,
  office: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`,
  medical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="1"/><path d="M12 8v8M8 12h8"/></svg>`,
  public: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V9l6-4 6 4v11"/><path d="M10 20v-5h4v5"/></svg>`,
  transit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M3 12h18"/><path d="M5 12l2-7h10l2 7"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/><path d="M9 17h6"/></svg>`,
};

function renderPdfSectionHead(index, label, subtitle) {
  return `
    <header class="pdf-section__head">
      <span class="pdf-section__index">${escapeHtml(index)}</span>
      <div class="pdf-section__titles">
        <h3 class="pdf-section__label">${escapeHtml(label)}</h3>
        <p class="pdf-section__subtitle">${escapeHtml(subtitle)}</p>
      </div>
    </header>
  `;
}

function renderPdfPoints(points) {
  return `
    <ol class="pdf-points">
      ${points
        .map(
          (p, i) => `
        <li class="pdf-points__item">
          <span class="pdf-points__num">${String(i + 1).padStart(2, "0")}</span>
          <div class="pdf-points__body">
            <p class="pdf-points__title">${escapeHtml(p.title)}</p>
            ${(p.lines || [])
              .map((line) => `<p class="pdf-points__line">${escapeHtml(line)}</p>`)
              .join("")}
          </div>
        </li>`
        )
        .join("")}
    </ol>
  `;
}

function renderPdfMap(regions) {
  const caption = (regions || [])
    .map((r) => `${r.label}: ${(r.lines || []).join("，")}`)
    .join("；");
  const markers = (regions || [])
    .map(
      (r) => `
      <div class="pdf-map__marker pdf-map__marker--${escapeHtml(r.id)}">
        <p class="pdf-map__region">${escapeHtml(r.label)}</p>
        ${(r.lines || []).map((l) => `<p class="pdf-map__line">${escapeHtml(l)}</p>`).join("")}
      </div>`
    )
    .join("");

  return `
    <div class="pdf-map" role="img" aria-label="${escapeHtml(caption || "Global service robotics regions")}">
      <div class="pdf-map__canvas">
        ${renderWorldMapDotsSvg()}
        <div class="pdf-map__labels">${markers}</div>
      </div>
    </div>
  `;
}

function renderPdfFlow(steps) {
  const cards = steps
    .map(
      (step, i) => `
      <div class="pdf-flow__step">
        <article class="pdf-flow__card">
          <p class="pdf-flow__card-label">${escapeHtml(step.label)}</p>
          <ul class="pdf-flow__list">
            ${(step.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
        ${i < steps.length - 1 ? `<span class="pdf-flow__arrow" aria-hidden="true">→</span>` : ""}
      </div>`
    )
    .join("");

  return `<div class="pdf-flow">${cards}</div>`;
}

function renderPdfPrinciples(principles) {
  return `
    <div class="pdf-principles">
      <p class="pdf-principles__heading">DESIGN PRINCIPLE</p>
      <ol class="pdf-principles__list">
        ${principles
          .map(
            (p, i) => `
          <li class="pdf-principles__item">
            <span class="pdf-principles__num">${i + 1}</span>
            <div>
              <p class="pdf-principles__title">${escapeHtml(p.title)}</p>
              ${(p.lines || []).map((l) => `<p class="pdf-principles__line">${escapeHtml(l)}</p>`).join("")}
            </div>
          </li>`
          )
          .join("")}
      </ol>
    </div>
  `;
}

function renderPdfScenes(scenes) {
  return `
    <ul class="pdf-scenes">
      ${scenes
        .map(
          (s) => `
        <li class="pdf-scenes__item">
          <div class="pdf-scenes__icon">${DESIGN_FRAMEWORK_ICONS[s.icon] || ""}</div>
          <p class="pdf-scenes__title">${escapeHtml(s.title)}</p>
          <p class="pdf-scenes__desc">${escapeHtml(s.desc)}</p>
        </li>`
        )
        .join("")}
    </ul>
  `;
}

function renderPdfWho(who) {
  const values = who.values
    .map(
      (v, i) => `
      <li class="pdf-who__value">
        <span class="pdf-who__value-num">${i + 1}</span>
        <div>
          <p class="pdf-who__value-title">${escapeHtml(v.title)}</p>
          ${(v.lines || []).map((l) => `<p class="pdf-who__value-line">${escapeHtml(l)}</p>`).join("")}
        </div>
      </li>`
    )
    .join("");

  return `
    <div class="pdf-who">
      <div class="pdf-who__col pdf-who__col--brand">
        <p class="pdf-who__block-label">BRAND POSITIONING</p>
        <p class="pdf-who__positioning">${escapeHtml(who.positioning)}</p>
        <p class="pdf-who__block-label pdf-who__block-label--spaced">BRAND VALUE</p>
        <ol class="pdf-who__values">${values}</ol>
      </div>
      <div class="pdf-who__divider" aria-hidden="true"></div>
      <div class="pdf-who__col pdf-who__col--vision">
        <div class="pdf-who__statement">
          <p class="pdf-who__block-label">COMPANY VISION</p>
          <blockquote class="pdf-who__quote">${escapeHtml(who.vision)}</blockquote>
        </div>
        <div class="pdf-who__statement">
          <p class="pdf-who__block-label">COMPANY MISSION</p>
          <p class="pdf-who__mission">${escapeHtml(who.mission)}</p>
        </div>
      </div>
    </div>
  `;
}

function renderDesignFramework(project) {
  const df = project.designFramework;
  if (!df) return "";

  const what = df.what;
  const how = df.how;
  const where = df.where;
  const who = df.who;

  return `
    <section class="project-design-framework" aria-labelledby="pdf-module-heading">
      <header class="pdf-module__intro">
        <h2 id="pdf-module-heading" class="pdf-module__title">${escapeHtml(df.moduleTitleZh || "项目背景 / 设计策略")}</h2>
        <p class="pdf-module__title-en">${escapeHtml(df.moduleTitleEn || "Project Background / Design Strategy")}</p>
      </header>

      <section class="pdf-section pdf-section--what" aria-labelledby="pdf-what-heading">
        ${renderPdfSectionHead("01", what.label, what.subtitle)}
        <div class="pdf-section__body pdf-section__body--what">
          <div class="pdf-what__copy">
            <h4 id="pdf-what-heading" class="visually-hidden">${escapeHtml(what.label)} ${escapeHtml(what.subtitle)}</h4>
            <p class="pdf-lead">${escapeHtml(what.intro)}</p>
            ${renderPdfPoints(what.points)}
          </div>
          ${renderPdfMap(what.mapRegions)}
        </div>
      </section>

      <section class="pdf-section pdf-section--how" aria-labelledby="pdf-how-heading">
        ${renderPdfSectionHead("02", how.label, how.subtitle)}
        <div class="pdf-section__body">
          <h4 id="pdf-how-heading" class="visually-hidden">${escapeHtml(how.label)} ${escapeHtml(how.subtitle)}</h4>
          <p class="pdf-lead">${escapeHtml(how.intro)}</p>
          ${renderPdfFlow(how.flow)}
          ${renderPdfPrinciples(how.principles)}
        </div>
      </section>

      <section class="pdf-section pdf-section--where" aria-labelledby="pdf-where-heading">
        ${renderPdfSectionHead("03", where.label, where.subtitle)}
        <div class="pdf-section__body">
          <h4 id="pdf-where-heading" class="visually-hidden">${escapeHtml(where.label)} ${escapeHtml(where.subtitle)}</h4>
          ${renderPdfScenes(where.scenes)}
        </div>
      </section>

      <section class="pdf-section pdf-section--who" aria-labelledby="pdf-who-heading">
        ${renderPdfSectionHead("04", who.label, who.subtitle)}
        <div class="pdf-section__body">
          <h4 id="pdf-who-heading" class="visually-hidden">${escapeHtml(who.label)} ${escapeHtml(who.subtitle)}</h4>
          ${renderPdfWho(who)}
        </div>
      </section>
    </section>
  `;
}
