import json
import re
import os

with open("tables2.json", "r", encoding="utf-8") as f:
    tables = json.load(f)

for mod, content in tables.items():
    filepath = f"/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/{mod}/index.tsx"
    with open(filepath, "r", encoding="utf-8") as f:
        file_content = f.read()

    # Add Grid.js imports if missing
    if "import { Grid, _ } from 'gridjs-react'" not in file_content:
        # insert after usePage or axios
        file_content = file_content.replace(
            "import { usePage } from '@inertiajs/react';", 
            "import { usePage } from '@inertiajs/react';\nimport { Grid, _ } from 'gridjs-react';\nimport { html } from 'gridjs';"
        )

    thead_match = re.search(r'<thead class[Nn]ame="(bg-\w+) text-white.*?"', content)
    theme = thead_match.group(1) if thead_match else "bg-primary"
    
    th_tags = re.findall(r'<th[^>]*>(.*?)</th>', content, re.DOTALL)
    columns = [re.sub(r'<[^>]+>', '', th).strip() for th in th_tags]
    columns_str = json.dumps(columns, ensure_ascii=False)
    
    map_match = re.search(r'(patientsData(?:[^\.]*)\.map)\(\(([^,]+)(?:,\s*([^)]+))?\)\s*=>\s*\((.*?)\)\)', content, re.DOTALL)
    if not map_match:
        print(f"Skipping {mod} map not found")
        continue

    map_prefix = map_match.group(1)
    pt_var = map_match.group(2).strip()
    idx_var = map_match.group(3).strip() if map_match.group(3) else "idx"
    tr_body = map_match.group(4)
    
    td_tags = re.findall(r'<td[^>]*>(.*?)</td>', tr_body, re.DOTALL)
    
    data_elements = []
    for td in td_tags:
        td_clean = td.strip()
        # Handle simple JS expressions: {pt.age} -> pt.age
        if td_clean.startswith("{") and td_clean.endswith("}") and td_clean.count("{") == 1 and "<" not in td_clean:
            data_elements.append(td_clean[1:-1])
        # Handle multiple JS expressions without tags (like Dent's {row.pname}{row.fname} {row.lname})
        elif "<" not in td_clean and "{" in td_clean:
            # Convert to template literal
            # Replace {var} with ${var}
            tl = td_clean.replace("{", "${")
            data_elements.append(f"`{tl}`")
        # Handle tags
        elif "<" in td_clean:
            if td_clean.startswith("<") and td_clean.endswith(">"):
                # Make sure it's valid JSX: Some might be just one tag, some might be multiple siblings
                # Actually, wrap in _( ... )
                data_elements.append(f"_({td_clean})")
            else:
                data_elements.append(f"_(<>{td_clean}</>)")
        else:
            data_elements.append(f"'{td_clean}'")

    data_array_str = f"{map_prefix}(({pt_var}, {idx_var}) => [\n                                                    " + ",\n                                                    ".join(data_elements) + "\n                                                ])"
    
    # We need to replace the entire table div
    grid_component = f"""<Grid
                                                data={{{data_array_str}}}
                                                columns={columns_str}
                                                search={{true}}
                                                pagination={{{{ limit: 10 }}}}
                                                sort={{true}}
                                                language={{{{
                                                    'search': {{ 'placeholder': 'ค้นหา...' }},
                                                    'pagination': {{ 'previous': 'ก่อนหน้า', 'next': 'ถัดไป', 'showing': 'แสดง', 'results': () => 'รายการ' }},
                                                    'noRecordsFound': 'ไม่พบรายชื่อผู้รับบริการ'
                                                }}}}
                                                className={{{{
                                                    table: 'table table-hover align-middle mb-0 table-sm',
                                                    th: '{theme} text-white fw-semibold',
                                                    pagination: 'mt-0 mb-0 p-1',
                                                    container: 'mt-0 mb-0 p-0'
                                                }}}}
                                            />"""
                                            
    # Find the table block in file_content and replace it
    # We use the literal string of `content` from tables2.json, but it might have been modified slightly by the user. 
    # Actually, we can just replace `content` directly.
    if content in file_content:
        file_content = file_content.replace(content, grid_component)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(file_content)
        print(f"Updated {mod}")
    else:
        print(f"Content block not found for {mod}! Trying a fallback.")
        # Try to find table-responsive by index
        start_idx = file_content.find('<div className="table-responsive')
        # ...
