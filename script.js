let config = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadData() {
  const configRes = await fetch("data/config.json");

  if (!configRes.ok) {
    throw new Error("无法加载数据文件");
  }

  config = await configRes.json();
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  const g = config.greeting;
  if (hour < 12) return g.morning;
  if (hour < 18) return g.afternoon;
  return g.evening;
}

function getDailyTip() {
  const tips = config.greeting.dailyTips;
  const dayIndex = new Date().getDate() % tips.length;
  return tips[dayIndex];
}

const WEATHER_CACHE_KEY = "lynn-os-shenzhen-weather";

const WMO_WEATHER_ZH = {
  0: "晴",
  1: "大部晴朗",
  2: "多云",
  3: "阴",
  45: "雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "毛毛雨",
  55: "大毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "阵雨",
  81: "强阵雨",
  82: "暴雨",
  95: "雷暴",
  96: "雷暴伴冰雹",
  99: "强雷暴伴冰雹",
};

let weatherMidnightTimer = null;
let weatherDateCheckTimer = null;

function getShanghaiDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config?.weather?.timezone || "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getWeatherText(weather) {
  const city = config.weather?.city || "深圳";
  if (!weather) return `${city} 加载中…`;
  return `${city} ${weather.temp}°C ${weather.desc}`;
}

function readWeatherCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.dateKey === getShanghaiDateKey()) return cached;
    return null;
  } catch {
    return null;
  }
}

function writeWeatherCache(weather) {
  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({
        dateKey: getShanghaiDateKey(),
        updatedAt: new Date().toISOString(),
        ...weather,
      })
    );
  } catch {
    /* ignore quota errors */
  }
}

async function fetchShenzhenWeather() {
  const w = config.weather;
  const params = new URLSearchParams({
    latitude: String(w.latitude),
    longitude: String(w.longitude),
    current: "temperature_2m,weather_code",
    timezone: w.timezone,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("天气接口请求失败");

  const data = await res.json();
  const current = data.current;
  const code = current.weather_code;
  const weather = {
    temp: Math.round(current.temperature_2m),
    desc: WMO_WEATHER_ZH[code] || "未知",
    code,
  };

  writeWeatherCache(weather);
  return weather;
}

async function getShenzhenWeather() {
  const cached = readWeatherCache();
  if (cached) {
    return { temp: cached.temp, desc: cached.desc, code: cached.code };
  }
  return fetchShenzhenWeather();
}

function formatWelcomeMeta(weather) {
  const tz = config?.weather?.timezone || "Asia/Shanghai";
  const now = new Date();
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const weekday = now.toLocaleDateString("zh-CN", { weekday: "long", timeZone: tz });
  return `${y}年${m}月${d}日 · ${weekday} · ${getWeatherText(weather)}`;
}

function updateWelcomeMeta(weather) {
  const el = document.getElementById("welcome-meta");
  if (el) el.textContent = formatWelcomeMeta(weather);
}

async function refreshShenzhenWeather() {
  try {
    const weather = await fetchShenzhenWeather();
    updateWelcomeMeta(weather);
  } catch (err) {
    console.warn("[Lynn OS] 天气更新失败", err);
    updateWelcomeMeta(null);
  }
}

function msUntilNextShanghaiMidnight() {
  const tz = config?.weather?.timezone || "Asia/Shanghai";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  const second = Number(parts.find((p) => p.type === "second").value);

  return ((24 - hour) * 3600 - minute * 60 - second) * 1000;
}

function scheduleWeatherMidnightRefresh() {
  if (weatherMidnightTimer) clearTimeout(weatherMidnightTimer);
  if (weatherDateCheckTimer) clearInterval(weatherDateCheckTimer);

  weatherMidnightTimer = setTimeout(() => {
    refreshShenzhenWeather();
    scheduleWeatherMidnightRefresh();
  }, msUntilNextShanghaiMidnight() + 500);

  weatherDateCheckTimer = setInterval(() => {
    if (!readWeatherCache()) refreshShenzhenWeather();
  }, 60 * 1000);
}

function renderBrand() {
  const s = config.site;
  document.getElementById("brand").innerHTML = `
    <a href="#welcome" class="brand-logo-link" aria-label="${escapeHtml(s.name)}">
      <img class="brand-logo" src="${escapeHtml(s.logo)}" alt="${escapeHtml(s.logoAlt || s.name)}" width="353" height="101" decoding="async">
    </a>
  `;
}

function renderSidebar() {
  const navItems = [
    { href: "#welcome", label: "首页" },
    { href: "#morning-brief", label: "Brief" },
    { href: "#design-workbench", label: "设计" },
    { href: "portfolio.html", label: "Portfolio" },
    { href: "#today", label: "Today" },
  ];

  document.getElementById("sidebar-nav").innerHTML = navItems
    .map((item) => `<a href="${item.href}">${item.label}</a>`)
    .join("");
}

function renderSectionHeader({ num, title, subtitle, id }) {
  return `
    <div class="section-header">
      <h2 class="section-title" id="${escapeHtml(id)}">
        <span class="section-num">${escapeHtml(num)}</span>
        <span class="section-label">${escapeHtml(title)}</span>
      </h2>
      ${subtitle ? `<p class="section-subtitle">${escapeHtml(subtitle)}</p>` : ""}
    </div>
  `;
}

function renderQuickLaunchHtml() {
  const items = config.quickLaunch || [];
  if (!items.length) return "";

  return `
    <div class="quick-launch" aria-label="快捷入口">
      <p class="welcome-tagline">This system was built with form, function, and feeling.</p>
      <div class="quick-launch-grid">
        ${items
          .map(
            (item) => `
          <a class="quick-launch-item btn-outline" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
            <span class="quick-launch-icon">
              <img src="${escapeHtml(item.logo)}" alt="" width="28" height="28" loading="lazy">
            </span>
            <span class="quick-launch-name">${escapeHtml(item.name)}</span>
          </a>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function heroArchiveLink(href, inner) {
  if (!href) return inner;
  return `<a class="hero-archive__link" href="${escapeHtml(href)}">${inner}</a>`;
}

function renderHeroArchive() {
  const h = config.hero;
  const portrait = config.site.heroPortrait;
  if (!h || !portrait) return "";

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

  return `
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
              alt="${escapeHtml(config.site.heroPortraitAlt || "")}"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
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

function renderWelcome() {
  const owner = config.site.owner;
  const greeting = getTimeGreeting();

  document.getElementById("welcome").innerHTML = `
    <div class="welcome-hero">
      <h1 class="welcome-greeting">${escapeHtml(greeting)}, ${escapeHtml(owner)}</h1>
      <p class="welcome-meta" id="welcome-meta">${escapeHtml(formatWelcomeMeta(null))}</p>
      ${renderHeroArchive()}
    </div>
    ${renderQuickLaunchHtml()}
    <p class="welcome-tip">${escapeHtml(getDailyTip())}</p>
  `;
}

async function initShenzhenWeather() {
  try {
    const weather = await getShenzhenWeather();
    updateWelcomeMeta(weather);
  } catch (err) {
    console.warn("[Lynn OS] 天气加载失败", err);
    updateWelcomeMeta(null);
  }
  scheduleWeatherMidnightRefresh();
}

function renderNewsCard(module) {
  const itemsHtml = module.items
    .map(
      (item) => `
      <li class="news-item">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
          <div class="news-title">${escapeHtml(item.title)}</div>
          <div class="news-meta">${escapeHtml(item.source)} · ${escapeHtml(item.time)}</div>
        </a>
      </li>
    `
    )
    .join("");

  return `
    <article class="card">
      <h3 class="card-title">${escapeHtml(module.title)}</h3>
      <p class="card-subtitle">${escapeHtml(module.subtitle)}</p>
      <ul class="news-list">${itemsHtml}</ul>
      <a class="card-more text-link" href="${escapeHtml(module.sourceUrl)}" target="_blank" rel="noopener noreferrer">查看更多 →</a>
    </article>
  `;
}

function renderResourceItem(item) {
  const iconHtml = item.logo
    ? `<span class="resource-icon"><img src="${escapeHtml(item.logo)}" alt="" width="32" height="32" loading="lazy"></span>`
    : "";

  return `
    <a class="resource-chip" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
      <div class="resource-head">
        <span class="resource-title">
          ${iconHtml}
          <span class="resource-name">${escapeHtml(item.name)}</span>
        </span>
        <span class="resource-category">${escapeHtml(item.category)}</span>
      </div>
      <span class="resource-note">${escapeHtml(item.note)}</span>
    </a>
  `;
}

function renderYoutubeCard(module) {
  const channelsHtml = module.channels
    .map(
      (ch) => `
      <li class="youtube-item">
        ${renderResourceItem(ch)}
      </li>
    `
    )
    .join("");

  return `
    <article class="card">
      <h3 class="card-title">${escapeHtml(module.title)}</h3>
      <p class="card-subtitle">${escapeHtml(module.subtitle)}</p>
      <ul class="youtube-list">${channelsHtml}</ul>
    </article>
  `;
}

function renderMorningBrief() {
  const brief = config.morningBrief;

  document.getElementById("morning-brief").innerHTML = `
    ${renderSectionHeader({
      num: "01",
      title: "Morning Brief",
      subtitle: "每日资讯速览 · Mock 数据",
      id: "brief-heading",
    })}
    <div class="brief-grid">
      ${renderNewsCard(brief.naverNews)}
      ${renderNewsCard(brief.wearableNews)}
      ${renderYoutubeCard(brief.youtube)}
    </div>
  `;
}

function renderDesignWorkbench() {
  const wb = config.designWorkbench;

  const groupsHtml = wb.groups
    .map((group) => {
      const items = group.items || group.links || [];
      return `
      <article class="card">
        <h3 class="card-title">${escapeHtml(group.title)}</h3>
        <div class="resource-grid">
          ${items.map((item) => renderResourceItem(item)).join("")}
        </div>
      </article>
    `;
    })
    .join("");

  document.getElementById("design-workbench").innerHTML = `
    ${renderSectionHeader({
      num: "02",
      title: "Design Workbench",
      subtitle: "设计工具与灵感入口",
      id: "workbench-heading",
    })}
    <div class="workbench-grid">${groupsHtml}</div>
  `;
}

function renderToday() {
  const today = config.today;

  const todosHtml = today.todos
    .map(
      (todo) => `
      <li class="todo-item${todo.done ? " done" : ""}" data-id="${escapeHtml(todo.id)}">
        <input type="checkbox" ${todo.done ? "checked" : ""} aria-label="${escapeHtml(todo.text)}">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
      </li>
    `
    )
    .join("");

  const linksHtml = today.links
    .map(
      (link) => `
      <li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.name)}</a></li>
    `
    )
    .join("");

  const remindersHtml = today.reminders
    .map(
      (r) => `
      <li class="reminder-item">
        <span class="reminder-time">${escapeHtml(r.time)}</span>
        <span class="reminder-text">${escapeHtml(r.text)}</span>
      </li>
    `
    )
    .join("");

  document.getElementById("today").innerHTML = `
    ${renderSectionHeader({
      num: "03",
      title: "Today",
      subtitle: "待办、链接与提醒",
      id: "today-heading",
    })}
    <div class="today-grid">
      <article class="card">
        <h3 class="card-title">今日待办</h3>
        <ul class="todo-list" id="todo-list">${todosHtml}</ul>
      </article>
      <article class="card">
        <h3 class="card-title">常用链接</h3>
        <ul class="quick-links">${linksHtml}</ul>
      </article>
      <article class="card">
        <h3 class="card-title">重要提醒</h3>
        <ul class="reminder-list">${remindersHtml}</ul>
      </article>
    </div>
  `;

  bindTodoEvents();
}

function bindTodoEvents() {
  document.querySelectorAll(".todo-item").forEach((item) => {
    const checkbox = item.querySelector("input");
    checkbox.addEventListener("change", () => {
      item.classList.toggle("done", checkbox.checked);
    });
    item.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      checkbox.checked = !checkbox.checked;
      item.classList.toggle("done", checkbox.checked);
    });
  });
}

function renderFooter() {
  document.getElementById("footer").textContent =
    `© ${new Date().getFullYear()} ${config.site.name} · Mock Data Only`;
}

function hideLoading() {
  const el = document.getElementById("app-loading");
  if (el) el.hidden = true;
}

function showError(message) {
  hideLoading();
  const app = document.querySelector(".app");
  if (app) app.hidden = true;
  const loading = document.getElementById("app-loading");
  if (loading) {
    loading.hidden = false;
    loading.className = "error-state";
    loading.innerHTML = `${escapeHtml(message)}<br>请通过本地服务器打开（如 VS Code Live Server），直接双击 HTML 无法读取 JSON。`;
  }
}

async function init() {
  try {
    await loadData();
    renderBrand();
    renderSidebar();
    renderWelcome();
    initShenzhenWeather();
    renderMorningBrief();
    renderDesignWorkbench();
    renderToday();
    renderFooter();
    document.title = config.site.name;
    hideLoading();
  } catch (err) {
    const isFileProtocol = window.location.protocol === "file:";
    const msg = isFileProtocol
      ? "当前为本地文件打开，浏览器禁止读取 JSON。"
      : err.message || "加载失败";
    showError(msg);
    console.error("[Lynn OS]", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
