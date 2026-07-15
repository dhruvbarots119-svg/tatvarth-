import os
import json
import glob
from datetime import datetime

history_dir = r"C:\Users\Asus\AppData\Roaming\Code\User\History"
target_files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]
site_path = r"c:\Users\Asus\Desktop\site\public\pages".lower()

results = {tf: [] for tf in target_files}

# Look through entries.json in each folder
for entry_json in glob.glob(os.path.join(history_dir, "*", "entries.json")):
    folder_path = os.path.dirname(entry_json)
    try:
        with open(entry_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # check if resource path matches our target
            if "resource" in data and isinstance(data["resource"], str):
                resource_str = data["resource"].lower()
                # Check if it's one of our target files
                for tf in target_files:
                    if resource_str.endswith(f"public/pages/{tf}".lower()) or resource_str.endswith(f"public\\pages\\{tf}".lower()):
                        # We found a match for a target file. Let's look at its entries.
                        for entry in data.get("entries", []):
                            file_id = entry.get("id")
                            timestamp = entry.get("timestamp")
                            file_path = os.path.join(folder_path, file_id)
                            if os.path.exists(file_path):
                                size = os.path.getsize(file_path)
                                results[tf].append({
                                    "timestamp": timestamp,
                                    "file_path": file_path,
                                    "size": size,
                                    "original_path": data["resource"]
                                })
    except Exception as e:
        continue

# Sort by timestamp descending
for tf in results:
    results[tf].sort(key=lambda x: x["timestamp"], reverse=True)
    print(f"\n--- {tf} ---")
    for r in results[tf][:10]:
        dt = datetime.fromtimestamp(r['timestamp']/1000.0)
        print(f"Time: {dt}, Size: {r['size']} bytes, Path: {r['file_path']}")

