import os
import json
import glob
from datetime import datetime
import shutil

history_dir = r"C:\Users\Asus\AppData\Roaming\Code\User\History"
target_files = ["home.html", "floors.html", "story.html", "amenities.html", "explorer.html"]
site_path_parts = ["c%3A", "Users", "Asus", "Desktop", "site", "public", "pages"]
out_dir = r"c:\Users\Asus\Desktop\site\scratch\recovered_vscode"
os.makedirs(out_dir, exist_ok=True)

results = {tf: [] for tf in target_files}

for entry_json in glob.glob(os.path.join(history_dir, "*", "entries.json")):
    folder_path = os.path.dirname(entry_json)
    try:
        with open(entry_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            if "resource" in data and isinstance(data["resource"], str):
                resource_str = data["resource"]
                
                # Verify it's from our project
                if "site/public/pages" in resource_str or "site%2Fpublic%2Fpages" in resource_str or all(p in resource_str for p in site_path_parts):
                    
                    for tf in target_files:
                        if tf in resource_str:
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

for tf in results:
    results[tf].sort(key=lambda x: x["timestamp"], reverse=True)
    print(f"\n--- {tf} ---")
    
    valid_found = False
    for r in results[tf]:
        dt = datetime.fromtimestamp(r['timestamp']/1000.0)
        print(f"Time: {dt}, Size: {r['size']} bytes, Path: {r['file_path']}")
        
        # Recover the most recent one that is > 1KB (likely not the empty/corrupted one)
        if not valid_found and r['size'] > 1000:
            dest_path = os.path.join(out_dir, tf)
            shutil.copy2(r['file_path'], dest_path)
            print(f"  >>> RESTORED {tf} to {dest_path}")
            valid_found = True

