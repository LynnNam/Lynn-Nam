document.getElementById("year").textContent = new Date().getFullYear();

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

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

document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const note = document.getElementById("form-note");
  note.hidden = false;
  e.target.reset();
  setTimeout(() => {
    note.hidden = true;
  }, 4000);
});

const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const show = filter === "all" || category === filter;
      card.classList.toggle("hidden", !show);
    });
  });
});

const projectModal = document.getElementById("project-modal");
const sportsWatchCard = document.querySelector('[data-project="sports-watch"]');

const sportsWatchImages = [
  "images/sports-watch/01@2x.png",
  "images/sports-watch/02@2x.png",
  "images/sports-watch/03@2x.png",
  "images/sports-watch/04@2x.png",
];

function preloadSportsWatchImages() {
  sportsWatchImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function openProjectModal() {
  preloadSportsWatchImages();
  projectModal.hidden = false;
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  projectModal.querySelector(".project-modal-close").focus();
}

function closeProjectModal() {
  projectModal.hidden = true;
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  sportsWatchCard?.focus();
}

if (sportsWatchCard) {
  sportsWatchCard.addEventListener("mouseenter", preloadSportsWatchImages, { once: true });
  sportsWatchCard.addEventListener("focus", preloadSportsWatchImages, { once: true });
  sportsWatchCard.addEventListener("click", openProjectModal);
  sportsWatchCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProjectModal();
    }
  });
}

projectModal.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeProjectModal);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !projectModal.hidden) {
    closeProjectModal();
  }
});
