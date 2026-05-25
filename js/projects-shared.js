/** Shared helpers for Projects / Selected Works */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function artboardSrc(board) {
  return encodeURI(`images/画板 ${board}.png`);
}

function renderProjectImg({ src, alt, priority, className = "project-gallery-img" }) {
  const priorityAttr = priority ? ' fetchpriority="high"' : "";
  const cls = className ? ` class="${escapeHtml(className)}"` : "";
  return `<img${cls} src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" decoding="async" loading="eager"${priorityAttr}>`;
}

function isI18nBlock(value) {
  return value && typeof value === "object" && "en" in value;
}

function enrichProject(project) {
  const taglineEn = isI18nBlock(project.tagline) ? project.tagline.en : project.tagline || "";
  return {
    ...project,
    taglineEn,
    image: artboardSrc(project.coverBoard),
    boardContent: project.boardContent || null,
    gallery: project.boards.map((board) => ({
      board,
      src: artboardSrc(board),
      alt: `${project.title} — Board ${board}`,
      isCover: String(board) === String(project.coverBoard),
      content: project.boardContent?.[String(board)] ?? null,
    })),
  };
}

async function loadProjectsData() {
  const res = await fetch("data/projects.json");
  if (!res.ok) throw new Error("无法加载项目数据");
  const data = await res.json();
  return {
    section: data.section,
    labels: data.labels,
    projects: data.projects.map(enrichProject),
  };
}

function getProjectById(projects, id) {
  return projects.find((p) => p.id === id);
}
