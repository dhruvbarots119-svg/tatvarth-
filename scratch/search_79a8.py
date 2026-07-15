import json
import re

# The 79a8dbe2 conversation ran redesign_pages.py and viewed home.html after
log_path = r"C:\Users\Asus\.gemini\antigravity-ide\brain\79a8dbe2-808a-4272-a2d8-332e2b013d45\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]

for i, line in enumerate(lines):
    try:
        step = json.loads(line)
        content = step.get('content', '')
        step_type = step.get('type', '')
        truncated = step.get('is_truncated', False)
        
        if step_type == 'VIEW_FILE':
            for tf in target_files:
                if tf in content and 'public/pages' in content:
                    has_doctype = '<!DOCTYPE' in content or '&lt;!DOCTYPE' in content
                    has_entire = 'entire, complete file contents' in content
                    print(f"Step {i}: {tf}, size={len(content)}, truncated={truncated}, doctype={has_doctype}, entire={has_entire}")
        
        # Also check PLANNER_RESPONSE for run_command that may have output file content
        if step_type == 'PLANNER_RESPONSE':
            tool_calls = step.get('tool_calls', [])
            for tc in tool_calls:
                tn = tc.get('tool_name', '')
                args = tc.get('arguments', {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        continue
                cmd = args.get('CommandLine', '')
                if 'redesign' in str(cmd).lower() or 'replace_fonts' in str(cmd).lower() or 'apply_ibm' in str(cmd).lower():
                    print(f"Step {i}: Run command: {cmd[:200]}")
                    
    except:
        continue

# Also check how many total steps
print(f"\nTotal steps: {len(lines)}")
