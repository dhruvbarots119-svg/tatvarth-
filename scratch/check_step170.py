import json

# Read step 170 of 79a8dbe2 - this was marked as showing entire file 
log_path = r"C:\Users\Asus\.gemini\antigravity-ide\brain\79a8dbe2-808a-4272-a2d8-332e2b013d45\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

step = json.loads(lines[170])
content = step['content']
truncated = step.get('is_truncated', False)
truncated_fields = step.get('truncated_fields', [])

print(f"Content length: {len(content)}")
print(f"Truncated: {truncated}")
print(f"Truncated fields: {truncated_fields}")
print(f"\nLast 500 chars of content:\n{content[-500:]}")

# Count lines starting with a number pattern
import re
numbered_lines = re.findall(r'^\d+: ', content, re.MULTILINE)
print(f"\nTotal numbered lines found: {len(numbered_lines)}")
