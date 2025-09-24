#!/usr/bin/env python3

import re

# Read the workflow file
with open('.github/workflows/ci.yml', 'r') as f:
    content = f.read()

# Fix the incomplete echo statements
# Replace standalone 'echo "' lines that are followed by proper echo statements
fixes = [
    # Remove the incomplete echo statements that are just section separators
    (r'          echo "\n          echo "', '          echo "## 📦 Build Artifacts" >> $GITHUB_STEP_SUMMARY\n          echo "'),
    (r'          echo "\n          echo "-', '          echo "## 🚀 Application Release" >> $GITHUB_STEP_SUMMARY\n          echo "-'),
]

new_content = content
for find_pattern, replace_pattern in fixes:
    new_content = re.sub(find_pattern, replace_pattern, new_content)

# Also fix any remaining standalone echo " statements
new_content = re.sub(r'^\s+echo "\s*$', '          echo "## 📋 Summary" >> $GITHUB_STEP_SUMMARY', new_content, flags=re.MULTILINE)

# Write back to file
with open('.github/workflows/ci.yml', 'w') as f:
    f.write(new_content)

print("Fixed build summary syntax errors")
