#!/usr/bin/env python3
"""
Migration script to add new fields to thesis table:
- thesis_number (unique, required)
- author (required)
- project_guide (required)
"""

import sqlite3
import sys
from datetime import datetime

def backup_database(db_path):
    """Create a backup of the database"""
    backup_path = f"{db_path}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    
    try:
        # Create backup
        with sqlite3.connect(db_path) as source, sqlite3.connect(backup_path) as backup:
            source.backup(backup)
        print(f"✅ Database backup created: {backup_path}")
        return True
    except Exception as e:
        print(f"❌ Error creating backup: {str(e)}")
        return False

def add_thesis_fields(db_path):
    """Add new fields to thesis table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if thesis table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='thesis'")
        if not cursor.fetchone():
            print("❌ Thesis table not found!")
            return False
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(thesis)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Existing columns: {existing_columns}")
        
        # Add new columns if they don't exist
        new_columns = [
            ('thesis_number', 'VARCHAR(50)'),
            ('author', 'VARCHAR(200)'),
            ('project_guide', 'VARCHAR(200)')
        ]
        
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE thesis ADD COLUMN {col_name} {col_type}")
                    print(f"✅ Added column: {col_name}")
                except Exception as e:
                    print(f"❌ Error adding column {col_name}: {str(e)}")
            else:
                print(f"ℹ️  Column {col_name} already exists")
        
        # Update existing records with default values
        cursor.execute("SELECT COUNT(*) FROM thesis WHERE thesis_number IS NULL OR thesis_number = ''")
        null_thesis_number_count = cursor.fetchone()[0]
        
        if null_thesis_number_count > 0:
            print(f"📝 Updating {null_thesis_number_count} records with default values...")
            
            # Generate unique thesis numbers for existing records
            cursor.execute("SELECT id FROM thesis WHERE thesis_number IS NULL OR thesis_number = ''")
            thesis_ids = cursor.fetchall()
            
            for i, (thesis_id,) in enumerate(thesis_ids, 1):
                thesis_number = f"TH{datetime.now().year}{str(i).zfill(4)}"
                cursor.execute("""
                    UPDATE thesis 
                    SET thesis_number = ?, 
                        author = COALESCE(author, 'Unknown Author'), 
                        project_guide = COALESCE(project_guide, 'Unknown Guide')
                    WHERE id = ?
                """, (thesis_number, thesis_id))
            
            print("✅ Default values added to existing records")
        
        # Now make the columns NOT NULL (SQLite doesn't support ALTER COLUMN directly)
        # We'll create a new table with constraints and copy data
        print("🔄 Recreating table with NOT NULL constraints...")
        
        # Get current table schema
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='thesis'")
        current_schema = cursor.fetchone()[0]
        
        # Create new table with updated schema
        new_table_sql = """
        CREATE TABLE thesis_new (
            id INTEGER NOT NULL,
            thesis_number VARCHAR(50) NOT NULL,
            author VARCHAR(200) NOT NULL,
            project_guide VARCHAR(200) NOT NULL,
            title VARCHAR(300) NOT NULL,
            college_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            type VARCHAR(50) NOT NULL,
            pdf_file_name VARCHAR(255) NOT NULL,
            pdf_file_path VARCHAR(500) NOT NULL,
            pdf_file_size VARCHAR(20),
            download_count INTEGER DEFAULT 0,
            created_by INTEGER NOT NULL,
            created_at DATETIME,
            updated_at DATETIME,
            PRIMARY KEY (id),
            UNIQUE (thesis_number),
            FOREIGN KEY(college_id) REFERENCES colleges (id),
            FOREIGN KEY(department_id) REFERENCES departments (id),
            FOREIGN KEY(created_by) REFERENCES users (id)
        )
        """
        
        cursor.execute(new_table_sql)
        
        # Copy data from old table to new table
        cursor.execute("""
            INSERT INTO thesis_new 
            SELECT id, thesis_number, author, project_guide, title, college_id, 
                   department_id, type, pdf_file_name, pdf_file_path, pdf_file_size,
                   download_count, created_by, created_at, updated_at
            FROM thesis
        """)
        
        # Drop old table and rename new table
        cursor.execute("DROP TABLE thesis")
        cursor.execute("ALTER TABLE thesis_new RENAME TO thesis")
        
        print("✅ Table recreated with proper constraints")
        
        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(thesis)")
        updated_columns = [f"{row[1]} ({row[2]})" for row in cursor.fetchall()]
        print(f"📋 Updated columns: {updated_columns}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    db_path = "instance/library.db"
    
    print("🚀 Starting thesis table migration...")
    
    # Create backup
    if not backup_database(db_path):
        print("❌ Backup failed. Aborting migration.")
        sys.exit(1)
    
    # Perform migration
    if add_thesis_fields(db_path):
        print("🎉 Migration completed successfully!")
    else:
        print("❌ Migration failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
