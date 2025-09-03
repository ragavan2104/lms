#!/usr/bin/env python3
"""
Database Migration Script for Library Management System

This script will add the missing fine_amount column to the circulations table
without deleting existing data.
"""

import os
import sys
import sqlite3

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db

def migrate_database():
    """Add missing columns to existing database"""
    
    db_file = 'library.db'
    
    if not os.path.exists(db_file):
        print("❌ Database file not found. Please run the main application first.")
        return False
    
    try:
        # Connect directly to SQLite database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        # Check if fine_amount column exists
        cursor.execute("PRAGMA table_info(circulations)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'fine_amount' not in columns:
            print("📝 Adding fine_amount column to circulations table...")
            cursor.execute("ALTER TABLE circulations ADD COLUMN fine_amount REAL DEFAULT 0.0")
            conn.commit()
            print("✅ Successfully added fine_amount column!")
        else:
            print("✅ fine_amount column already exists!")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(circulations)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Current circulations table columns: {', '.join(columns)}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def verify_schema():
    """Verify that the database schema is correct"""
    
    try:
        with app.app_context():
            # Try to query the circulations table with fine_amount
            result = db.session.execute(db.text("SELECT id, fine_amount FROM circulations LIMIT 1"))
            print("✅ Schema verification passed - fine_amount column is accessible")
            return True
    except Exception as e:
        print(f"❌ Schema verification failed: {e}")
        return False

if __name__ == '__main__':
    print("🔄 Starting database migration...")
    
    # Run migration
    if migrate_database():
        print("\n🔍 Verifying schema...")
        if verify_schema():
            print("\n🚀 Migration completed successfully!")
            print("   You can now restart your application.")
        else:
            print("\n⚠️  Migration completed but verification failed.")
            print("   You may need to restart your application or run reset_database.py")
    else:
        print("\n❌ Migration failed!")
        print("   Consider running reset_database.py to completely reset the database.")
