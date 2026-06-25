import re
import os

modules = ["er", "pcc", "lab", "xray", "pts", "cd", "or", "ppt", "dent", "ncd"]

for mod in modules:
    filepath = f"/Users/nathaphong.khruates/Desktop/HOSinfoProject/hosinfo_v2/resources/js/Pages/hosinfo/{mod}/index.tsx"
    with open(filepath, "r", encoding="utf-8") as f:
        file_content = f.read()

    # Find all _( ... ) patterns
    # We want to replace _( <tag className="...">{var}</tag> )
    # with html(`<tag class="...">${var}</tag>`)
    
    def replacer(match):
        inner = match.group(1)
        # Replace className= with class=
        inner = inner.replace("className=", "class=")
        # Replace {var} with ${var}
        # But only if it's not already ${var}
        # Actually, if we use a regex to find {var}:
        inner = re.sub(r'(?<!\$)\{([^}]+)\}', r'${\1}', inner)
        return f"html(`{inner}`)"

    file_content = re.sub(r'_\((<[^>]+>.*?</[^>]+>)\)', replacer, file_content)
    
    # Wait, some tags might be just `<code className="...">{var}</code>`
    # The regex `(<[^>]+>.*?</[^>]+>)` will match `<tag>...</tag>`
    # Also, some might not have closing tags, but we don't have any in our data array.
    
    # Save the file
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(file_content)

print("fixed html")
