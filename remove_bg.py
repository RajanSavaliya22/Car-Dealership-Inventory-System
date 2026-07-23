import urllib.request
import io
from PIL import Image

url = "https://p7.hiclipart.com/preview/15/96/842/5bc4954ae4996.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
img_data = response.read()

img = Image.open(io.BytesIO(img_data))
print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")

img = img.convert("RGBA")
datas = img.getdata()
new_data = []

# Get background color from top-left corner
bg_color = datas[0]
threshold = 30 # tolerance

for item in datas:
    # If pixel is close to background color, make it transparent
    if abs(item[0] - bg_color[0]) < threshold and \
       abs(item[1] - bg_color[1]) < threshold and \
       abs(item[2] - bg_color[2]) < threshold:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save("frontend/public/transparent_car.png", "PNG")
print("Saved to frontend/public/transparent_car.png")
