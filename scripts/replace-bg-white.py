#!/usr/bin/env python3
"""Replace near-black studio backgrounds with solid white (#ffffff)."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".pip-packages"))

from PIL import Image

BLACK_MAX = 48
FADE_TO = 100


def blend_white(r: int, g: int, b: int, lum: float) -> tuple[int, int, int]:
    if lum >= FADE_TO:
        return r, g, b
    if lum <= BLACK_MAX:
        return 255, 255, 255
    t = (lum - BLACK_MAX) / (FADE_TO - BLACK_MAX)
    t = t * t * (3 - 2 * t)
    return (
        int(r * t + 255 * (1 - t)),
        int(g * t + 255 * (1 - t)),
        int(b * t + 255 * (1 - t)),
    )


def convert(path: Path) -> None:
    im = Image.open(path).convert("RGB")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            lum = (r + g + b) / 3
            px[x, y] = blend_white(r, g, b, lum)
    im.save(path, format="PNG", optimize=True)
    print(f"white bg: {path}")


def main() -> None:
    for p in map(Path, sys.argv[1:]):
        if p.is_file():
            convert(p)


if __name__ == "__main__":
    main()
