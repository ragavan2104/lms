#!/usr/bin/env python3
"""
Database Migration Script - Add Missing User Columns

This script will add missing columns to the users table:
- first_login_completed (Boolean)
- user_role (String) - if missing
"""

import os
import sys
import sqlite3

def migrate_user_columns():
    """Add missing columns to users table"""
    
    # Use the instance directory path
    db_file = os.path.join('instance', 'library.db')
    
    if not os.path.exists(db_file):
        print("❌ Database file not found at instance/library.db")
        return False
    
    try:
        # Connect directly to SQLite database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        print("🔍 Checking users table structure...")
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Current users table columns: {', '.join(columns)}")
        
        # Add missing columns
        migrations_performed = []
        
        # Check and add first_login_completed column
        if 'first_login_completed' not in columns:
            print("📝 Adding first_login_completed column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN first_login_completed BOOLEAN DEFAULT 0")
            migrations_performed.append('first_login_completed')
        else:
            print("✅ first_login_completed column already exists!")
        
        # Check and add user_role column if missing
        if 'user_role' not in columns:
            print("📝 Adding user_role column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN user_role TEXT")
            # Update existing records to have same value as role column
            cursor.execute("UPDATE users SET user_role = role WHERE user_role IS NULL")
            migrations_performed.append('user_role')
        else:
            print("✅ user_role column already exists!")
        
        if migrations_performed:
            conn.commit()
            print(f"✅ Successfully added columns: {', '.join(migrations_performed)}")
        else:
            print("✅ No migrations needed - all columns exist!")
        
        # Verify the final table structure
        cursor.execute("PRAGMA table_info(users)")
        final_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Final users table columns: {', '.join(final_columns)}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        return False
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def main():
    print("🔧 Starting database migration for user columns...")
    success = migrate_user_columns()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("💡 You can now restart your application.")
    else:
        print("\n💥 Migration failed! Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
