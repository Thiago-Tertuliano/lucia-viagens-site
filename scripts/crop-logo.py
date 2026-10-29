from PIL import Image

src = r"D:\Axellion\PROJETOS\lucia-site\public\logo.jpg"
# Prefer the WhatsApp original if present
wa = r"C:\Users\thiag\.cursor\projects\d-Axellion\assets\WhatsApp_Image_2026-10-27_at_16.53.48-02963f84-1979-4565-ba18-576f132757ea.jpg"
import os

if os.path.exists(wa):
    src = wa

img = Image.open(src).convert("RGBA")
w, h = img.size
px = img.load()

samples = [
    px[2, 2],
    px[w - 3, 2],
    px[2, h - 3],
    px[w - 3, h - 3],
    px[w // 2, 2],
    px[w // 2, h - 3],
]
avg = tuple(sum(c[i] for c in samples) // len(samples) for i in range(3))
print("size", w, h)
print("cream_rgb", avg)
print("cream_hex", "#%02x%02x%02x" % avg)

thresh = 20

def is_bg(p):
    return (
        abs(p[0] - avg[0]) <= thresh
        and abs(p[1] - avg[1]) <= thresh
        and abs(p[2] - avg[2]) <= thresh
    )

minx, miny, maxx, maxy = w, h, 0, 0
for y in range(h):
    for x in range(w):
        if not is_bg(px[x, y]):
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)

pad = 10
minx = max(0, minx - pad)
miny = max(0, miny - pad)
maxx = min(w - 1, maxx + pad)
maxy = min(h - 1, maxy + pad)
print("bbox", minx, miny, maxx, maxy)

cropped = img.crop((minx, miny, maxx + 1, maxy + 1))
cream = (*avg, 255)
out = Image.new("RGBA", cropped.size, cream)
cp = cropped.load()
op = out.load()
cw, ch = cropped.size
for y in range(ch):
    for x in range(cw):
        p = cp[x, y]
        op[x, y] = cream if is_bg(p) else p

out_rgb = out.convert("RGB")
out_rgb.save(r"D:\Axellion\PROJETOS\lucia-site\public\logo.png", "PNG", optimize=True)
out_rgb.save(r"D:\Axellion\PROJETOS\lucia-site\public\logo.jpg", "JPEG", quality=94)
print("saved", out.size)
