import re
import os

# Fix query calls - add undefined to no-arg queries
query_patterns = [
    ('useGetProjectsQuery()', 'useGetProjectsQuery(undefined)'),
    ('useGetProjectsQuery({})', 'useGetProjectsQuery(undefined)'),
    ('useGetDashboardStatsQuery()', 'useGetDashboardStatsQuery(undefined)'),
    ('useGetBrandsQuery()', 'useGetBrandsQuery(undefined)'),
    ('useGetTeamMembersQuery()', 'useGetTeamMembersQuery(undefined)'),
]

source_dir = 'src'
for root, dirs, files in os.walk(source_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Fix query calls
            for old, new in query_patterns:
                content = content.replace(old, new)
            
            with open(filepath, 'w') as f:
                f.write(content)
print('Query call fixes done')
