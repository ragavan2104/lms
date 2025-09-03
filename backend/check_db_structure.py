#!/usr/bin/env python3
"""
Check database structure and add missing columns if needed
"""

import sqlite3
import os

def check_and_fix_database():
    """Check database structure and add missing columns"""
    
    db_path = 'instance/library.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found at:", db_path)
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Checking books table structure...")
        
        # Get current table structure
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        
        print("📋 Current columns in books table:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        existing_column_names = [col[1] for col in columns]
        
        # Define required columns
        required_columns = {
            'access_no': 'TEXT',
            'author_1': 'TEXT',
            'author_2': 'TEXT',
            'author_3': 'TEXT',
            'author_4': 'TEXT',
            'pages': 'INTEGER',
            'price': 'REAL',
            'edition': 'TEXT',
            'department': 'TEXT',
            'number_of_copies': 'INTEGER'
        }
        
        # Check which columns are missing
        missing_columns = []
        for col_name, col_type in required_columns.items():
            if col_name not in existing_column_names:
                missing_columns.append((col_name, col_type))
        
        if missing_columns:
            print(f"\n⚠️  Missing columns: {[col[0] for col in missing_columns]}")
            print("🔧 Adding missing columns...")
            
            for col_name, col_type in missing_columns:
                try:
                    cursor.execute(f"ALTER TABLE books ADD COLUMN {col_name} {col_type}")
                    print(f"  ✓ Added column: {col_name} ({col_type})")
                except Exception as e:
                    print(f"  ❌ Failed to add {col_name}: {str(e)}")
            
            # Migrate existing data
            print("\n🔄 Migrating existing data...")
            
            # Update author_1 with existing author data
            cursor.execute("""
                UPDATE books 
                SET author_1 = author 
                WHERE author_1 IS NULL AND author IS NOT NULL
            """)
            
            # Set default values for new mandatory fields
            cursor.execute("UPDATE books SET pages = 100 WHERE pages IS NULL")
            cursor.execute("UPDATE books SET price = 0.00 WHERE price IS NULL")
            cursor.execute("UPDATE books SET edition = '1st Edition' WHERE edition IS NULL")
            cursor.execute("UPDATE books SET department = 'General' WHERE department IS NULL")
            
            # Handle number_of_copies
            if 'total_copies' in existing_column_names:
                cursor.execute("""
                    UPDATE books 
                    SET number_of_copies = total_copies 
                    WHERE number_of_copies IS NULL AND total_copies IS NOT NULL
                """)
            else:
                cursor.execute("UPDATE books SET number_of_copies = 1 WHERE number_of_copies IS NULL")
            
            # Generate access numbers for books without them
            cursor.execute("SELECT id, title FROM books WHERE access_no IS NULL OR access_no = ''")
            books_without_access = cursor.fetchall()
            
            for book_id, title in books_without_access:
                access_no = f"B{book_id:04d}"
                cursor.execute("UPDATE books SET access_no = ? WHERE id = ?", (access_no, book_id))
                print(f"  📖 Generated access_no {access_no} for: {title}")
            
            conn.commit()
            print("✅ Migration completed successfully!")
            
        else:
            print("✅ All required columns are present!")
        
        # Show sample data
        print("\n📚 Sample book data:")
        cursor.execute("""
            SELECT access_no, title, author_1, author_2, pages, price, edition 
            FROM books 
            LIMIT 3
        """)
        
        sample_books = cursor.fetchall()
        for book in sample_books:
            access_no, title, author_1, author_2, pages, price, edition = book
            authors = author_1
            if author_2:
                authors += f" and {author_2}"
            print(f"  [{access_no}] {title} by {authors}")
            print(f"    Pages: {pages} | Price: ₹{price} | Edition: {edition}")
        
        # Count total books
        cursor.execute("SELECT COUNT(*) FROM books")
        total_books = cursor.fetchone()[0]
        print(f"\n📊 Total books in database: {total_books}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == '__main__':
    print("🔍 CHECKING DATABASE STRUCTURE")
    print("=" * 50)
    
    success = check_and_fix_database()
    
    if success:
        print("\n🚀 Database is ready! You can now:")
        print("  1. Restart the Flask application")
        print("  2. Test adding/editing books with new fields")
        print("  3. Check that pages, price, and edition are displayed correctly")
    else:
        print("\n❌ Database check failed. Please check the error messages above.")
