import json
import re
import os

brain_dir = r"C:\Users\Asus\.gemini\antigravity-ide\brain"

# Search ALL conversations for any content that has full HTML pages
# Check for run_command outputs that might contain file contents (e.g., from python scripts that wrote files)
# Also check for replace_file_content calls

target_files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]
found_content = {}

for conv_dir in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv_dir, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                step = json.loads(line)
                step_type = step.get('type', '')
                
                # Check PLANNER_RESPONSE for any tool calls
                if step_type == 'PLANNER_RESPONSE':
                    tool_calls = step.get('tool_calls', [])
                    if tool_calls:
                        for tc in tool_calls:
                            args = tc.get('arguments', {})
                            if isinstance(args, str):
                                try:
                                    args = json.loads(args)
                                except:
                                    continue
                            
                            # Check for any file write operations
                            target = ''
                            content = ''
                            
                            for key in ['TargetFile', 'targetFile', 'target_file', 'file', 'File']:
                                if key in args:
                                    target = args[key]
                                    break
                            
                            for key in ['CodeContent', 'codeContent', 'code_content', 'content', 'Content', 'ReplacementContent']:
                                if key in args and isinstance(args[key], str) and len(args[key]) > 1000:
                                    content = args[key]
                                    break
                            
                            for tf in target_files:
                                if tf in str(target) and len(content) > 1000:
                                    print(f"FOUND: {tf} in conv={conv_dir}, step={i}, tool={tc.get('tool_name','')}, content_len={len(content)}")
                                    key = tf
                                    if key not in found_content or len(content) > found_content[key]['size']:
                                        found_content[key] = {
                                            'conv': conv_dir,
                                            'step': i,
                                            'size': len(content),
                                            'content': content
                                        }

            except (json.JSONDecodeError, KeyError) as e:
                continue

# Save recovered content
out_dir = os.path.join(brain_dir, "6a34920d-fe78-421c-885c-de39734c1775", "scratch")
os.makedirs(out_dir, exist_ok=True)

for name, info in found_content.items():
    out_path = os.path.join(out_dir, f"recovered_{name}")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(info['content'])
    print(f"Saved recovered_{name} ({info['size']} bytes)")

if not found_content:
    print("\nNo tool-call-based writes found. Files were likely created outside of Antigravity.")
    print("They need to be restored from Lovable's cloud or reconstructed.")
