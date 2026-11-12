from PIL import Image, ImageDraw
from pathlib import Path
Path("icons").mkdir(exist_ok=True)
for s in (192, 512):
    im = Image.new("RGB", (s, s), "#0b1026"); d = ImageDraw.Draw(im)
    d.rounded_rectangle([s*0.04, s*0.04, s*0.96, s*0.96], radius=s*0.2, fill="#1a237e")
    d.polygon([(s*0.5, s*0.15), (s*0.68, s*0.5), (s*0.58, s*0.72), (s*0.42, s*0.72), (s*0.32, s*0.5)], fill="#ff6d00")
    d.ellipse([s*0.44, s*0.45, s*0.56, s*0.62], fill="#ffd740")
    im.save(f"icons/icon-{s}.png")
print("icônes OK")
