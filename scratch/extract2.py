import json
import re
import os

out_dir = r"c:\Users\Asus\Desktop\site\scratch\recovered"
os.makedirs(out_dir, exist_ok=True)

def extract_file_content(view_content):
    """Extract the actual file content from a view_file response, removing line numbers."""
    content_lines = []
    in_content = False
    for line in view_content.split('\n'):
        if line.startswith('The following code has been modified'):
            in_content = True
            continue
        if line.startswith('The above content'):
            break
        if in_content:
            match = re.match(r'^(\d+): (.*)$', line)
            if match:
                content_lines.append(match.group(2))
            else:
                match2 = re.match(r'^(\d+): $', line)
                if match2:
                    content_lines.append('')
    return '\n'.join(content_lines)

# ═══ Recover explorer.html from steps 150 + 152 of 79a8dbe2 ═══
log_path = r"C:\Users\Asus\.gemini\antigravity-ide\brain\79a8dbe2-808a-4272-a2d8-332e2b013d45\.system_generated\logs\transcript.jsonl"
with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

step150 = json.loads(lines[150])
step152 = json.loads(lines[152])

part1 = extract_file_content(step150['content'])
part2 = extract_file_content(step152['content'])

explorer_content = part1 + '\n' + part2
with open(os.path.join(out_dir, 'explorer.html'), 'w', encoding='utf-8') as f:
    f.write(explorer_content)
print(f"Recovered explorer.html: {len(explorer_content)} bytes (part1: {len(part1)}, part2: {len(part2)})")

# ═══ Check current conversation for more complete views ═══
log_path2 = r"C:\Users\Asus\.gemini\antigravity-ide\brain\6a34920d-fe78-421c-885c-de39734c1775\.system_generated\logs\transcript.jsonl"
with open(log_path2, 'r', encoding='utf-8') as f:
    lines2 = f.readlines()

for i, line in enumerate(lines2):
    try:
        step = json.loads(line)
        content = step.get('content', '')
        step_type = step.get('type', '')
        truncated = step.get('is_truncated', False)
        
        if step_type == 'VIEW_FILE':
            for tf in ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]:
                if tf in content and 'public/pages' in content:
                    showing_match = re.search(r'Showing lines (\d+) to (\d+)', content)
                    total_match = re.search(r'Total Lines: (\d+)', content)
                    total_bytes_match = re.search(r'Total Bytes: (\d+)', content)
                    
                    start = int(showing_match.group(1)) if showing_match else 0
                    end = int(showing_match.group(2)) if showing_match else 0
                    total = int(total_match.group(1)) if total_match else 0
                    total_bytes = int(total_bytes_match.group(1)) if total_bytes_match else 0
                    entire = 'entire, complete file contents' in content
                    
                    print(f"[current conv] Step {i}: {tf} lines {start}-{end} of {total} ({total_bytes}B), entire={entire}, truncated={truncated}")
    except:
        continue

# ═══ Now check the 79a8dbe2 transcript for home.html step 170 ═══
step170 = json.loads(lines[170])
content170 = step170['content']
truncated170 = step170.get('is_truncated', False)
total_match = re.search(r'Total Lines: (\d+)', content170)
total_bytes_match = re.search(r'Total Bytes: (\d+)', content170)
print(f"\n[79a8dbe2] Step 170 home.html: total_lines={total_match.group(1) if total_match else '?'}, total_bytes={total_bytes_match.group(1) if total_bytes_match else '?'}, truncated={truncated170}")
print(f"  Content preview: {content170[:300]}...")

# Extract it to see what we get
home_extracted = extract_file_content(content170)
print(f"  Extracted content size: {len(home_extracted)} bytes")
print(f"  First 200 chars: {home_extracted[:200]}")
