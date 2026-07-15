import os
import re

pages_dir = r"c:\Users\Asus\Desktop\site\public\pages"
files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]

tailwind_config_replacement = """<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#1a1c1a",
              secondary: "#a8895f",
              accent: "#a8895f",
              background: "#faf9f6",
              surface: "#faf9f6",
              "on-surface": "#1a1c1a",
              "on-surface-variant": "rgba(26,28,26,0.6)",
              "surface-container": "#efeeeb",
              "surface-container-low": "#f4f3f1",
              "surface-container-high": "#e9e8e5",
              "surface-container-highest": "#e3e2e0",
              "surface-container-lowest": "#ffffff",
              outline: "rgba(26,28,26,0.08)",
              "outline-variant": "rgba(26,28,26,0.15)"
            },
            fontFamily: {
              sans: ["Inter Tight", "sans-serif"],
              serif: ["Fraunces", "serif"],
              display: ["Fraunces", "serif"],
              body: ["Inter Tight", "sans-serif"]
            },
            spacing: {
              gutter: "24px",
              "margin-mobile": "16px",
              "margin-desktop": "32px",
              "section-gap": "clamp(96px, 12vw, 200px)"
            }
          }
        }
      }
    </script>"""

unified_footer = """<!-- Footer: Split Layout -->
<footer class="w-full border-t border-outline/10 py-16 px-margin-desktop bg-[#faf9f6]">
  <div class="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 font-sans text-sm text-[#1a1c1a]">
    <!-- Left: Real Address Block -->
    <div class="flex flex-col gap-4">
      <span class="font-serif text-lg font-light">Tatvarth Heights</span>
      <p class="text-on-surface-variant leading-relaxed">
        Aethelgard Pavilion<br/>
        12 Architecture Way, Suite 700<br/>
        Wellness District, HC 10080
      </p>
    </div>
    
    <!-- Center: Navigation Links -->
    <div class="flex flex-col gap-2 md:items-center">
      <span class="text-xs uppercase tracking-wider font-semibold text-on-surface-variant mb-2">Navigation</span>
      <a href="/" class="hover:text-secondary transition-colors">Home</a>
      <a href="/floors" class="hover:text-secondary transition-colors">Floors</a>
      <a href="/story" class="hover:text-secondary transition-colors">Story</a>
      <a href="/amenities" class="hover:text-secondary transition-colors">Amenities</a>
      <a href="/explorer" class="hover:text-secondary transition-colors">Explorer</a>
    </div>
    
    <!-- Right: Colophon & Year -->
    <div class="flex flex-col gap-4 md:items-end md:text-right">
      <span class="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Colophon</span>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Typography set in Fraunces &amp; Inter Tight.<br/>
        All structural designs subject to copyright.<br/>
        &copy; 2026 Tatvarth Heights. All rights reserved.
      </p>
    </div>
  </div>
</footer>"""

kinetic_sections = {
    "home.html": "RESIDENCES",
    "floors.html": "DIAGNOSTICS",
    "story.html": "PROVENANCE",
    "amenities.html": "REFINEMENTS",
    "explorer.html": "VOLUMES"
}

for filename in files:
    filepath = os.path.join(pages_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Inject fonts in head if not present
    font_link = '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;400;500&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">'
    if font_link not in content:
        # insert before </head>
        content = content.replace("</head>", f"{font_link}\n</head>")

    # 2. Replace tailwind config script
    config_regex = re.compile(r'<script id="tailwind-config">.*?</script>', re.DOTALL)
    content = config_regex.sub(tailwind_config_replacement, content)

    # 3. Clean up the body fonts/padding & strip gradients/shadows in code
    # We can replace body classes with a clean slate
    content = re.sub(r'<body class="[^"]*"', '<body class="bg-background text-on-surface font-sans antialiased"', content)

    # 4. Update the Footer
    # Find footer tag and replace it
    footer_regex = re.compile(r'<!-- Footer:.*?</footer\s*>', re.DOTALL | re.IGNORECASE)
    if footer_regex.search(content):
        content = footer_regex.sub(unified_footer, content)
    else:
        # try standard footer tag
        footer_tag_regex = re.compile(r'<footer.*?</footer\s*>', re.DOTALL | re.IGNORECASE)
        content = footer_tag_regex.sub(unified_footer, content)

    # 5. Insert kinetic typography section right before the footer
    kinetic_word = kinetic_sections[filename]
    kinetic_html = f"""
<section class="enh-kinetic-container select-none">
  <div class="enh-kinetic-text">{kinetic_word} {kinetic_word} {kinetic_word} {kinetic_word} {kinetic_word}</div>
</section>
"""
    if "enh-kinetic-container" not in content:
        # Insert before the footer
        content = content.replace("<!-- Footer: Split Layout -->", f"{kinetic_html}\n<!-- Footer: Split Layout -->")

    # 6. Apply data-cursor="view" to interactive elements (grid cards, articles, etc.)
    # We can add data-cursor="view" or "drag" to interactive visual layouts
    
    # 7. Redesign specific hero headers
    if filename == "home.html":
        # Overwrite header
        header_regex = re.compile(r'<!-- Hero Section: Split Screen -->.*?<!-- Editorial Intro: Magazine Layout with Overlap -->', re.DOTALL)
        home_hero = """<!-- Hero Section: Split Screen -->
<header class="relative w-full h-screen overflow-hidden bg-primary select-none flex flex-col justify-between p-12 md:p-24" data-cursor="view">
  <!-- Full-bleed background image -->
  <img class="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf5Ytc4nJIG5QNOUU_Mb4VISzx5cWOe-Qc66on5xmfH7uRPxFv2taRvchikJOae2PvbvMV_oDN8LkPyozoz3SXeUkNHh0-exfPICXzdkt5VRhrLPAcsneHYglHfBBvuU4XY9bXIaEY8r2nAznAAi2KIrob_IAY9sQtQqpuARYi95SgB_8LTtH1ijjSMfRqo09o3deT7CjNI85AEy0wNaW4vSNqx_PAf6me_KLMY3IhZkZUlybHpQ7A9RutwzI02pCpzQTzPLBJf4hU" alt="Tatvarth Heights Exterior" />
  
  <!-- Brand Mark Top Left -->
  <div class="relative z-10 self-start">
    <span class="font-serif text-2xl font-light tracking-tight text-white uppercase">Aethelgard</span>
  </div>
  
  <!-- Poetic Line & Scroll Cue Bottom Left -->
  <div class="relative z-10 mt-auto flex flex-col items-start gap-8">
    <h1 class="text-white font-serif font-light leading-tight text-left max-w-4xl" style="font-size: clamp(48px, 6vw, 96px); letter-spacing: -0.03em;">
      The Architecture of Healing.
    </h1>
    <div class="flex flex-col items-start gap-4">
      <span class="text-white/60 font-sans text-xs tracking-[0.24em] uppercase font-medium">Scroll</span>
      <div class="w-px h-12 bg-white/40 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-white animate-scroll-line" style="animation: scrollLineAnim 2s infinite ease-in-out;"></div>
      </div>
    </div>
  </div>
</header>
<!-- Editorial Intro: Magazine Layout with Overlap -->"""
        content = header_regex.sub(home_hero, content)

    elif filename == "story.html":
        # Let's check story.html hero
        header_regex = re.compile(r'<!-- Hero Section: The Vision -->.*?<!-- Section: Materiality & Form -->', re.DOTALL)
        story_hero = """<!-- Hero Section: The Vision -->
<header class="relative w-full h-screen overflow-hidden bg-primary select-none flex flex-col justify-between p-12 md:p-24" data-cursor="view">
  <img class="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbbv39X6qSQfsHRmKcL8nP_1r7FBzXOtvJP2YWqhj_fOF1xbDU137pkrAEIlylZgjqoFxJtQLYJfKp0ECzzL1xIUiiM2eQ46fT9ur4yj1uQZxsXTRDus_p86EGBLau_78UVmo9vIr2NmbJ7KT-ArSx-P9KiZ9ZvAEX3pOCmqgDA22qXmG2HJar3I0zhp0B_l_3YyIcLUVP39lYT9q-a7fHwx7jus90mkyKMyzgt3i259oaki7R4uh87xjtc7G5pBpnQsywuAF4zsUx" alt="Vision" />
  
  <div class="relative z-10 self-start">
    <span class="font-serif text-2xl font-light tracking-tight text-white uppercase">Provenance</span>
  </div>
  
  <div class="relative z-10 mt-auto flex flex-col items-start gap-8">
    <h1 class="text-white font-serif font-light leading-tight text-left max-w-4xl" style="font-size: clamp(48px, 6vw, 96px); letter-spacing: -0.03em;">
      A record of stillness in a frantic world.
    </h1>
    <div class="flex flex-col items-start gap-4">
      <span class="text-white/60 font-sans text-xs tracking-[0.24em] uppercase font-medium">Scroll</span>
      <div class="w-px h-12 bg-white/40 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-white animate-scroll-line" style="animation: scrollLineAnim 2s infinite ease-in-out;"></div>
      </div>
    </div>
  </div>
</header>
<!-- Section: Materiality & Form -->"""
        content = header_regex.sub(story_hero, content)

    elif filename == "floors.html":
        # Let's change floors.html top layout to look like an editorial header
        header_regex = re.compile(r'<main class="pt-32 min-h-screen">.*?<!-- Floor Explorer Interactive Section -->', re.DOTALL)
        floors_hero = """<main class="pt-32 min-h-screen">
<!-- Hero Section: Clinical Directory -->
<header class="relative w-full h-screen overflow-hidden bg-primary select-none flex flex-col justify-between p-12 md:p-24" data-cursor="view">
  <img class="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt-gH_PMIVvx7WVi1qkHCEnMrWtqJb7SzBnEcTpXdkz08b9F-T6V7SkOV4FfZixy0Us4aehnjUnyBBCLT8ZrnytrM9GWooSZW1a7BW8_b4Vy26_RuaaYlbYj-5TXylHy63WOBDl-T-Wz3ChP3Pr2hS3BQTAtUi7Yz55G0dDUzPCBd7mfypKQrsE4sLlAkwhXorTVl1MMeSRivikCYLKVPtbDXFmgwEsQF10_MzHPfoylJicwkl7XA9iysuhZixBmLlhHFCZP3-JEWk" alt="Clinical Directory" />
  
  <div class="relative z-10 self-start">
    <span class="font-serif text-2xl font-light tracking-tight text-white uppercase">Directory</span>
  </div>
  
  <div class="relative z-10 mt-auto flex flex-col items-start gap-8">
    <h1 class="text-white font-serif font-light leading-tight text-left max-w-4xl" style="font-size: clamp(48px, 6vw, 96px); letter-spacing: -0.03em;">
      Precision medicine meets holistic serenity.
    </h1>
    <div class="flex flex-col items-start gap-4">
      <span class="text-white/60 font-sans text-xs tracking-[0.24em] uppercase font-medium">Scroll</span>
      <div class="w-px h-12 bg-white/40 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-white animate-scroll-line" style="animation: scrollLineAnim 2s infinite ease-in-out;"></div>
      </div>
    </div>
  </div>
</header>
<!-- Floor Explorer Interactive Section -->"""
        content = header_regex.sub(floors_hero, content)

    elif filename == "amenities.html":
        # Let's change amenities.html top layout
        header_regex = re.compile(r'<header class="px-margin-desktop mb-section-gap flex flex-col items-start">.*?</header>', re.DOTALL)
        amenities_hero = """<header class="relative w-full h-screen overflow-hidden bg-primary select-none flex flex-col justify-between p-12 md:p-24" data-cursor="view">
  <img class="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKdF-qqUrRDTB1QaYZPspo_bq_-9cC6qB1lZZji37SAlNgbmQrjGsTShkbA5h2nkSqVqynak9NL7QqQrzU5nPdq_YXR4rSz-rFLaHak-789nuRKiCBaWwqjx-69RTlZQmLo_r9MLVSdRRRo9Y5jyM4Q0eWqTLXFyCxmfRnQZ6khxZM9lz_DvVIzcBBTTSGJDVWfwFBpPymgbw6FM3TsAy9ZU2ripKzkSAU9gFmzKWlS9h0Bh4mQ7JIrRrcxJU80Z0TNXc01sfWKAm9" alt="Refinements" />
  
  <div class="relative z-10 self-start">
    <span class="font-serif text-2xl font-light tracking-tight text-white uppercase">Refinements</span>
  </div>
  
  <div class="relative z-10 mt-auto flex flex-col items-start gap-8">
    <h1 class="text-white font-serif font-light leading-tight text-left max-w-4xl" style="font-size: clamp(48px, 6vw, 96px); letter-spacing: -0.03em;">
      Supporting complete human well-being.
    </h1>
    <div class="flex flex-col items-start gap-4">
      <span class="text-white/60 font-sans text-xs tracking-[0.24em] uppercase font-medium">Scroll</span>
      <div class="w-px h-12 bg-white/40 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-white animate-scroll-line" style="animation: scrollLineAnim 2s infinite ease-in-out;"></div>
      </div>
    </div>
  </div>
</header>"""
        content = header_regex.sub(amenities_hero, content)

    elif filename == "explorer.html":
        # Let's change explorer.html top layout
        header_regex = re.compile(r'<header class="px-margin-desktop max-md:px-margin-mobile mb-24 max-md:mb-12">.*?</header>', re.DOTALL)
        explorer_hero = """<header class="relative w-full h-screen overflow-hidden bg-primary select-none flex flex-col justify-between p-12 md:p-24" data-cursor="view">
  <img class="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnpSN5Bz8cealuNDyVHZoP4L-OI5IP-JOcJlxqA_wv-O1kcI62_VZZY32vQnUu3laqsqe_XnuuAMwjBJEjuVw26OCZTghTWyo6MqeO3NSLIQ1fpXGaM62eZzYfh8GpYXpOSBKkQktXvOxqzvJmiQ6ugAawdKWU4SlXoy-4XRdsSEsmIdNlgJJ-PAIluswlL7N3ANUCLTDqsvcYvicq0A5QhbLuwU4c8zYGmV8hBl4mgeC1yuTfN2-TADtJ9Sa7SyGrl-6Ar9pi5KS1" alt="Explorer" />
  
  <div class="relative z-10 self-start">
    <span class="font-serif text-2xl font-light tracking-tight text-white uppercase">Interactive</span>
  </div>
  
  <div class="relative z-10 mt-auto flex flex-col items-start gap-8">
    <h1 class="text-white font-serif font-light leading-tight text-left max-w-4xl" style="font-size: clamp(48px, 6vw, 96px); letter-spacing: -0.03em;">
      Map the volumes and dimensions.
    </h1>
    <div class="flex flex-col items-start gap-4">
      <span class="text-white/60 font-sans text-xs tracking-[0.24em] uppercase font-medium">Scroll</span>
      <div class="w-px h-12 bg-white/40 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-white animate-scroll-line" style="animation: scrollLineAnim 2s infinite ease-in-out;"></div>
      </div>
    </div>
  </div>
</header>"""
        content = header_regex.sub(explorer_hero, content)

    # 8. Clean up buttons, classes, colors
    # Make all buttons clean black/white
    content = content.replace("bg-primary text-on-primary font-label-caps uppercase transition-all hover:bg-secondary",
                              "border border-primary px-8 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-primary hover:text-white transition-all")
    content = content.replace("bg-primary text-on-primary font-label-technical text-label-technical px-8 py-3 hover:opacity-80 transition-opacity rounded-none",
                              "border border-primary px-8 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-primary hover:text-white transition-all")

    # Add custom cursor data to links/cards/draggable areas
    # Find links and add external/view attributes where needed
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Redesign applied successfully!")
