import os
from PIL import Image
from tqdm import tqdm

# ---------------- CONFIG ----------------

BASE_PATH = "C:\\Users\\bagam\\Desktop\\My\\My Projects\\Gift\\gift\\public\\images"              # Project root
REPLACE_ORIGINAL = True     # True = overwrite, False = keep original
MAX_WIDTH = 900              # Resize width
JPEG_QUALITY = 70            # Image quality (KB friendly)
# --------------------------------------


def optimize_image(image_path):
    img = Image.open(image_path).convert("RGB")
    w, h = img.size

    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / w
        img = img.resize(
            (int(w * ratio), int(h * ratio)),
            Image.LANCZOS
        )

    if REPLACE_ORIGINAL:
        out_path = image_path
    else:
        name, _ = os.path.splitext(image_path)
        out_path = f"{name}_optimized.jpg"

    img.save(
        out_path,
        format="JPEG",
        quality=JPEG_QUALITY,
        optimize=True
    )


def main():
    chapter_dirs = [
        d for d in os.listdir(BASE_PATH)
        if d.lower().startswith("ch")
    ]

    images = []
    for ch in chapter_dirs:
        ch_path = os.path.join(BASE_PATH, ch)
        print("down",ch_path)
        for f in os.listdir(ch_path):
            if f.lower().startswith("i") and f.lower().endswith(".png"):
                images.append(os.path.join(ch_path, f))
    for img_path in tqdm(images, desc="Optimizing Images"):
        try:
            optimize_image(img_path)
        except Exception as e:
            print(f"❌ Failed: {img_path} → {e}")

    print("✅ Image optimization completed!")


if __name__ == "__main__":
    main()
