import re
import os

modules = ["er", "pcc", "lab", "xray", "pts", "cd", "or", "ppt", "dent", "ncd"]

for mod in modules:
    filepath = f"/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/{mod}/index.tsx"
    with open(filepath, "r", encoding="utf-8") as f:
        file_content = f.read()

    # Find the problematic template literal:
    # `${new Date(pt.vstdate).toLocaleDateString('th-TH', ${ year: 'numeric', month: 'short', day: 'numeric' })}`
    # Basically we should replace instances of `${new Date` ... `}` where inside there is `${ year:`
    
    # Actually, it's safer to just replace all `$` before `{ year: 'numeric'`
    file_content = file_content.replace("${ year: 'numeric'", "{ year: 'numeric'")
    
    # Also, we might have converted `{idx + 1}` to `${idx + 1}` inside backticks, which is fine!
    # Wait, did it convert `{pt.income || 0}` to `${pt.income || 0}` inside backticks?
    # Let's see what the original td_clean was.
    # Original: `{new Date(pt.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}`
    # My script transformed it to: "`${new Date(pt.vstdate).toLocaleDateString('th-TH', ${ year: 'numeric', month: 'short', day: 'numeric' })}`"
    # Actually, this is a JS template string: `${ ... }`
    # If the original was `{new Date(pt.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}`
    # The first `{` becomes `${`. The inner `{` becomes `${`.
    # So it became "`${new Date(pt.vstdate).toLocaleDateString('th-TH', ${ year: 'numeric', month: 'short', day: 'numeric' })}`"
    
    # We should just replace `${new Date(pt.vstdate).toLocaleDateString('th-TH', ${ year: 'numeric', month: 'short', day: 'numeric' })}`
    # with `new Date(pt.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })` without backticks!
    
    # Let's just fix all of them with a regex
    # Regex to find: `${new Date(.*?)\.toLocaleDateString\('th-TH', \${ year: 'numeric', month: 'short', day: 'numeric' }\)}`
    file_content = re.sub(
        r'`\${new Date\((.*?)\)\.toLocaleDateString\(\'th-TH\', \${ year: \'numeric\', month: \'short\', day: \'numeric\' }\)}`',
        r"new Date(\1).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })",
        file_content
    )

    # For pt.income: original was `{(pt.income || 0).toLocaleString()}`
    # became "`${(pt.income || 0).toLocaleString()}`"
    # This is fine syntax-wise, but it converts numbers to strings.
    # To fix it back to raw JS:
    file_content = re.sub(
        r'`\${\((pt\.income|pt\.operation_sum_price|pt\.price || 0)\)\.toLocaleString\(\)}`',
        r"(\1).toLocaleString()",
        file_content
    )
    
    # Also for dent_fee and income in dent module:
    file_content = re.sub(
        r'`\${\((row\.dent_fee || 0)\)\.toLocaleString\(undefined, \${ minimumFractionDigits: 2 }\)}`',
        r"(row.dent_fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })",
        file_content
    )
    file_content = re.sub(
        r'`\${\((row\.income || 0)\)\.toLocaleString\(undefined, \${ minimumFractionDigits: 2 }\)}`',
        r"(row.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })",
        file_content
    )

    # For dent `{idx + 1}` -> `${idx + 1}` inside backticks is fine.
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(file_content)

print("done fixing")
