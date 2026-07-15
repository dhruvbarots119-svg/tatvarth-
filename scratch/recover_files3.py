import json
import re
import os

# The current conversation has partial views of home.html 
# Let me check the 985ec596 transcript for the full content
brain_dir = r"C:\Users\Asus\.gemini\antigravity-ide\brain"

# Check step 8 of 985ec596 for amenities.html 
conv = "985ec596-1b2c-4276-a4a1-4477ca2c92cf"
log_path = os.path.join(brain_dir, conv, ".system_generated", "logs", "transcript.jsonl")

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check steps around the HTML file views
for step_idx in [8, 12]:
    step = json.loads(lines[step_idx])
    content = step.get('content', '')
    truncated = step.get('is_truncated', False)
    print(f"Step {step_idx}: type={step.get('type')}, size={len(content)}, truncated={truncated}")
    # Print first 500 chars
    print(content[:500])
    print("---")

# Now check all steps for PLANNER_RESPONSE that might have tool_calls with CodeContent
print("\n\nSearching for tool calls that wrote HTML files...")
for conv_dir in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv_dir, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(log_path):
        continue
    with open(log_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                step = json.loads(line)
                step_type = step.get('type', '')
                if step_type == 'PLANNER_RESPONSE':
                    tool_calls = step.get('tool_calls', [])
                    for tc in tool_calls:
                        tool_name = tc.get('tool_name', '')
                        args = tc.get('arguments', {})
                        if isinstance(args, str):
                            try:
                                args = json.loads(args)
                            except:
                                continue
                        target = args.get('TargetFile', '') or args.get('target_file', '') or ''
                        code = args.get('CodeContent', '') or args.get('code_content', '') or ''
                        for tf in ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]:
                            if tf in target and len(code) > 100:
                                print(f"  FOUND write: {tf} in conv={conv_dir}, step={i}, tool={tool_name}, content_size={len(code)}")
            except:
                continue
