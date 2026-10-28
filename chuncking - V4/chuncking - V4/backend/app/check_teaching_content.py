import re

with open("frontend/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Find the teachingContent object block
match = re.search(r'const teachingContent = \{(.*?)\};\r?\n\r?\n// Initialize Application', js, re.DOTALL)
if not match:
    print("Could not find teachingContent block!")
else:
    print("teachingContent block found.")
    block = match.group(1)
    
    # Let's check for counts of quote characters
    single_quotes = block.count("'")
    double_quotes = block.count('"')
    backticks = block.count('`')
    print(f"Single quotes: {single_quotes}, Double quotes: {double_quotes}, Backticks: {backticks}")
    
    # If backticks are odd, one is unclosed!
    if backticks % 2 != 0:
        print("WARNING: Odd number of backticks inside teachingContent! This indicates an unclosed template literal!")
        
        # Let's find all backticks and print their context
        backtick_indices = [m.start() for m in re.finditer('`', block)]
        for i, idx in enumerate(backtick_indices):
            start = max(0, idx - 40)
            end = min(len(block), idx + 40)
            print(f"Backtick #{i+1} at index {idx}: ...{repr(block[start:idx])} >>>`<<< {repr(block[idx+1:end])}...")
