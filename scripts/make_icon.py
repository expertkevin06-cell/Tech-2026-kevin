from PIL import Image, ImageDraw
from pathlib import Path

Path("icons").mkdir(exist_ok=True)

for s in (192, 512):
    im = Image.new("RGB", (s, s), "#070b1e")
    d = ImageDraw.Draw(im)

    d.rounded_rectangle(
        [int(s * 0.04), int(s * 0.04), int(s * 0.96), int(s * 0.96)],
        radius=int(s * 0.20),
        fill="#1a237e"
    )

    d.polygon(
        [
            (int(s * 0.50), int(s * 0.15)),
            (int(s * 0.68), int(s * 0.50)),
            (int(s * 0.58), int(s * 0.72)),
            (int(s * 0.42), int(s * 0.72)),
            (int(s * 0.32), int(s * 0.50)),
        ],
        fill="#ff6d00"
    )

    d.ellipse(
        [int(s * 0.44), int(s * 0.45), int(s * 0.56), int(s * 0.62)],
        fill="#ffd740"
    )

    im.save(f"icons/icon-{s}.png")

print("icônes OK")
