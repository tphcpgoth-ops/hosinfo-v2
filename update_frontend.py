import os
import re

files = [
    "pcc/index.tsx", "lab/index.tsx", "xray/index.tsx", "pts/index.tsx", 
    "cd/index.tsx", "or/index.tsx", "ppt/index.tsx", "dent/index.tsx"
]
base_path = "/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/"

for f in files:
    filepath = os.path.join(base_path, f)
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Import usePage
    if "import { usePage }" not in content:
        content = content.replace("import { ApexOptions } from 'apexcharts';", "import { ApexOptions } from 'apexcharts';\nimport { usePage } from '@inertiajs/react';")
    
    # 2. Extract auth inside the component
    # Find the component definition
    component_match = re.search(r'(const \w+StatsPage = \([^)]+\) => {)', content)
    if component_match and "const { auth }" not in content:
        comp_def = component_match.group(1)
        content = content.replace(comp_def, comp_def + "\n    const { auth } = usePage().props as any;")
        
    # 3. Wrap Nav.Item
    # We look for <Nav.Item> ... <Nav.Link eventKey="patients" ... </Nav.Item>
    nav_item_pattern = re.compile(r'(<Nav\.Item>\s*<Nav\.Link eventKey="patients"[\s\S]*?</Nav\.Item>)')
    def replace_nav_item(m):
        inner = m.group(1)
        # Indent inner
        indented = "\n".join("    " + line if line.strip() else line for line in inner.split("\n"))
        return f"{{auth?.user && (\n{indented}\n{inner[:inner.find('<Nav.Item>') - 1]}    )}}"
    
    if "{auth?.user && (" not in content[:content.find('eventKey="patients"')]:
        # we need a better check to see if it's already wrapped.
        # Let's check if the Nav.Item is directly preceded by auth?.user && (
        nav_match = nav_item_pattern.search(content)
        if nav_match:
            nav_text = nav_match.group(1)
            # check the character right before nav_text
            idx = content.find(nav_text)
            prev_text = content[idx-50:idx]
            if "auth?.user &&" not in prev_text:
                # Need to properly format the replacement
                indent = nav_text[:len(nav_text) - len(nav_text.lstrip())]
                new_nav = f"{{auth?.user && (\n{nav_text}\n{indent})}}"
                # Python's re.sub is tricky with newlines and groups, we just use string replace
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
            
    # Write back
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

print("Done modifying frontend files.")
