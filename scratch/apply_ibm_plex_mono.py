import glob
import re

# ─── 1. Update enhance.css ───
css_path = 'c:/Users/Asus/Desktop/site/public/enhance.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the Google Fonts import to load IBM Plex Mono with full weight range
css = re.sub(
    r"@import url\('https://fonts\.googleapis\.com/css2\?[^']+'\);",
    "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');",
    css
)

# Replace ALL font-family declarations (except Material Symbols)
css = re.sub(
    r"font-family:\s*'(?!Material)[^']+',\s*\w+(\s*!important)?;",
    lambda m: "font-family: 'IBM Plex Mono', monospace" + (" !important" if m.group(1) else "") + ";",
    css
)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print(f"Updated {css_path}")

# ─── 2. Update all HTML pages ───
html_files = glob.glob('c:/Users/Asus/Desktop/site/public/pages/*.html')

for html_path in html_files:
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Replace Tailwind fontFamily config — set all families to IBM Plex Mono
    content = re.sub(
        r'(fontFamily:\s*\{)[^}]+\}',
        r'''\1
              sans: ["IBM Plex Mono", "monospace"],
              serif: ["IBM Plex Mono", "monospace"],
              display: ["IBM Plex Mono", "monospace"],
              body: ["IBM Plex Mono", "monospace"],
              mono: ["IBM Plex Mono", "monospace"],
              "label-technical": ["IBM Plex Mono", "monospace"]
            }''',
        content
    )

    # Replace body font-family (e.g. Plus Jakarta Sans)
    content = re.sub(
        r"font-family:\s*'(?!Material)[^']+',\s*sans-serif;",
        "font-family: 'IBM Plex Mono', monospace;",
        content
    )

    # Replace all Google Fonts links (except Material Symbols) with IBM Plex Mono
    # First, remove redundant font links that don't include Material Symbols
    content = re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2\?family=(?!Material)[^"]*" rel="stylesheet"/?>\n?',
        '',
        content
    )
    # Also handle &amp; encoded versions
    content = re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2\?family=(?!Material)[^"]*" rel="stylesheet"/?>\r?\n?',
        '',
        content
    )

    # Add IBM Plex Mono import right after the preconnect links or before first Material Symbols link
    ibm_link = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet"/>'
    
    if 'IBM+Plex+Mono:ital,wght@0,100' not in content:
        # Insert before the first Material Symbols link
        content = re.sub(
            r'(<link href="https://fonts\.googleapis\.com/css2\?family=Material)',
            ibm_link + '\n' + r'\1',
            content,
            count=1
        )

    if content != original:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {html_path}")

# ─── 3. Update PageFrame.tsx ───
tsx_path = 'c:/Users/Asus/Desktop/site/src/components/PageFrame.tsx'
with open(tsx_path, 'r', encoding='utf-8') as f:
    content = f.read()

original = content
content = content.replace(
    "fontFamily: \"'Inter Tight', sans-serif\"",
    "fontFamily: \"'IBM Plex Mono', monospace\""
)
content = content.replace(
    "fontFamily: \"'Fraunces', serif\"",
    "fontFamily: \"'IBM Plex Mono', monospace\""
)

if content != original:
    with open(tsx_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {tsx_path}")

print("\nDone! IBM Plex Mono is now the only font across the entire site.")
