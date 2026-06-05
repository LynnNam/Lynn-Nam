#!/usr/bin/env python3
"""Compose realme Watch S5 cover — layout matched to design reference (2048×1210)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H = 2048, 1210
BG = ROOT / "assets/realme-cover-bg.jpg"
WATCH = ROOT / "assets/hero_white_cutout.png"
FONT = ROOT / "fonts/OPPOSans-4.0-GB2312.ttf"
OUT = ROOT / "assets/cover.jpg"
OUT_2X = ROOT / "assets/cover@2x.jpg"

# Watch cutout — +10% scale, center kept
WATCH_H = 704  # was 640
WATCH_X = 387  # recentered after scale-up
WATCH_Y = 208

# Right copy block (reference 1024×605 → 2×)
COPY_X = 1216
COPY_Y = 456
TITLE_SIZE = 118
DESC_SIZE = 28
DESC_GAP = 36  # px below title ink

# Bottom metadata
META_X = 348
META_VALUE_OFFSET = 72
META_LABEL_SIZE = 22
META_VALUE_SIZE = 24
META_START_Y = 1024
META_LINE_STEP = 34

# Footer — same baseline as first metadata row
FOOTER_SIZE = 24
FOOTER_REGION_LEFT = 1040
FOOTER_SHIFT_X = -700

# Sidebar
SIDE_X = 54
SIDE_Y = 80
SIDE_SIZE = 23
SIDE_ROTATE = -90  # vertical, flipped 180° from previous +90°

META_ROWS = [
    ("客户", "Realme"),
    ("角色", "工业设计"),
    ("状态", "已发布"),
    ("市场", "全球"),
]

DESC_TEXT = (
    "A Braun inspired smartwatch balancing functional clarity,\n"
    "youthful minimalism, and mass-production feasibility."
)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT), size)


def paste_watch(canvas: Image.Image, watch_src: Path) -> None:
    watch = Image.open(watch_src).convert("RGBA")
    scale = WATCH_H / watch.height
    target_w = int(watch.width * scale)
    watch = watch.resize((target_w, WATCH_H), Image.Resampling.LANCZOS)
    canvas.alpha_composite(watch, (WATCH_X, WATCH_Y))


def draw_sidebar(canvas: Image.Image, font: ImageFont.FreeTypeFont) -> None:
    label = Image.new("RGBA", (520, 64), (0, 0, 0, 0))
    ImageDraw.Draw(label).text(
        (0, 0),
        "★ Mass Production Project —",
        fill=(55, 55, 55, 255),
        font=font,
    )
    label = label.rotate(SIDE_ROTATE, expand=True)
    canvas.alpha_composite(label, (SIDE_X, SIDE_Y))


def ring_above_a(
    draw: ImageDraw.ImageDraw,
    anchor: tuple[int, int],
    font: ImageFont.FreeTypeFont,
) -> None:
    """Hollow circle centered above the “a” in Watch."""
    watch_bb = draw.textbbox(anchor, "Watch", font=font)
    w_bb = draw.textbbox(anchor, "W", font=font)
    wa_bb = draw.textbbox(anchor, "Wa", font=font)
    a_center_x = (w_bb[2] + wa_bb[2]) / 2
    ring_cy = watch_bb[1] - 16
    ring_r = 10
    draw.ellipse(
        (
            a_center_x - ring_r,
            ring_cy - ring_r,
            a_center_x + ring_r,
            ring_cy + ring_r,
        ),
        outline=(20, 20, 20, 255),
        width=3,
    )


def main() -> None:
    if not BG.exists():
        raise SystemExit(f"Missing background: {BG}")
    if not WATCH.exists():
        raise SystemExit(f"Missing watch cutout: {WATCH}")
    if not FONT.exists():
        raise SystemExit(f"Missing OPPO Sans: {FONT}")

    bg = Image.open(BG).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    canvas = bg.copy()

    paste_watch(canvas, WATCH)
    draw = ImageDraw.Draw(canvas)

    font_title = load_font(TITLE_SIZE)
    font_desc = load_font(DESC_SIZE)
    font_meta_k = load_font(META_LABEL_SIZE)
    font_meta_v = load_font(META_VALUE_SIZE)
    font_footer = load_font(FOOTER_SIZE)
    font_side = load_font(SIDE_SIZE)

    draw_sidebar(canvas, font_side)

    title_anchor = (COPY_X, COPY_Y)
    draw.text(title_anchor, "Watch S5", fill=(20, 20, 20, 255), font=font_title)
    ring_above_a(draw, title_anchor, font_title)

    title_bb = draw.textbbox(title_anchor, "Watch S5", font=font_title)
    desc_y = title_bb[3] + DESC_GAP
    draw.multiline_text(
        (COPY_X, desc_y),
        DESC_TEXT,
        fill=(90, 90, 90, 255),
        font=font_desc,
        spacing=8,
    )

    meta_y = META_START_Y
    for i, (label, value) in enumerate(META_ROWS):
        draw.text((META_X, meta_y), label, fill=(150, 150, 150, 255), font=font_meta_k)
        draw.text(
            (META_X + META_VALUE_OFFSET, meta_y),
            value,
            fill=(35, 35, 35, 255),
            font=font_meta_v,
        )
        if i == 0:
            footer = "Industrial Design/Smart Wearable /2025-2026"
            fb = draw.textbbox((0, 0), footer, font=font_footer)
            fw = fb[2] - fb[0]
            footer_x = FOOTER_REGION_LEFT + ((W - FOOTER_REGION_LEFT) - fw) // 2 + FOOTER_SHIFT_X
            draw.text(
                (footer_x, meta_y),
                footer,
                fill=(120, 120, 120, 255),
                font=font_footer,
            )
        meta_y += META_LINE_STEP

    rgb = canvas.convert("RGB")
    rgb.save(OUT, "JPEG", quality=92, optimize=True)
    rgb.save(OUT_2X, "JPEG", quality=92, optimize=True)
    print(f"Wrote {OUT} ({W}x{H})")
    print(f"  title ink: {title_bb[1]}–{title_bb[3]}")
    print(f"  desc starts: {desc_y}")


if __name__ == "__main__":
    main()
