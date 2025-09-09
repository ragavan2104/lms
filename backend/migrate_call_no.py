#!/usr/bin/env python3

"""
Migration script to add call_no column to books table
"""

import sqlite3
import os
from datetime import datetime

def add_call_no_column():
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
        
        # Verify the schema after changes
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        
        print("\n📋 Final columns in books table:")
        for column in columns:
            print(f"  - {column[1]} ({column[2]})")
        
        # Test a simple query to ensure everything works
        print("\n🔍 Testing database queries...")
        cursor.execute("SELECT COUNT(*) FROM books")
        count = cursor.fetchone()[0]
        print(f"📊 Total books: {count}")
        
        # Test selecting call_no specifically
        cursor.execute("SELECT call_no FROM books LIMIT 1")
        result = cursor.fetchone()
        print(f"📊 Sample call_no: {result}")
        
        conn.close()
        print("\n✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        return False

def test_flask_app_connection():
    """Test if the Flask app can connect to the database after migration"""
    try:
        print("\n🔍 Testing Flask app database connection...")
        
        # Import Flask app (this will test if models work)
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        from app import app, db
        
        with app.app_context():
            # Force SQLAlchemy to refresh metadata
            db.metadata.clear()
            db.create_all()
            
            print("✅ Flask app database connection successful!")
            return True
            
    except Exception as e:
        print(f"❌ Flask app connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting migration to add call_no column...")
    
    # Step 1: Add the column to the database
    migration_success = add_call_no_column()
    
    if migration_success:
        # Step 2: Test Flask app connection
        app_success = test_flask_app_connection()
        
        if app_success:
            print("\n🎉 Migration completed! You can now:")
            print("  1. Restart the Flask application")
            print("  2. Test adding/editing books with call numbers")
            print("  3. The API should work without errors")
        else:
            print("\n⚠️  Migration completed but Flask app connection failed.")
            print("Please check the Flask app configuration.")
    else:
        print("\n❌ Migration failed!")
