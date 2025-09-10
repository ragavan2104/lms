#!/usr/bin/env python3
"""
Script to add call_no column to the books table
"""

import sqlite3
import os

def add_call_no_column():
    db_path = 'instance/library.db'
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if call_no column exists
        cursor.execute('PRAGMA table_info(books)')
        columns = cursor.fetchall()
        
        print('Current books table columns:')
        for column in columns:
            print(f'  - {column[1]} ({column[2]})')
        
        # Check if call_no column exists
        call_no_exists = any(col[1] == 'call_no' for col in columns)
        print(f'\nCall_no column exists: {call_no_exists}')
        
        if not call_no_exists:
            print('\n🔧 Adding call_no column...')
            cursor.execute('ALTER TABLE books ADD COLUMN call_no VARCHAR(100)')
            conn.commit()
            print('✅ call_no column added successfully!')
            
            # Verify the column was added
            cursor.execute('PRAGMA table_info(books)')
            columns = cursor.fetchall()
            call_no_exists = any(col[1] == 'call_no' for col in columns)
            
            if call_no_exists:
                print('✅ Verification successful: call_no column is now present')
            else:
                print('❌ Verification failed: call_no column was not added')
                return False
        else:
            print('✅ call_no column already exists')
        
        conn.close()
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

if __name__ == '__main__':
    print('🚀 Adding call_no column to books table...')
    success = add_call_no_column()
    
    if success:
        print('\n✅ Migration completed successfully!')
    else:
        print('\n❌ Migration failed!')
