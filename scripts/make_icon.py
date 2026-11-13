from PIL import Image, ImageDraw
from pathlib import Path

Path("icons").mkdir(exist_ok=True)

TOP, BOT = (16, 26, 60), (6, 10, 28)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make(s, maskable=False):
    img = Image.new("RGB", (s, s), (3, 5, 14))
    d = ImageDraw.Draw(img)
    for y in range(s):
        d.line([(0, y), (s, y)], fill=lerp(TOP, BOT, y / s))
    if not maskable:
        mask = Image.new("L", (s, s), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=255)
        bg = img.copy()
        img = Image.new("RGB", (s, s), (3, 5, 14))
        img.paste(bg, (0, 0), mask)
        d = ImageDraw.Draw(img)
    sc = s / 100.0
    if maskable:
        f = 0.62  # safe-zone : contenu dans les 62% centraux
        def P(pts): return [((50 + (x - 50) * f) * sc, (54 + (y - 56) * f) * sc) for x, y in pts]
        def B(x0, y0, x1, y1): return [(50 + (x0 - 50) * f) * sc, (54 + (y0 - 56) * f) * sc,
                                       (50 + (x1 - 50) * f) * sc, (54 + (y1 - 56) * f) * sc]
    else:
        def P(pts): return [(x * sc, y * sc) for x, y in pts]
        def B(x0, y0, x1, y1): return [x0 * sc, y0 * sc, x1 * sc, y1 * sc]
    # halo + lignes de vitesse
    d.ellipse(B(14, 68, 90, 80), fill=(0, 60, 90))
    for yy in (50, 57, 64):
        d.line([(P([(4, yy)])[0], P([(4, yy)])[1]), (P([(16, yy)])[0], P([(16, yy)])[1])],
               fill=(0, 229, 255), width=max(1, int(sc * 1.4)))
    # carrosserie sportive
    d.polygon(P([(12, 66), (14, 58), (29, 55), (36, 47), (57, 45), (72, 55), (89, 58), (91, 66)]), fill=(225, 49, 38))
    d.polygon(P([(38, 54), (45, 48), (56, 48), (64, 54)]), fill=(20, 45, 66))
    d.polygon(P([(86, 50), (94, 48), (94, 51), (87, 53)]), fill=(142, 15, 31))
    d.polygon(P([(87, 60), (91, 61), (91, 64), (87, 63)]), fill=(255, 243, 176))
    d.polygon(P([(12, 60), (15, 59), (15, 63), (12, 63)]), fill=(255, 23, 68))
    for wx in (28, 72):
        d.ellipse(B(wx - 8, 58, wx + 8, 74), fill=(10, 13, 22))
        d.ellipse(B(wx - 4, 62, wx + 4, 70), fill=(159, 178, 200))
        d.ellipse(B(wx - 1.5, 64.5, wx + 1.5, 67.5), fill=(10, 13, 22))
    d.rectangle(B(16, 70, 88, 72), fill=(0, 229, 255))
    return img

for size in (192, 512):
    make(size, maskable=False).save(f"icons/icon-{size}.png")
    make(size, maskable=True).save(f"icons/icon-{size}-maskable.png")
print("icônes PWABuilder OK (192/512 + maskable)")
