import re
import os

test_dir = 'src/test'
for root, dirs, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Add vi import if not present and using vi.
            if 'vi.' in content and "from 'vitest'" not in content and 'from "vitest"' not in content:
                # Check if there's already a vitest import
                if 'import {' in content and 'vitest' in content.split('\n')[0:5]:
                    # Add vi to existing import
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if 'vitest' in line:
                            if 'vi' not in line:
                                # Replace the import line to include vi
                                lines[i] = line.replace('import {', 'import { vi,')
                                print(f"Updated import in {filepath}")
                            break
                    content = '\n'.join(lines)
                else:
                    # Add new import line at the beginning
                    lines = content.split('\n')
                    # Find the first non-empty line
                    insert_idx = 0
                    for i, line in enumerate(lines):
                        if line.strip() and not line.strip().startswith('//'):
                            insert_idx = i
                            break
                    lines.insert(insert_idx, "import { vi } from 'vitest';")
                    content = '\n'.join(lines)
                    print(f"Added import to {filepath}")
            
            with open(filepath, 'w') as f:
                f.write(content)
print('Import fix done')
