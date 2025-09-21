import json

# Path to your data.json file
input_path = "c:\\Users\\HP\\Downloads\\foodwish\\backend\\data.json"
output_path = "c:\\Users\\HP\\Downloads\\foodwish\\backend\\data_cleaned.json"

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Filter out admin.logentry objects
cleaned = [obj for obj in data if obj.get("model") != "admin.logentry"]

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(cleaned, f, indent=2, ensure_ascii=False)

print("Cleaned file saved as data_cleaned.json")