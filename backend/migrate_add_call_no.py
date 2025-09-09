"""
Migration script to add call_no field to books table
"""

import sqlite3
import os

def migrate_add_call_no():
    """Add call_no column to books table"""
    
    # Get database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'instance', 'library.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if call_no column already exists
        cursor.execute("PRAGMA table_info(books)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'call_no' not in columns:
            print("Adding call_no column to books table...")
            cursor.execute("ALTER TABLE books ADD COLUMN call_no VARCHAR(100)")
            conn.commit()
            print("✅ call_no column added successfully!")
        else:
            print("call_no column already exists in books table")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error adding call_no column: {e}")
        return False

if __name__ == "__main__":
    migrate_add_call_no()
