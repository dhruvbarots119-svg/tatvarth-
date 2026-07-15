import json
import os

# Search all conversation transcripts for write_to_file calls that wrote HTML pages
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
                
                # Look for tool calls that wrote to HTML files
                tool_calls = step.get('tool_calls', [])
                if tool_calls:
                    for tc in tool_calls:
                        args = tc.get('arguments', {})
                        target = args.get('TargetFile', '')
                        for tf in target_files:
                            if tf in target and args.get('CodeContent'):
                                key = tf
                                if key not in results or step.get('created_at', '') > results[key]['created_at']:
                                    results[key] = {
                                        'conversation': conv_dir,
                                        'step': i,
                                        'created_at': step.get('created_at', ''),
                                        'content_length': len(args.get('CodeContent', '')),
                                        'target_file': target
                                    }
                                    # Save the content
                                    with open(os.path.join(brain_dir, '6a34920d-fe78-421c-885c-de39734c1775', 'scratch', f'recovered_{tf}'), 'w', encoding='utf-8') as out:
                                        out.write(args['CodeContent'])
                                    
            except (json.JSONDecodeError, KeyError):
                continue

for name, info in results.items():
    print(f"Found {name}: conv={info['conversation']}, step={info['step']}, date={info['created_at']}, size={info['content_length']}")

if not results:
    print("No write_to_file calls found for HTML pages in any transcript")
