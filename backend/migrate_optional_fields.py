#!/usr/bin/env python3
"""
Migration script to make pages and edition fields optional in books table
"""

import sqlite3
import os
import sys
from datetime import datetime

def backup_database(db_path):
    """Create a backup of the database before migration"""
    backup_dir = os.path.join(os.path.dirname(db_path), 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(backup_dir, f'library_backup_{timestamp}.db')
    
    # Copy the database file
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"Database backed up to: {backup_path}")
    return backup_path

def migrate_optional_fields(db_path):
    """Migrate the books table to make pages and edition optional"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Starting migration to make pages and edition optional...")
        
        # First, check if the books table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='books'")
        if not cursor.fetchone():
            print("Books table not found. Creating new table with updated schema...")
            conn.close()
            return True
        
        # Check current schema
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        print("Current books table schema:")
        for col in columns:
            print(f"  {col}")
        
        # Create a new table with the updated schema (matching actual current schema)
        cursor.execute('''
            CREATE TABLE books_new (
                id INTEGER PRIMARY KEY,
                access_no VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(200) NOT NULL,
                author_1 VARCHAR(200) NOT NULL,
                author_2 VARCHAR(200),
                author_3 VARCHAR(200),
                author_4 VARCHAR(200),
                author VARCHAR(200),
                publisher VARCHAR(100),
                department VARCHAR(100),
                category VARCHAR(50),
                location VARCHAR(50),
                number_of_copies INTEGER,
                available_copies INTEGER,
                isbn VARCHAR(20),
                pages INTEGER DEFAULT 0,
                price NUMERIC(10, 2) NOT NULL,
                edition VARCHAR(50) DEFAULT 'Not Specified',
                created_at DATETIME
            )
        ''')
        
        # Copy data from old table to new table
        cursor.execute('''
            INSERT INTO books_new (
                id, access_no, title, author_1, author_2, author_3, author_4,
                author, publisher, department, category, location,
                number_of_copies, available_copies, isbn,
                pages, price, edition, created_at
            )
            SELECT 
                id, access_no, title, author_1, author_2, author_3, author_4,
                author, publisher, department, category, location,
                number_of_copies, available_copies, isbn,
                COALESCE(pages, 0) as pages,
                price,
                COALESCE(edition, 'Not Specified') as edition,
                created_at
            FROM books
        ''')
        
        # Drop the old table and rename the new one
        cursor.execute('DROP TABLE books')
        cursor.execute('ALTER TABLE books_new RENAME TO books')
        
        # Commit the changes
        conn.commit()
        
        # Verify the migration
        cursor.execute("SELECT COUNT(*) FROM books")
        count = cursor.fetchone()[0]
        print(f"Migration completed successfully. Books table now has {count} records.")
        
        # Show updated schema
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        print("\nUpdated books table schema:")
        for col in columns:
            print(f"  {col}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        return False

def main():
    # Determine database path
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        # Default paths to try
        possible_paths = [
            os.path.join(os.path.dirname(__file__), '..', 'instance', 'library.db'),
            os.path.join(os.path.dirname(__file__), 'instance', 'library.db'),
            'library.db'
        ]
        
        db_path = None
        for path in possible_paths:
            if os.path.exists(path):
                db_path = os.path.abspath(path)
                break
        
        if not db_path:
            print("Database file not found. Please specify the path as an argument.")
            print("Usage: python migrate_optional_fields.py [path_to_database]")
            sys.exit(1)
    
    print(f"Using database: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        sys.exit(1)
    
    # Create backup
    backup_path = backup_database(db_path)
    
    # Run migration
    if migrate_optional_fields(db_path):
        print("Migration completed successfully!")
        print(f"Backup saved at: {backup_path}")
    else:
        print("Migration failed!")
        sys.exit(1)

if __name__ == '__main__':
    main()
