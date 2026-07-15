import os
import json
import glob

history_dir = r"C:\Users\Asus\AppData\Roaming\Code\User\History"

count = 0
for entry_json in glob.glob(os.path.join(history_dir, "*", "entries.json")):
    try:
        with open(entry_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if "resource" in data:
                print(data["resource"])
                count += 1
                if count >= 20:
                    break
    except Exception:
        pass
