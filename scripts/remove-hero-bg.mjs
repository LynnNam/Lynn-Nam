import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "images");

const files = ["lynn-hero-portrait.png", "lynn-hero.png"];

/** Cream/white background → transparent; keep dark ASCII strokes */
async function keyToAlpha(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = out[o];
    const g = out[o + 1];
    const b = out[o + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

    let alpha = 255;
    if (lum > 235) alpha = 0;
    else if (lum > 200) alpha = Math.round(((245 - lum) / 45) * 255);
    else if (lum > 175 && sat < 0.12) alpha = Math.round(((220 - lum) / 45) * 200);

    if (alpha < 255 && lum < 120) {
      alpha = Math.max(alpha, Math.min(255, Math.round(80 + lum * 1.2)));
    }

    out[o + 3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log("ok", path.basename(outputPath));
}

for (const name of files) {
  const input = path.join(root, name);
  try {
    await keyToAlpha(input, input);
  } catch (err) {
    console.warn("skip", name, err.message);
  }
}
