import re
import os

test_dir = 'src/test'
for root, dirs, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Replace vi.Mock with any type assertion
            content = content.replace('as vi.Mock)', 'as any)')
            content = content.replace('vi.Mock)', 'any)')
            
            with open(filepath, 'w') as f:
                f.write(content)
print('Mock type fixes done')
