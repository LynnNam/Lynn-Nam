/** Shared top nav — LYNN NAM logo (links to homepage) */

const SITE_NAV_HOME = "index.html";
const SITE_NAV_LOGO = "images/lynn-nam-logo.png";
const SITE_NAV_LOGO_ALT = "LYNN NAM industrial design";

function escapeHtmlNav(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSiteNavLeading(options = {}) {
  const homeHref = options.homeHref || SITE_NAV_HOME;
  const logoSrc = options.logoSrc || SITE_NAV_LOGO;
  const logoAlt = options.logoAlt || SITE_NAV_LOGO_ALT;

  return `
    <div class="site-nav-leading">
      <a href="${escapeHtmlNav(homeHref)}" class="site-nav-logo-link" aria-label="${escapeHtmlNav(logoAlt)}">
        <img class="site-nav-logo" src="${escapeHtmlNav(logoSrc)}" alt="${escapeHtmlNav(logoAlt)}" width="353" height="101" decoding="async">
      </a>
    </div>
  `;
}
