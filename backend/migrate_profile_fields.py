#!/usr/bin/env python3
"""
Migration script to add profile fields to the users table.
This adds address, phone, and profile_picture columns.
"""

import sqlite3
import os
from datetime import datetime

def migrate_profile_fields():
    # Database path
    db_path = os.path.join('instance', 'library.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    # Create backup
    backup_path = f"backups/library_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    os.makedirs('backups', exist_ok=True)
    
    try:
        # Copy database for backup
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"Backup created: {backup_path}")
    except Exception as e:
        print(f"Failed to create backup: {e}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations = []
        
        if 'address' not in columns:
            migrations.append("ALTER TABLE users ADD COLUMN address TEXT")
            
        if 'phone' not in columns:
            migrations.append("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")
            
        if 'profile_picture' not in columns:
            migrations.append("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255)")
        
        if not migrations:
            print("All profile fields already exist in the users table.")
            conn.close()
            return True
        
        # Execute migrations
        for migration in migrations:
            print(f"Executing: {migration}")
            cursor.execute(migration)
        
        # Commit changes
        conn.commit()
        print("Profile fields migration completed successfully!")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns: {columns}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        # Restore backup if migration failed
        try:
            shutil.copy2(backup_path, db_path)
            print("Database restored from backup")
        except Exception as restore_error:
            print(f"Failed to restore backup: {restore_error}")
        return False

if __name__ == "__main__":
    print("Starting profile fields migration...")
    if migrate_profile_fields():
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
