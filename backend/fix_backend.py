#!/usr/bin/env python3
"""
Script to fix the corrupted backend app.py file
"""

import re

def fix_backend_file():
    """Fix the corrupted backend file by removing JavaScript error messages"""
    
    # Read the corrupted file
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove JavaScript error messages and fix the corrupted section
    # Find the corrupted section and replace it
    corrupted_pattern = r's\.XMLHttpRequest\.send.*?ntry\.entry_time else None,'
    
    # Replace with proper Python code
    fixed_content = re.sub(
        corrupted_pattern, 
        '', 
        content, 
        flags=re.DOTALL
    )
    
    # Also remove any remaining JavaScript error lines
    js_error_patterns = [
        r'.*@.*\.js.*\n',
        r'.*XMLHttpRequest.*\n',
        r'.*dispatchXhrRequest.*\n',
        r'.*axios\.js.*\n',
        r'.*react-dom.*\n',
        r'.*GateEntryDashboard\.jsx.*Error.*\n'
    ]
    
    for pattern in js_error_patterns:
        fixed_content = re.sub(pattern, '', fixed_content)
    
    # Write the fixed content back
    with open('app.py', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("✅ Backend file fixed!")

if __name__ == '__main__':
    fix_backend_file()
