import json
import re

with open("tables2.json", "r", encoding="utf-8") as f:
    tables = json.load(f)

for mod, content in tables.items():
    # Extract thead class to get theme
    thead_match = re.search(r'<thead className="(bg-\w+) text-white.*?"', content)
    theme = thead_match.group(1) if thead_match else "bg-primary"
    
    # Extract column names
    th_tags = re.findall(r'<th[^>]*>(.*?)</th>', content, re.DOTALL)
    # clean tags inside th
    columns = [re.sub(r'<[^>]+>', '', th).strip() for th in th_tags]
    
    # Extract data mapping array
    # Look for {patientsData.map((var, idx) => ( ... ))}
    map_match = re.search(r'patientsData(?:[^\.]*)\.map\(\(([^,]+)(?:,\s*([^)]+))?\)\s*=>\s*\((.*?)\)\)', content, re.DOTALL)
    if not map_match:
        print(f"Skipping {mod} due to map not found")
        continue
    
    pt_var = map_match.group(1).strip()
    idx_var = map_match.group(2).strip() if map_match.group(2) else "idx"
    tr_body = map_match.group(3)
    
    # Extract tds inside tr_body
    td_tags = re.findall(r'<td[^>]*>(.*?)</td>', tr_body, re.DOTALL)
    
    data_elements = []
    for td in td_tags:
        td_clean = td.strip()
        if "<" in td_clean and td_clean.startswith("<") and td_clean.endswith(">"):
            data_elements.append(f"_({td_clean})")
        elif "<" in td_clean: # Contains tags but mixed
            data_elements.append(f"_(<>{td_clean}</>)")
        else:
            data_elements.append(td_clean)
            
    print(f"Module: {mod}")
    print(f"Theme: {theme}")
    print(f"Columns: {columns}")
    print(f"Data: [\n  " + ",\n  ".join(data_elements) + "\n]")
    print("-" * 50)
