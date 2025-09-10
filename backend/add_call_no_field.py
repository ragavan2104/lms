#!/usr/bin/env python3
"""
Quick migration to add call_no field to books table
"""

import sqlite3
import os

def add_call_no_field():
    """Add call_no field to books table"""
    
    print("🔄 Adding call_no field to books table...")
    
    # Connect to the SQLite database
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'library.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if call_no field already exists
        cursor.execute("PRAGMA table_info(books)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'call_no' not in columns:
            print("➕ Adding call_no field to books table...")
            cursor.execute("ALTER TABLE books ADD COLUMN call_no TEXT")
            conn.commit()
            print("✅ call_no field added successfully!")
        else:
            print("✅ call_no field already exists")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Adding call_no field to books table")
    print("=" * 40)
    
    if add_call_no_field():
        print("🎉 Migration completed successfully!")
    else:
        print("❌ Migration failed.")
