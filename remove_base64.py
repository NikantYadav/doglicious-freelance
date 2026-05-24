import re

input_file = "./poopsense/poopsense.html"
output_file = "./poopsense/poopsense.html"

with open(input_file, "r", encoding="utf-8") as f:
    content = f.read()

# Remove base64 image src attributes, replacing with empty src
cleaned = re.sub(r'src="data:[^;]+;base64,[^"]*"', 'src=""', content)

# Also handle single-quoted variants
cleaned = re.sub(r"src='data:[^;]+;base64,[^']*'", "src=''", cleaned)

removed_count = len(re.findall(r'src=["\']data:[^;]+;base64,[^"\']*["\']', content))

with open(output_file, "w", encoding="utf-8") as f:
    f.write(cleaned)

print(f"Done. Removed {removed_count} base64 image string(s) from {output_file}.")
