#!/usr/bin/env python3

"""
Migration script to properly add call_no column to books table
"""

import sqlite3
import os
from datetime import datetime

def migrate_add_call_no():
    db_path = '../instance/library.db'
    
    print("🔧 Adding call_no column to books table...")
    print(f"📂 Database path: {os.path.abspath(db_path)}")
    
    if not os.path.exists(db_path):
        print("❌ Database file does not exist!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current schema
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        
        print("📋 Current columns in books table:")
        column_names = []
        for column in columns:
            print(f"  - {column[1]} ({column[2]})")
            column_names.append(column[1])
        
        # Check if call_no column exists
        if 'call_no' not in column_names:
            print("⚠️  call_no column is missing! Adding it...")
            cursor.execute("ALTER TABLE books ADD COLUMN call_no VARCHAR(100)")
            conn.commit()
            print("✅ Added call_no column")
        else:
            print("✅ call_no column already exists")
        
        # Test the column works
        print("\n🔍 Testing call_no column...")
        cursor.execute("SELECT COUNT(*) FROM books")
        count = cursor.fetchone()[0]
        print(f"📊 Total books: {count}")
        
        if count > 0:
            # Test selecting call_no
            cursor.execute("SELECT id, access_no, call_no FROM books LIMIT 3")
            sample_books = cursor.fetchall()
            print("📋 Sample books with call_no:")
            for book in sample_books:
                print(f"  - ID: {book[0]}, Access: {book[1]}, Call: {book[2] or 'NULL'}")
        
        conn.close()
        print("\n✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting call_no migration...")
    
    success = migrate_add_call_no()
    
    if success:
        print("\n🎉 Migration completed! call_no field is now available.")
    else:
        print("\n❌ Migration failed!")
