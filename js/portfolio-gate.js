/** Portfolio password gate — shared by index.html, portfolio.html, and project.html */

const PORTFOLIO_GATE_PASSWORD = "Lynn2026";
const PORTFOLIO_GATE_STORAGE_KEY = "lynn-portfolio-unlocked";
const PORTFOLIO_PAGE_URL = "portfolio.html";

const portfolioGateCallbacks = {
  onSuccess: null,
  onDismiss: null,
  pendingHref: PORTFOLIO_PAGE_URL,
};

let portfolioGateModalBound = false;
let homePortfolioGateBound = false;

function isPortfolioUnlocked() {
  try {
    return localStorage.getItem(PORTFOLIO_GATE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setPortfolioUnlocked() {
  try {
    localStorage.setItem(PORTFOLIO_GATE_STORAGE_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

function openPortfolioGateModal() {
  const modal = getEl("portfolio-gate");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("portfolio-gate-open");
  const err = getEl("portfolio-gate-error");
  const input = getEl("portfolio-gate-password");
  if (err) err.hidden = true;
  if (input) {
    input.value = "";
    input.focus();
  }
}

function closePortfolioGateModal() {
  const modal = getEl("portfolio-gate");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("portfolio-gate-open");
}

function setPortfolioGateCallbacks(options = {}) {
  if (options.onSuccess !== undefined) portfolioGateCallbacks.onSuccess = options.onSuccess;
  if (options.onDismiss !== undefined) portfolioGateCallbacks.onDismiss = options.onDismiss;
  if (options.pendingHref !== undefined) portfolioGateCallbacks.pendingHref = options.pendingHref;
}

function ensurePortfolioGateModalBound() {
  if (portfolioGateModalBound) return;

  const form = getEl("portfolio-gate-form");
  const modal = getEl("portfolio-gate");
  const input = getEl("portfolio-gate-password");
  const err = getEl("portfolio-gate-error");
  if (!form || !modal) return;

  portfolioGateModalBound = true;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input) return;
    if (input.value === PORTFOLIO_GATE_PASSWORD) {
      setPortfolioUnlocked();
      closePortfolioGateModal();
      portfolioGateCallbacks.onSuccess?.();
      return;
    }
    if (err) err.hidden = false;
    input.focus();
    input.select();
  });

  const dismiss = () => {
    closePortfolioGateModal();
    portfolioGateCallbacks.onDismiss?.();
  };

  modal.querySelectorAll("[data-portfolio-gate-close]").forEach((el) => {
    el.addEventListener("click", dismiss);
  });
  getEl("portfolio-gate-close")?.addEventListener("click", dismiss);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) dismiss();
  });
}

function resolvePortfolioHref(link) {
  const explicit = link.getAttribute("data-portfolio-href");
  if (explicit) return explicit;
  const href = link.getAttribute("href") || "";
  if (href.includes("portfolio.html")) return href;
  return PORTFOLIO_PAGE_URL;
}

function isHomePortfolioGatePage() {
  return Boolean(getEl("portfolio-gate") && !getEl("portfolio-app") && !getEl("project-detail-app"));
}

function navigateToPortfolio(href = PORTFOLIO_PAGE_URL) {
  window.location.href = href || PORTFOLIO_PAGE_URL;
}

function requestPortfolioAccess(href = PORTFOLIO_PAGE_URL) {
  if (isPortfolioUnlocked()) {
    navigateToPortfolio(href);
    return;
  }
  portfolioGateCallbacks.pendingHref = href || PORTFOLIO_PAGE_URL;
  openPortfolioGateModal();
}

/** index.html: intercept Portfolio nav (and any gated portfolio links). */
function initHomePortfolioGate() {
  if (!isHomePortfolioGatePage() || homePortfolioGateBound) return;
  homePortfolioGateBound = true;

  ensurePortfolioGateModalBound();
  setPortfolioGateCallbacks({
    pendingHref: PORTFOLIO_PAGE_URL,
    onSuccess: () => navigateToPortfolio(portfolioGateCallbacks.pendingHref),
    onDismiss: () => {
      portfolioGateCallbacks.pendingHref = PORTFOLIO_PAGE_URL;
    },
  });

  document.addEventListener(
    "click",
    (e) => {
      if (!isHomePortfolioGatePage()) return;

      const link = e.target.closest(
        "#portfolioProtectedLink, [data-portfolio-gate-link], a[href*='portfolio.html']"
      );
      if (!link) return;

      e.preventDefault();
      requestPortfolioAccess(resolvePortfolioHref(link));
    },
    true
  );
}

/** @deprecated Use initHomePortfolioGate — kept for script.js compatibility. */
function initPortfolioGateLink(linkId = "portfolioProtectedLink") {
  initHomePortfolioGate();
  const link = getEl(linkId);
  if (link && !link.hasAttribute("data-portfolio-gate-link")) {
    link.setAttribute("data-portfolio-gate-link", "");
    link.setAttribute("data-portfolio-href", PORTFOLIO_PAGE_URL);
  }
}

/** portfolio.html / project.html: block page until unlocked (same localStorage key). */
function requirePortfolioUnlock(onUnlocked) {
  ensurePortfolioGateModalBound();
  setPortfolioGateCallbacks({
    onSuccess: onUnlocked,
    onDismiss: () => {
      window.location.href = "index.html";
    },
  });

  if (isPortfolioUnlocked()) {
    onUnlocked();
    return;
  }

  const loading = getEl("portfolio-loading") || getEl("project-loading");
  const app = getEl("portfolio-app") || getEl("project-detail-app");
  if (loading) loading.hidden = true;
  if (app) app.hidden = true;
  openPortfolioGateModal();
}
