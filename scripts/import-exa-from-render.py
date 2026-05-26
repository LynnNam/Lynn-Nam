#!/usr/bin/env python3
"""Import high-res renders from Desktop 렌더링 folder into images/exa-robotics/."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".pip-packages"))

from PIL import Image

DEST = ROOT / "images" / "exa-robotics"
# Board 1 = hero + gallery first image — do not overwrite via this script.
MAP = [
    ("3", "KakaoTalk_Photo_2021-10-08-15-02-37 001.png"),
    ("4", "KakaoTalk_Photo_2021-10-08-15-02-12 001.png"),
    ("5", "KakaoTalk_Photo_2021-10-08-15-02-37 002.png"),
    ("6", "KakaoTalk_Photo_2021-10-08-15-02-37 003.png"),
    ("7", "KakaoTalk_Photo_2021-10-08-15-02-13 002.png"),
    ("8", "KakaoTalk_Photo_2021-10-08-15-02-13 003.png"),
]


def find_render_dir() -> Path:
    desktop = Path.home() / "Desktop"
    for child in desktop.iterdir():
        if not child.is_dir():
            continue
        if (child / "KakaoTalk_Photo_2021-10-08-15-02-13 002.pdf").exists():
            return child
    raise FileNotFoundError("렌더링 folder not found on Desktop")


def flatten_white(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGB", im.size, (255, 255, 255))
    bg.paste(im, mask=im.split()[3])
    dest.parent.mkdir(parents=True, exist_ok=True)
    bg.save(dest, format="PNG", optimize=True)
    print(f"{dest.name} <- {src.name} ({im.size[0]}x{im.size[1]})")


def main() -> None:
    render_dir = find_render_dir()
    print(f"Source: {render_dir}")
    for board, fname in MAP:
        flatten_white(render_dir / fname, DEST / f"{board}.png")


if __name__ == "__main__":
    main()
