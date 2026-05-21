import fs from "fs/promises";
import path from "path";

const ROOT = path.resolve("images/logos");
const CDN = "https://cdn.jsdelivr.net/npm/simple-icons@14/icons";

async function fetchIconPath(slug) {
  const res = await fetch(`${CDN}/${slug}.svg`);
  if (!res.ok) throw new Error(`${slug}: ${res.status}`);
  const svg = await res.text();
  const match = svg.match(/<path d="([^"]+)"/);
  if (!match) throw new Error(`${slug}: no path`);
  return match[1];
}

function wrapIcon(d, color, lightIcon = true) {
  const fill = lightIcon ? "#FFFFFF" : color;
  const bg = lightIcon ? color : "#F5F5F5";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img">
  <rect width="32" height="32" rx="8" fill="${bg}"/>
  <g transform="translate(4 4)" fill="${fill}">
    <path d="${d}"/>
  </g>
</svg>`;
}

function customIcon(inner, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img">
  <rect width="32" height="32" rx="8" fill="${color}"/>
  ${inner}
</svg>`;
}

const simple = [
  { file: "design/behance.svg", slug: "behance", color: "#1769FF" },
  { file: "design/pinterest.svg", slug: "pinterest", color: "#E60023" },
  { file: "wearables/apple.svg", slug: "apple", color: "#000000" },
  { file: "wearables/samsung.svg", slug: "samsung", color: "#1428A0" },
  { file: "wearables/garmin.svg", slug: "garmin", color: "#000000" },
  { file: "wearables/huawei.svg", slug: "huawei", color: "#CF0A2C" },
  { file: "wearables/xiaomi.svg", slug: "xiaomi", color: "#FF6900" },
];

const customs = [
  {
    file: "design/dezeen.svg",
    color: "#111111",
    inner: `<text x="16" y="21" text-anchor="middle" fill="#fff" font-family="Georgia,serif" font-size="11" font-weight="700">dz</text>`,
  },
  {
    file: "design/yanko.svg",
    color: "#E85D04",
    inner: `<text x="16" y="21" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="13" font-weight="800">Y</text>`,
  },
  {
    file: "design/core77.svg",
    color: "#2D2D2D",
    inner: `<text x="16" y="21" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="11" font-weight="700">77</text>`,
  },
  {
    file: "design/designboom.svg",
    color: "#000000",
    inner: `<path fill="#fff" d="M10 9h5.2c2.8 0 4.8 1.9 4.8 4.4 0 1.6-.8 3-2.1 3.8l3.1 5.3h-3.4l-2.7-4.6H13.2v4.6H10V9zm3.2 7.2h1.9c1.4 0 2.2-.8 2.2-2.1s-.8-2.1-2.2-2.1h-1.9v4.2z"/>`,
  },
  {
    file: "design/if-design.svg",
    color: "#E30613",
    inner: `<text x="16" y="21" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="12" font-weight="800">iF</text>`,
  },
  {
    file: "design/red-dot.svg",
    color: "#E30613",
    inner: `<circle cx="16" cy="16" r="7" fill="#fff"/><circle cx="16" cy="16" r="4.5" fill="#E30613"/>`,
  },
  {
    file: "wearables/amazfit.svg",
    color: "#00B2A9",
    inner: `<path fill="#fff" d="M11 10h10l-5 12-5-12zm0 14h10v2H11v-2z"/>`,
  },
  {
    file: "wearables/nothing.svg",
    color: "#000000",
    inner: `<circle cx="16" cy="16" r="9" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="14" r="1.2" fill="#fff"/><circle cx="16" cy="12" r="1.2" fill="#fff"/><circle cx="20" cy="14" r="1.2" fill="#fff"/><circle cx="14" cy="18" r="1.2" fill="#fff"/><circle cx="18" cy="18" r="1.2" fill="#fff"/>`,
  },
  {
    file: "wearables/coros.svg",
    color: "#FF6B00",
    inner: `<text x="16" y="20" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="7.5" font-weight="800" letter-spacing=".5">COROS</text>`,
  },
  {
    file: "wearables/oura.svg",
    color: "#1A1A1A",
    inner: `<circle cx="16" cy="16" r="8" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="16" r="4" fill="#fff"/>`,
  },
  {
    file: "wearables/whoop.svg",
    color: "#111111",
    inner: `<path fill="#fff" d="M10 11h12v2.2H10V11zm0 4.4h12v2.2H10v-2.2zm0 4.4h8.5v2.2H10v-2.2z"/><rect x="21" y="19.8" width="1.5" height="2.2" rx=".4" fill="#00D4FF"/>`,
  },
];

for (const dir of ["design", "wearables"]) {
  await fs.mkdir(path.join(ROOT, dir), { recursive: true });
}

for (const item of simple) {
  const d = await fetchIconPath(item.slug);
  const svg = wrapIcon(d, item.color);
  await fs.writeFile(path.join(ROOT, item.file), svg);
  console.log("ok", item.file);
}

for (const item of customs) {
  const svg = customIcon(item.inner, item.color);
  await fs.writeFile(path.join(ROOT, item.file), svg);
  console.log("ok", item.file);
}
