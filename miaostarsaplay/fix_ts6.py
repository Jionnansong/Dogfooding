import re
import os

# Fix remaining type issues

# 1. Fix useDashboardData project type to match actual Project type
dashboard_data_path = 'src/hooks/useDashboardData.ts'
with open(dashboard_data_path, 'r') as f:
    content = f.read()
content = content.replace(
    "status: string;",
    "status: 'planning' | 'shooting' | 'post-production' | 'completed';"
)
with open(dashboard_data_path, 'w') as f:
    f.write(content)

print('useDashboardData fix applied')

# 2. Fix ScriptEditor type issues
script_editor_path = 'src/pages/ScriptEditor.tsx'
with open(script_editor_path, 'r') as f:
    content = f.read()
    
# Fix implicit any for (c) => (char) => patterns
content = content.replace(
    '(c) => (char) =>',
    '(c: string) => (char: string) =>'
)

# Fix localStorage null issues
content = content.replace(
    "localStorage.getItem('script_editor_quota_warning') === 'false'",
    "localStorage.getItem('script_editor_quota_warning') !== 'true'"
)
content = content.replace(
    "localStorage.getItem('script_editor_confirm_leave')",
    "localStorage.getItem('script_editor_confirm_leave') === 'true'"
)

with open(script_editor_path, 'w') as f:
    f.write(content)

print('ScriptEditor fixes applied')

# 3. Fix DataBoard type issues
data_board_path = 'src/pages/DataBoard.tsx'
with open(data_board_path, 'r') as f:
    content = f.read()
    
# Fix implicit any in map callback
content = content.replace(
    "data?.summary.map((stat, idx) => (",
    "data?.summary.map((stat: any, idx: number) => ("
)

with open(data_board_path, 'w') as f:
    f.write(content)

print('DataBoard fixes applied')

print('All remaining type fixes applied!')
