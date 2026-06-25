import re

modules = ["er", "pcc", "lab", "xray", "pts", "cd", "or", "ppt", "dent", "ncd"]

for mod in modules:
    filepath = f"/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/{mod}/index.tsx"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace columns=["..."] with columns={["..."]}
    content = re.sub(r'columns=\[([^\]]+)\]', r'columns={[\1]}', content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("fixed columns")
