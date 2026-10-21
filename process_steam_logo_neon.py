import sys
from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Use the red channel to isolate the white logo from the blue/black background.
            # The blue background and black corners have very low red values.
            # The white logo has a high red value.
            alpha = r
            
            # Set the pixel to pure #E6FF00 with the calculated alpha
            pixels[x, y] = (230, 255, 0, alpha)

    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

if __name__ == "__main__":
    process_image("/home/ubuntu/VALQORE_PRO/frontend/public/steam-logo.png", "/home/ubuntu/VALQORE_PRO/frontend/public/steam-logo-neon.png")
