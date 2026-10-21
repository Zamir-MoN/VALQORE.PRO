import sys
from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Whiteness isolates the white steam logo from the blue/black background
            whiteness = min(r, g, b)
            
            # Blueness isolates the blue background
            blueness = max(0, b - max(r, g))
            
            # Base color is white
            out_r, out_g, out_b = 255, 255, 255
            out_a = whiteness
            
            # We add a subtle E6FF00 (230, 255, 0) accent using the blue background
            if blueness > 20 and whiteness < 100:
                out_r, out_g, out_b = 230, 255, 0
                out_a = int(blueness * 0.15) # Very subtle glow
                
            pixels[x, y] = (out_r, out_g, out_b, min(255, out_a))

    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

if __name__ == "__main__":
    process_image("/home/ubuntu/VALQORE_PRO/frontend/public/steam-logo.png", "/home/ubuntu/VALQORE_PRO/frontend/public/steam-logo-transparent.png")
