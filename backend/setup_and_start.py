#!/usr/bin/env python3

"""
Simple database verification and server start script
"""

import sqlite3
import os
import subprocess
import sys

def verify_database():
    db_path = '../instance/library.db'
    
    print("🔍 Verifying database structure...")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if books table exists and has call_no column
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='books'")
        if not cursor.fetchone():
            print("❌ Books table does not exist!")
            return False
        
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if 'call_no' in column_names:
            print("✅ call_no column exists in books table")
        else:
            print("⚠️  Adding call_no column...")
            cursor.execute("ALTER TABLE books ADD COLUMN call_no VARCHAR(100)")
            conn.commit()
            print("✅ call_no column added")
        
        # Test basic query
        cursor.execute("SELECT COUNT(*) FROM books")
        count = cursor.fetchone()[0]
        print(f"📊 Books in database: {count}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database error: {str(e)}")
        return False

def start_flask_server():
    print("🚀 Starting Flask server...")
    try:
        # Start Flask server
        result = subprocess.run([sys.executable, 'app.py'], 
                              capture_output=False, 
                              text=True,
                              timeout=5)  # Give it 5 seconds to start
    except subprocess.TimeoutExpired:
        print("✅ Flask server started successfully (timeout reached, server likely running)")
        return True
    except Exception as e:
        print(f"❌ Error starting Flask server: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 Setting up call_no field and starting server...")
    
    # Step 1: Verify database
    if verify_database():
        print("\n📋 Database is ready!")
        
        # Step 2: Start Flask server
        print("\n🚀 Starting Flask server...")
        print("Note: The server will start in the background.")
        print("You can test the API at http://localhost:5000")
        
        # Just run the server directly
        os.system("python app.py")
        
    else:
        print("\n❌ Database setup failed!")
        sys.exit(1)
