from PIL import Image
import os

wa = r"C:\Users\thiag\.cursor\projects\d-Axellion\assets\WhatsApp_Image_2026-10-27_at_16.53.48-02963f84-1979-4565-ba18-576f132757ea.jpg"
src = wa if os.path.exists(wa) else r"D:\Axellion\PROJETOS\lucia-site\public\logo.jpg"

img = Image.open(src).convert("RGBA")
w, h = img.size
px = img.load()

samples = [
    px[2, 2],
    px[w - 3, 2],
    px[2, h - 3],
    px[w - 3, h - 3],
    px[w // 2, 2],
    px[2, h // 2],
]
avg = [sum(c[i] for c in samples) // len(samples) for i in range(3)]
print("cream", avg, "#%02x%02x%02x" % tuple(avg))

# Soft chroma key on cream
thresh = 28
out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
op = out.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        dist = abs(r - avg[0]) + abs(g - avg[1]) + abs(b - avg[2])
        if dist <= thresh * 3:
            # feather near edge of threshold
            if dist <= thresh * 2:
                continue
            alpha = int(255 * (dist - thresh * 2) / max(1, thresh))
            op[x, y] = (r, g, b, alpha)
        else:
            op[x, y] = (r, g, b, 255)

# Trim transparent margins
bbox = out.getbbox()
if bbox:
    pad = 8
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad)
    y1 = min(h, y1 + pad)
    out = out.crop((x0, y0, x1, y1))

path = r"D:\Axellion\PROJETOS\lucia-site\public\logo.png"
out.save(path, "PNG", optimize=True)
print("saved", path, out.size)
