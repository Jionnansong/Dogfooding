import re
import os

test_dir = 'src/test'
for root, dirs, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Replace jest.Mock with vi.Mock
            content = content.replace('jest.Mock', 'vi.Mock')
            
            # Add isAuthenticated: true to auth objects (before user:)
            # Pattern: auth: { token: 'mock_token', user:
            content = re.sub(
                r"(token: 'mock_token',)\s*(user:)",
                r"\1 isAuthenticated: true, \2",
                content
            )
            
            with open(filepath, 'w') as f:
                f.write(content)
print('Replacement done')
