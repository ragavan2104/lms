#!/usr/bin/env python3
"""
Simple migration script to add new columns to books table
"""

import sqlite3
import os

def run_migration():
    """Add new columns to the books table"""
    
    # Database path
    db_path = 'library.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please ensure the Flask app has been run at least once.")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting database migration...")
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(books)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Current columns: {existing_columns}")
        
        # Define new columns to add
        new_columns = [
            ('author_1', 'TEXT'),
            ('author_2', 'TEXT'),
            ('author_3', 'TEXT'),
            ('author_4', 'TEXT'),
            ('pages', 'INTEGER'),
            ('price', 'REAL'),
            ('edition', 'TEXT')
        ]
        
        # Add columns that don't exist
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                print(f"➕ Adding column: {column_name} ({column_type})")
                cursor.execute(f"ALTER TABLE books ADD COLUMN {column_name} {column_type}")
            else:
                print(f"✓ Column already exists: {column_name}")
        
        # Migrate existing data
        print("🔄 Migrating existing book data...")
        
        # Update author_1 with existing author data where author_1 is null
        cursor.execute("""
            UPDATE books 
            SET author_1 = author 
            WHERE author_1 IS NULL AND author IS NOT NULL
        """)
        
        # Set default values for new mandatory fields
        cursor.execute("""
            UPDATE books 
            SET pages = 100 
            WHERE pages IS NULL
        """)
        
        cursor.execute("""
            UPDATE books 
            SET price = 0.00 
            WHERE price IS NULL
        """)
        
        cursor.execute("""
            UPDATE books 
            SET edition = '1st Edition' 
            WHERE edition IS NULL
        """)
        
        # Commit changes
        conn.commit()
        
        # Verify migration
        cursor.execute("PRAGMA table_info(books)")
        updated_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Updated columns: {updated_columns}")
        
        # Count books
        cursor.execute("SELECT COUNT(*) FROM books")
        book_count = cursor.fetchone()[0]
        print(f"📚 Total books in database: {book_count}")
        
        if book_count > 0:
            # Show sample data
            cursor.execute("""
                SELECT title, author_1, author_2, pages, price, edition 
                FROM books 
                LIMIT 3
            """)
            sample_books = cursor.fetchall()
            print("\n📖 Sample migrated data:")
            for book in sample_books:
                print(f"  - {book[0]} by {book[1]} | Pages: {book[3]} | Price: ${book[4]} | Edition: {book[5]}")
        
        conn.close()
        
        print("\n✅ Migration completed successfully!")
        print("🚀 You can now restart the Flask application to use the new features.")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def check_migration_status():
    """Check if migration has been applied"""
    
    db_path = 'library.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found.")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if new columns exist
        cursor.execute("PRAGMA table_info(books)")
        columns = [row[1] for row in cursor.fetchall()]
        
        required_columns = ['author_1', 'author_2', 'author_3', 'author_4', 'pages', 'price', 'edition']
        missing_columns = [col for col in required_columns if col not in columns]
        
        if missing_columns:
            print(f"⚠️  Migration needed. Missing columns: {missing_columns}")
            return False
        else:
            print("✅ Migration already applied. All columns present.")
            return True
            
    except Exception as e:
        print(f"❌ Error checking migration status: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        check_migration_status()
    else:
        if not check_migration_status():
            run_migration()
        else:
            print("Migration already applied. Use --force to run anyway.")
