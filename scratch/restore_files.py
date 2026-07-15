import os
import shutil

src_dir = r"c:\Users\Asus\Desktop\INTERNSHIP\tatvarth 5"
dest_dir = r"c:\Users\Asus\Desktop\site\public\pages"

# Correct mapping based on structure analysis:
# - home.html -> home.html (has Hero Section: Split Screen, Editorial Intro)
# - story.html -> story.html 
# - amenities.html -> amenities.html
# - floor-explorer.html -> floors.html (has pt-32 main, Floor Explorer Interactive Section)
# - index.html -> explorer.html (the main overview/index page becomes explorer)
# 
# But wait: redesign_pages.py for explorer.html looks for:
#   <header class="px-margin-desktop max-md:px-margin-mobile mb-24 max-md:mb-12">
# index.html doesn't have that pattern. Let me check what explorer.html pattern the 
# redesign script expects vs what index.html has.

# Actually, looking more carefully at the redesign_pages.py:
# - The floors hero regex looks for: <main class="pt-32 min-h-screen"> ... <!-- Floor Explorer Interactive Section -->
#   This matches floor-explorer.html perfectly.
# - The explorer hero regex looks for: <header class="px-margin-desktop max-md:px-margin-mobile mb-24 max-md:mb-12">
#   index.html doesn't have this. But the regex might not match, and the script just keeps 
#   the original content without hero replacement.

# Let's use:
# floor-explorer.html -> floors.html
# index.html -> explorer.html (even if hero doesn't match, content is still valid)

file_mapping = {
    "home.html": "home.html",
    "story.html": "story.html",
    "amenities.html": "amenities.html",
    "floor-explorer.html": "floors.html",
    "index.html": "explorer.html",
}

for src_name, dest_name in file_mapping.items():
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    shutil.copy2(src_path, dest_path)
    print(f"Copied {src_name} -> {dest_name} ({os.path.getsize(dest_path)} bytes)")

print("\nStep 1 complete. Now adding enhance.css/js links to each file...")

# Step 2: Add enhance.css and enhance.js links if not present
for dest_name in file_mapping.values():
    dest_path = os.path.join(dest_dir, dest_name)
    with open(dest_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Add enhance.css before </head>
    if '/enhance.css' not in content:
        content = content.replace('</head>', '<link rel="stylesheet" href="/enhance.css">\n</head>')
        modified = True
    
    # Add enhance.js before </body>
    if '/enhance.js' not in content:
        content = content.replace('</body>', '<script type="module" src="/enhance.js"></script>\n</body>')
        modified = True
    
    if modified:
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Added enhance links to {dest_name}")

print("\nStep 2 complete. Now running redesign_pages.py...")
