import json
import os

# Search all conversation transcripts for any content containing the full HTML pages
# Look for view_file calls that showed the HTML content
brain_dir = r"C:\Users\Asus\.gemini\antigravity-ide\brain"
target_files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]

results = {}

for conv_dir in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv_dir, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                step = json.loads(line)
                content = step.get('content', '')
                step_type = step.get('type', '')
                
                # Look for VIEW_FILE responses that show full HTML content 
                if step_type == 'VIEW_FILE' and content:
                    for tf in target_files:
                        if tf in content and '<!DOCTYPE html>' in content and 'entire, complete file contents' in content:
                            # This view shows the full file
                            key = tf
                            if key not in results or step.get('created_at', '') > results[key]['created_at']:
                                results[key] = {
                                    'conversation': conv_dir,
                                    'step': i,
                                    'created_at': step.get('created_at', ''),
                                    'content_length': len(content),
                                    'truncated': step.get('is_truncated', False)
                                }
                                    
            except (json.JSONDecodeError, KeyError):
                continue

for name, info in sorted(results.items()):
    print(f"{name}: conv={info['conversation']}, step={info['step']}, date={info['created_at']}, size={info['content_length']}, truncated={info['truncated']}")

if not results:
    print("No complete file views found")
    
    # Try partial views - looking for any view of these files
    for conv_dir in os.listdir(brain_dir):
        log_path = os.path.join(brain_dir, conv_dir, ".system_generated", "logs", "transcript.jsonl")
        if not os.path.exists(log_path):
            continue
        with open(log_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                try:
                    step = json.loads(line)
                    content = step.get('content', '')
                    step_type = step.get('type', '')
                    if step_type == 'VIEW_FILE':
                        for tf in target_files:
                            if tf in content:
                                print(f"  Partial view of {tf}: conv={conv_dir}, step={i}, size={len(content)}")
                except:
                    continue
