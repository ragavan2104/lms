#!/usr/bin/env python3

"""
Fix database schema issues by ensuring all tables have the correct structure
"""

import sqlite3
import os

def fix_database_schema():
    db_path = '../instance/library.db'
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found at {db_path}")
        return
    
    print(f"🔍 Fixing database schema at {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current books table structure
        cursor.execute('PRAGMA table_info(books)')
        columns = [row[1] for row in cursor.fetchall()]
        print(f"📊 Current columns: {columns}")
        
        # Ensure call_no column exists
        if 'call_no' not in columns:
            print("➕ Adding call_no column...")
            cursor.execute('ALTER TABLE books ADD COLUMN call_no VARCHAR(100)')
            print("✅ call_no column added")
        else:
            print("✅ call_no column already exists")
        
        # Verify the schema matches what SQLAlchemy expects
        expected_columns = [
            'id', 'access_no', 'call_no', 'title', 'author_1', 'author_2', 
            'author_3', 'author_4', 'author', 'publisher', 'department', 
            'category', 'location', 'number_of_copies', 'available_copies', 
            'isbn', 'pages', 'price', 'edition', 'created_at'
        ]
        
        missing_columns = [col for col in expected_columns if col not in columns]
        if missing_columns:
            print(f"❌ Missing columns: {missing_columns}")
        else:
            print("✅ All expected columns are present")
        
        # Test a simple query
        cursor.execute('SELECT COUNT(*) FROM books')
        count = cursor.fetchone()[0]
        print(f"📚 Total books in database: {count}")
        
        # Test querying call_no specifically
        cursor.execute('SELECT id, access_no, call_no, title FROM books LIMIT 5')
        rows = cursor.fetchall()
        print(f"📋 Sample books with call_no:")
        for row in rows:
            print(f"  ID: {row[0]}, Access: {row[1]}, Call: {row[2]}, Title: {row[3]}")
        
        conn.commit()
        print("✅ Database schema verification complete")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_database_schema()
