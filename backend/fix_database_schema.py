#!/usr/bin/env python3

"""
Fix database schema to match the SQLAlchemy models
"""

import sqlite3
import os
import sys
from datetime import datetime

def check_and_fix_database():
    db_path = '../instance/library.db'
    
    print("🔍 Checking database schema...")
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
        
        # Verify the schema after changes
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        
        print("\n📋 Updated columns in books table:")
        for column in columns:
            print(f"  - {column[1]} ({column[2]})")
        
        # Check if there are any books in the database
        cursor.execute("SELECT COUNT(*) FROM books")
        book_count = cursor.fetchone()[0]
        print(f"\n📚 Total books in database: {book_count}")
        
        # If there are books, check if they have call_no values
        if book_count > 0:
            cursor.execute("SELECT COUNT(*) FROM books WHERE call_no IS NULL OR call_no = ''")
            null_call_no = cursor.fetchone()[0]
            if null_call_no > 0:
                print(f"⚠️  {null_call_no} books have empty call_no values")
                # You can optionally set default values here
                # cursor.execute("UPDATE books SET call_no = 'N/A' WHERE call_no IS NULL OR call_no = ''")
                # conn.commit()
        
        conn.close()
        print("\n✅ Database schema check completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error checking database: {str(e)}")
        return False

if __name__ == "__main__":
    success = check_and_fix_database()
    if success:
        print("\n🚀 Database is ready! You can now restart the Flask application.")
    else:
        print("\n❌ Database fix failed!")
        sys.exit(1)
