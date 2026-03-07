import os
import glob
from pathlib import Path

def generate_placeholder_svg(png_path):
    """Generates a placeholder SVG for a given PNG path."""
    svg_path = png_path.with_suffix('.svg')
    
    # Extract filename without extension for the placeholder text
    name = png_path.stem
    
    # Basic SVG template with a bounding box and text
    # Ready to be replaced by actual animated vectors
    svg_content = f"""<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6" />
  <!-- Placeholder for animation of {name} -->
  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#374151" text-anchor="middle" dominant-baseline="middle">
    SVG Animation Placeholder: {name}
  </text>
  <style>
    /* Add animation keyframes here */
    /* Example: @keyframes bounce {{ 0%, 100% {{ transform: translateY(0); }} 50% {{ transform: translateY(-20px); }} }} */
  </style>
</svg>"""

    with open(svg_path, 'w') as f:
        f.write(svg_content)
    
    return svg_path

def main():
    # Directories containing our current PNG assets
    directories_to_scan = [
        "src/docs",
        "src/assets"
    ]
    
    project_root = Path(__file__).parent
    
    total_svgs_created = 0
    
    for relative_dir in directories_to_scan:
        search_path = project_root / relative_dir
        if not search_path.exists():
            continue
            
        print(f"Scanning {search_path} for PNG files...")
        
        # Find all pngs
        png_files = list(search_path.glob("*.png"))
        
        for png_file in png_files:
            try:
                svg_path = generate_placeholder_svg(png_file)
                print(f"Created SVG: {svg_path.relative_to(project_root)}")
                total_svgs_created += 1
            except Exception as e:
                print(f"Failed to create SVG for {png_file.name}: {e}")
                
    print(f"\nDone! Generated {total_svgs_created} SVG equivalents ready for animation.")

if __name__ == "__main__":
    main()
