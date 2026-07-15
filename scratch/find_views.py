import json
import re

# Our current conversation transcript
log_path = r"C:\Users\Asus\.gemini\antigravity-ide\brain\6a34920d-fe78-421c-885c-de39734c1775\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all VIEW_FILE steps for our HTML pages
target_files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]

for i, line in enumerate(lines):
    try:
        step = json.loads(line)
        content = step.get('content', '')
        step_type = step.get('type', '')
        truncated = step.get('is_truncated', False)
        
        if step_type == 'VIEW_FILE':
            for tf in target_files:
                if tf in content:
                    print(f"Step {i}: {tf}, size={len(content)}, truncated={truncated}, date={step.get('created_at','')}")
    except:
        continue
