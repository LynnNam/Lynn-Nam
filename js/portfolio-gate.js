/** Portfolio password gate — shared by index.html and portfolio.html */

const PORTFOLIO_GATE_PASSWORD = "Lynn2026";
const PORTFOLIO_GATE_STORAGE_KEY = "lynn-portfolio-unlocked";
const PORTFOLIO_PAGE_URL = "portfolio.html";

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

function bindPortfolioGateModal(options = {}) {
  const form = getEl("portfolio-gate-form");
  const modal = getEl("portfolio-gate");
  const input = getEl("portfolio-gate-password");
  const err = getEl("portfolio-gate-error");
  if (!form || !modal) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input) return;
    if (input.value === PORTFOLIO_GATE_PASSWORD) {
      setPortfolioUnlocked();
      closePortfolioGateModal();
      options.onSuccess?.();
      return;
    }
    if (err) err.hidden = false;
    input.focus();
    input.select();
  });

  const dismiss = () => {
    closePortfolioGateModal();
    options.onDismiss?.();
  };

  modal.querySelectorAll("[data-portfolio-gate-close]").forEach((el) => {
    el.addEventListener("click", dismiss);
  });
  getEl("portfolio-gate-close")?.addEventListener("click", dismiss);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) dismiss();
  });
}

/** Homepage: gate the Portfolio nav link before redirecting. */
function initPortfolioGateLink(linkId = "portfolioProtectedLink") {
  const link = getEl(linkId);
  if (!link) return;

  bindPortfolioGateModal({
    onSuccess: () => {
      window.location.href = PORTFOLIO_PAGE_URL;
    },
  });

  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (isPortfolioUnlocked()) {
      window.location.href = PORTFOLIO_PAGE_URL;
      return;
    }
    openPortfolioGateModal();
  });
}

/** portfolio.html: block page until unlocked (same localStorage key). */
function requirePortfolioUnlock(onUnlocked) {
  bindPortfolioGateModal({
    onSuccess: onUnlocked,
    onDismiss: () => {
      window.location.href = "index.html";
    },
  });

  if (isPortfolioUnlocked()) {
    onUnlocked();
    return;
  }

  const loading = getEl("portfolio-loading");
  const app = getEl("portfolio-app");
  if (loading) loading.hidden = true;
  if (app) app.hidden = true;
  openPortfolioGateModal();
}
