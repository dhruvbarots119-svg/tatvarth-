import os
import re

pages_dir = r"c:\Users\Asus\Desktop\site\public\pages"
files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]

for filename in files:
    filepath = os.path.join(pages_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Match <!-- TopNavBar --> and then everything up to the next </nav>
    # Note that re.DOTALL makes . match newlines
    new_content = re.sub(r'<!-- TopNavBar -->.*?</nav>\s*', '', content, flags=re.DOTALL)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

print("Top navigation bars removed successfully.")
