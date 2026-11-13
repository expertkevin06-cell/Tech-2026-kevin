from PIL import Image, ImageDraw
from pathlib import Path

Path("icons").mkdir(exist_ok=True)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make(s):
    img = Image.new("RGB", (s, s), (0, 0, 0))
    d = ImageDraw.Draw(img)
    top, bot = (16, 26, 60), (6, 10, 28)
    for y in range(s):
        d.line([(0, y), (s, y)], fill=lerp(top, bot, y / s))
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=255)
    bg = img.copy()
    img = Image.new("RGB", (s, s), (3, 5, 14))
    img.paste(bg, (0, 0), mask)
    d = ImageDraw.Draw(img)
    sc = s / 100.0
    P = lambda pts: [(x * sc, y * sc) for x, y in pts]
    B = lambda x0, y0, x1, y1: [x0 * sc, y0 * sc, x1 * sc, y1 * sc]
    # halo + lignes de vitesse
    d.ellipse(B(14, 68, 90, 80), fill=(0, 60, 90))
    for yy in (50, 57, 64):
        d.line([(4 * sc, yy * sc), (16 * sc, yy * sc)], fill=(0, 229, 255), width=max(1, int(sc * 1.4)))
    # carrosserie sportive
    d.polygon(P([(12, 66), (14, 58), (29, 55), (36, 47), (57, 45), (72, 55), (89, 58), (91, 66)]), fill=(225, 49, 38))
    # vitrage
    d.polygon(P([(38, 54), (45, 48), (56, 48), (64, 54)]), fill=(20, 45, 66))
    # aileron
    d.polygon(P([(86, 50), (94, 48), (94, 51), (87, 53)]), fill=(142, 15, 31))
    # phares / feux
    d.polygon(P([(87, 60), (91, 61), (91, 64), (87, 63)]), fill=(255, 243, 176))
    d.polygon(P([(12, 60), (15, 59), (15, 63), (12, 63)]), fill=(255, 23, 68))
    # roues + jantes
    for wx in (28, 72):
        d.ellipse(B(wx - 8, 58, wx + 8, 74), fill=(10, 13, 22))
        d.ellipse(B(wx - 4, 62, wx + 4, 70), fill=(159, 178, 200))
        d.ellipse(B(wx - 1.5, 64.5, wx + 1.5, 67.5), fill=(10, 13, 22))
    # soulignement néon
    d.rectangle(B(16, 70, 88, 72), fill=(0, 229, 255))
    return img

for size in (192, 512):
    make(size).save(f"icons/icon-{size}.png")
print("icônes sport OK")
