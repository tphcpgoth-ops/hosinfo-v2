import re
import json

modules = ["er", "pcc", "lab", "xray", "pts", "cd", "or", "ppt", "dent", "ncd"]
results = {}

for mod in modules:
    path = f"/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/{mod}/index.tsx"
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            
        patients_start = content.find('<Tab.Pane eventKey="patients"')
        if patients_start == -1:
            patients_start = content.find('eventKey="patients"', content.find('eventKey="patients"') + 10) # second occurrence
            if patients_start == -1:
                continue
            
        table_start = content.find('<div className="table-responsive', patients_start)
        table_end = content.find('</Table>', table_start)
        if table_start != -1 and table_end != -1:
            div_end = content.find('</div>', table_end) + 6
            results[mod] = content[table_start:div_end]
    except Exception as e:
        print(e)

with open("tables2.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("done2")
