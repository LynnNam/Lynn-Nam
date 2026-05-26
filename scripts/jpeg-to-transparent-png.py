#!/usr/bin/env python3
"""Convert black-background JPEG renders to PNG with alpha transparency."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".pip-packages"))

from PIL import Image

DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "images" / "exa-robotics"
BOARDS = sys.argv[2:] if len(sys.argv) > 2 else ["2", "3", "4", "5", "6", "7", "8"]

BLACK_MAX = 48
FADE_TO = 100


def alpha_for_lum(lum: float) -> int:
    if lum >= FADE_TO:
        return 255
    if lum <= BLACK_MAX:
        return 0
    t = (lum - BLACK_MAX) / (FADE_TO - BLACK_MAX)
    t = t * t * (3 - 2 * t)
    return int(255 * t)


def convert(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = (r + g + b) / 3
            px[x, y] = (r, g, b, alpha_for_lum(lum))
    im.save(path, format="PNG", optimize=True)
    print(f"PNG+alpha: {path.name} ({w}x{h})")


def main() -> None:
    for board in BOARDS:
        p = DIR / f"{board}.png"
        if not p.exists():
            print(f"skip missing {p}", file=sys.stderr)
            continue
        convert(p)


if __name__ == "__main__":
    main()
