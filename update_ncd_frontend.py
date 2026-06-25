import os
import re

filepath = "/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/ncd/index.tsx"

with open(filepath, 'r', encoding='utf-8') as file:
    content = file.read()

# 1. Import usePage
if "import { usePage }" not in content:
    content = content.replace("import { ApexOptions } from 'apexcharts';", "import { ApexOptions } from 'apexcharts';\nimport { usePage } from '@inertiajs/react';")

# 2. Extract auth inside the component
component_match = re.search(r'(const \w+StatsPage = \([^)]+\) => {)', content)
if component_match and "const { auth }" not in content:
    comp_def = component_match.group(1)
    content = content.replace(comp_def, comp_def + "\n    const { auth } = usePage().props as any;")
    
# 3. Wrap Nav.Item
nav_item_pattern = re.compile(r'(<Nav\.Item>\s*<Nav\.Link eventKey="patients"[\s\S]*?</Nav\.Item>)')
if "{auth?.user && (" not in content[:content.find('eventKey="patients"')]:
    nav_match = nav_item_pattern.search(content)
    if nav_match:
        nav_text = nav_match.group(1)
        idx = content.find(nav_text)
        prev_text = content[idx-50:idx]
        if "auth?.user &&" not in prev_text:
            indent = nav_text[:len(nav_text) - len(nav_text.lstrip())]
            new_nav = f"{{auth?.user && (\n{nav_text}\n{indent})}}"
            content = content.replace(nav_text, new_nav)

# 4. Wrap Tab.Pane
tab_pane_pattern = re.compile(r'(<Tab\.Pane eventKey="patients">[\s\S]*?</Tab\.Pane>)')
tab_match = tab_pane_pattern.search(content)
if tab_match:
    tab_text = tab_match.group(1)
    idx = content.find(tab_text)
    prev_text = content[idx-50:idx]
    if "auth?.user &&" not in prev_text:
        indent = tab_text[:len(tab_text) - len(tab_text.lstrip())]
        new_tab = f"{{auth?.user && (\n{tab_text}\n{indent})}}"
        content = content.replace(tab_text, new_tab)
        
with open(filepath, 'w', encoding='utf-8') as file:
    file.write(content)

print("Done ncd.")
