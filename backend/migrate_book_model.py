#!/usr/bin/env python3
"""
Migration script to update the books table with new fields
- Multiple authors support (author_1, author_2, author_3, author_4)
- Additional mandatory fields (pages, price, edition)
- Access number field
"""

import sqlite3
import os
import sys

def run_migration():
    """Add new columns to the books table"""
    
    # Database path
    db_path = 'instance/library.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please ensure the Flask app has been run at least once.")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting books table migration...")
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(books)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Current columns: {existing_columns}")
        
        # Define new columns to add
        new_columns = [
            ('access_no', 'TEXT'),
            ('author_1', 'TEXT'),
            ('author_2', 'TEXT'),
            ('author_3', 'TEXT'),
            ('author_4', 'TEXT'),
            ('pages', 'INTEGER'),
            ('price', 'REAL'),
            ('edition', 'TEXT'),
            ('department', 'TEXT'),
            ('number_of_copies', 'INTEGER')
        ]
        
        # Add columns that don't exist
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                print(f"➕ Adding column: {column_name} ({column_type})")
                cursor.execute(f"ALTER TABLE books ADD COLUMN {column_name} {column_type}")
            else:
                print(f"✓ Column already exists: {column_name}")
        
        # Rename total_copies to number_of_copies if needed
        if 'total_copies' in existing_columns and 'number_of_copies' not in existing_columns:
            print("🔄 Renaming total_copies to number_of_copies...")
            # SQLite doesn't support column rename directly, so we'll copy the data
            cursor.execute("UPDATE books SET number_of_copies = total_copies WHERE number_of_copies IS NULL")
        
        print("🔄 Migrating existing book data...")
        
        # Generate access numbers for existing books without them
        cursor.execute("SELECT id, title FROM books WHERE access_no IS NULL")
        books_without_access_no = cursor.fetchall()
        
        for book_id, title in books_without_access_no:
            # Generate a simple access number
            access_no = f"B{book_id:04d}"
            cursor.execute("UPDATE books SET access_no = ? WHERE id = ?", (access_no, book_id))
            print(f"  📖 Generated access_no {access_no} for: {title}")
        
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
        
        # Set default department if not set
        cursor.execute("""
            UPDATE books 
            SET department = 'General' 
            WHERE department IS NULL
        """)
        
        # Ensure number_of_copies has a default value
        cursor.execute("""
            UPDATE books 
            SET number_of_copies = COALESCE(total_copies, 1)
            WHERE number_of_copies IS NULL
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
                SELECT access_no, title, author_1, author_2, pages, price, edition 
                FROM books 
                LIMIT 3
            """)
            sample_books = cursor.fetchall()
            print("\n📖 Sample migrated data:")
            for book in sample_books:
                authors = book[2]
                if book[3]:  # author_2 exists
                    authors += f" and {book[3]}"
                print(f"  - [{book[0]}] {book[1]} by {authors}")
                print(f"    Pages: {book[4]} | Price: ${book[5]} | Edition: {book[6]}")
        
        conn.close()
        
        print("\n✅ Migration completed successfully!")
        print("🚀 You can now restart the Flask application to use the new features.")
        print("\n📋 New features available:")
        print("  ✓ Multiple authors support (up to 4 authors)")
        print("  ✓ Book pages, price, and edition tracking")
        print("  ✓ Access number system")
        print("  ✓ Department categorization")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def check_migration_status():
    """Check if migration has been applied"""
    
    db_path = 'instance/library.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found.")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if new columns exist
        cursor.execute("PRAGMA table_info(books)")
        columns = [row[1] for row in cursor.fetchall()]
        
        required_columns = ['access_no', 'author_1', 'author_2', 'author_3', 'author_4', 'pages', 'price', 'edition']
        missing_columns = [col for col in required_columns if col not in columns]
        
        if missing_columns:
            print(f"⚠️  Migration needed. Missing columns: {missing_columns}")
            return False
        else:
            print("✅ Migration already applied. All required columns present.")
            
            # Check if data has been migrated
            cursor.execute("SELECT COUNT(*) FROM books WHERE author_1 IS NOT NULL")
            migrated_books = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM books")
            total_books = cursor.fetchone()[0]
            
            print(f"📚 Books with migrated data: {migrated_books}/{total_books}")
            return True
            
    except Exception as e:
        print(f"❌ Error checking migration status: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def show_sample_data():
    """Show sample data after migration"""
    
    db_path = 'instance/library.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT access_no, title, author_1, author_2, author_3, author_4, pages, price, edition
            FROM books 
            LIMIT 5
        """)
        
        books = cursor.fetchall()
        
        if books:
            print("\n📚 Sample Book Data:")
            print("-" * 80)
            for book in books:
                access_no, title, a1, a2, a3, a4, pages, price, edition = book
                
                # Build authors string
                authors = [a for a in [a1, a2, a3, a4] if a]
                authors_str = ", ".join(authors) if authors else "Unknown"
                
                print(f"[{access_no}] {title}")
                print(f"  Authors: {authors_str}")
                print(f"  Pages: {pages} | Price: ${price} | Edition: {edition}")
                print("-" * 80)
        else:
            print("No books found in database.")
            
    except Exception as e:
        print(f"❌ Error showing sample data: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--check':
            check_migration_status()
        elif sys.argv[1] == '--sample':
            show_sample_data()
        elif sys.argv[1] == '--force':
            run_migration()
        else:
            print("Usage: python migrate_book_model.py [--check|--sample|--force]")
    else:
        if not check_migration_status():
            print("\n🔧 Running migration...")
            run_migration()
        else:
            print("\nMigration already applied. Use --force to run anyway.")
            print("Use --sample to see sample data.")
