#!/usr/bin/env python3

"""
Simple test to verify call_no migration worked
"""

import sqlite3
import os

def test_migration():
    db_path = '../instance/library.db'
    
    print("🔍 Testing call_no migration...")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check books table schema
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        
        column_names = [col[1] for col in columns]
        
        if 'call_no' in column_names:
            print("✅ call_no column exists in books table")
        else:
            print("❌ call_no column missing from books table")
            return False
        
        # Test inserting a book with call_no
        print("🔍 Testing book insertion with call_no...")
        
        cursor.execute("""
            INSERT OR REPLACE INTO books 
            (access_no, call_no, title, author_1, publisher, pages, price, edition) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("TEST001", "QA76.73.P98", "Migration Test Book", "Test Author", "Test Publisher", 100, 29.99, "1st"))
        
        conn.commit()
        
        # Retrieve the book
        cursor.execute("SELECT access_no, call_no, title FROM books WHERE access_no = 'TEST001'")
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Book inserted and retrieved:")
            print(f"   Access No: {result[0]}")
            print(f"   Call No: {result[1]}")
            print(f"   Title: {result[2]}")
            
            # Clean up
            cursor.execute("DELETE FROM books WHERE access_no = 'TEST001'")
            conn.commit()
            print("✅ Test data cleaned up")
        else:
            print("❌ Failed to insert/retrieve test book")
            return False
        
        conn.close()
        print("✅ Migration test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Migration test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Call Number Migration Test")
    print("=" * 30)
    
    if test_migration():
        print("\n🎉 MIGRATION SUCCESSFUL!")
        print("\n📋 Call number field is ready to use:")
        print("  ✅ Database schema updated")
        print("  ✅ Books table has call_no column")
        print("  ✅ Insert/retrieve operations work")
        print("\n🚀 You can now start the Flask server!")
    else:
        print("\n❌ MIGRATION FAILED!")
        print("Please check the error messages above.")
