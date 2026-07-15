import json
import re
import os

log_path = r"C:\Users\Asus\.gemini\antigravity-ide\brain\79a8dbe2-808a-4272-a2d8-332e2b013d45\.system_generated\logs\transcript.jsonl"
out_dir = r"c:\Users\Asus\Desktop\site\scratch\recovered"
os.makedirs(out_dir, exist_ok=True)

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def extract_file_content(view_content):
    """Extract the actual file content from a view_file response, removing line numbers."""
    # Find lines between the header and the footer
    content_lines = []
    in_content = False
    for line in view_content.split('\n'):
        if line.startswith('The following code has been modified'):
            in_content = True
            continue
        if line.startswith('The above content'):
            break
        if in_content:
            # Remove the line number prefix "N: " 
            match = re.match(r'^\d+: (.*)$', line)
            if match:
                content_lines.append(match.group(1))
            elif re.match(r'^\d+: $', line):
                content_lines.append('')
            elif line.strip() == '' and content_lines:
                content_lines.append('')
    return '\n'.join(content_lines)

# Extract home.html from step 170 (marked as "entire, complete file contents")
step = json.loads(lines[170])
content = step.get('content', '')
home_content = extract_file_content(content)
with open(os.path.join(out_dir, 'home.html'), 'w', encoding='utf-8') as f:
    f.write(home_content)
print(f"Recovered home.html: {len(home_content)} bytes")

# For the other files, I need to combine partial views or find them elsewhere
# Let me check steps 120 (story), 122 (floors), 128 (amenities), 150 (explorer) - all partials
# Let me also check if there are line ranges that together cover the whole file

target_files = {
    "story.html": [],
    "floors.html": [],
    "amenities.html": [],
    "explorer.html": []
}

for i, line in enumerate(lines):
    try:
        step = json.loads(line)
        content = step.get('content', '')
        step_type = step.get('type', '')
        
        if step_type == 'VIEW_FILE':
            for tf in target_files:
                if tf in content and 'public/pages' in content:
                    # Extract line range
                    showing_match = re.search(r'Showing lines (\d+) to (\d+)', content)
                    total_match = re.search(r'Total Lines: (\d+)', content)
                    total_bytes_match = re.search(r'Total Bytes: (\d+)', content)
                    entire = 'entire, complete file contents' in content
                    
                    start_line = int(showing_match.group(1)) if showing_match else 0
                    end_line = int(showing_match.group(2)) if showing_match else 0
                    total_lines = int(total_match.group(1)) if total_match else 0
                    total_bytes = int(total_bytes_match.group(1)) if total_bytes_match else 0
                    
                    target_files[tf].append({
                        'step': i,
                        'start': start_line,
                        'end': end_line,
                        'total_lines': total_lines,
                        'total_bytes': total_bytes,
                        'entire': entire,
                        'content': content
                    })
    except:
        continue

for tf, views in target_files.items():
    print(f"\n{tf}:")
    for v in views:
        print(f"  Step {v['step']}: lines {v['start']}-{v['end']} of {v['total_lines']} (total bytes: {v['total_bytes']}, entire: {v['entire']})")
