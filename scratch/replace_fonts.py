import os
import glob

# Paths to search
html_files = glob.glob('c:/Users/Asus/Desktop/site/public/pages/*.html')
css_files = glob.glob('c:/Users/Asus/Desktop/site/public/*.css')
tsx_files = glob.glob('c:/Users/Asus/Desktop/site/src/components/*.tsx')

all_files = html_files + css_files + tsx_files

replacements = [
    ('sans: ["Inter Tight", "sans-serif"]', 'sans: ["Fraunces", "serif"]'),
    ('body: ["Inter Tight", "sans-serif"]', 'body: ["Fraunces", "serif"]'),
    ('font-family: \'Inter Tight\', sans-serif;', 'font-family: \'Fraunces\', serif;'),
    ('fontFamily: "\'Inter Tight\', sans-serif"', 'fontFamily: "\'Fraunces\', serif"'),
    ('Typography set in Fraunces &amp; Inter Tight.<br/>', 'Typography set in Fraunces.<br/>'),
    # For any stray Inter Tight references
    ('Inter Tight', 'Fraunces'),
    ('sans-serif', 'serif')
]

for file_path in all_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # First, let's fix the tailwind config and specific CSS rules
    new_content = new_content.replace('sans: ["Inter Tight", "sans-serif"]', 'sans: ["Fraunces", "serif"]')
    new_content = new_content.replace('body: ["Inter Tight", "sans-serif"]', 'body: ["Fraunces", "serif"]')
    new_content = new_content.replace('font-family: \'Inter Tight\', sans-serif;', 'font-family: \'Fraunces\', serif;')
    new_content = new_content.replace('fontFamily: "\'Inter Tight\', sans-serif"', 'fontFamily: "\'Fraunces\', serif"')
    new_content = new_content.replace('Typography set in Fraunces &amp; Inter Tight.<br/>', 'Typography set in Fraunces.<br/>')
    
    # In enhance.css, let's make sure we don't have stray sans-serif for Fraunces
    if file_path.endswith('.css'):
        new_content = new_content.replace('font-family: \'Inter Tight\', sans-serif;', 'font-family: \'Fraunces\', serif;')
        new_content = new_content.replace('\'Inter Tight\', sans-serif', '\'Fraunces\', serif')

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

print("Done.")
