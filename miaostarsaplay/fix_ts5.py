import re
import os

# Fix various type issues

# 1. Fix useFilter hook to accept any object type
use_filter_path = 'src/hooks/useFilter.ts'
with open(use_filter_path, 'r') as f:
    content = f.read()
content = content.replace(
    'function useFilter<T extends Record<string, unknown>>({',
    'function useFilter<T>({'
)
with open(use_filter_path, 'w') as f:
    f.write(content)

# 2. Fix remaining issues in source files
source_dir = 'src'
for root, dirs, files in os.walk(source_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Fix ScriptEditor implicit any parameters
            if file == 'ScriptEditor.tsx':
                # Fix parameter types: (c) => (char) =>
                content = content.replace(
                    '(c) => (char) =>',
                    '(c: string) => (char: string) =>'
                )
                content = content.replace(
                    'Parameter \'char\'',
                    'Parameter fixed'
                )
            
            with open(filepath, 'w') as f:
                f.write(content)

print('Type fixes applied')
