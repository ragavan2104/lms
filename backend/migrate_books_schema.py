#!/usr/bin/env python3
"""
Database migration script to add new fields to books table
- Multiple authors support (author_1, author_2, author_3, author_4)
- Additional mandatory fields (pages, price, edition)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Book
from sqlalchemy import text

def migrate_books_table():
    """Add new columns to the books table"""
    
    with app.app_context():
        try:
            print("🔄 Starting books table migration...")
            
            # Check if columns already exist
            inspector = db.inspect(db.engine)
            existing_columns = [col['name'] for col in inspector.get_columns('books')]
            
            print(f"📋 Current columns: {existing_columns}")
            
            # Define new columns to add
            new_columns = [
                ('author_1', 'VARCHAR(200)'),
                ('author_2', 'VARCHAR(200)'),
                ('author_3', 'VARCHAR(200)'),
                ('author_4', 'VARCHAR(200)'),
                ('pages', 'INTEGER'),
                ('price', 'DECIMAL(10,2)'),
                ('edition', 'VARCHAR(50)')
            ]
            
            # Add columns that don't exist
            for column_name, column_type in new_columns:
                if column_name not in existing_columns:
                    print(f"➕ Adding column: {column_name} ({column_type})")
                    
                    # Add the column
                    if column_name in ['author_1', 'pages', 'price', 'edition']:
                        # These will be mandatory, but we'll add them as nullable first
                        db.engine.execute(text(f"ALTER TABLE books ADD COLUMN {column_name} {column_type}"))
                    else:
                        # Optional author fields
                        db.engine.execute(text(f"ALTER TABLE books ADD COLUMN {column_name} {column_type}"))
                else:
                    print(f"✓ Column already exists: {column_name}")
            
            # Migrate existing data
            print("🔄 Migrating existing book data...")
            
            # Get all books
            books = Book.query.all()
            
            for book in books:
                # Migrate author field to author_1 if author_1 is empty
                if not book.author_1 and book.author:
                    book.author_1 = book.author
                    print(f"  📖 Migrated author for: {book.title}")
                
                # Set default values for new mandatory fields if they're empty
                if not book.pages:
                    book.pages = 100  # Default page count
                    print(f"  📄 Set default pages for: {book.title}")
                
                if not book.price:
                    book.price = 0.00  # Default price
                    print(f"  💰 Set default price for: {book.title}")
                
                if not book.edition:
                    book.edition = "1st Edition"  # Default edition
                    print(f"  📚 Set default edition for: {book.title}")
            
            # Commit the data migration
            db.session.commit()
            
            # Now make the mandatory fields NOT NULL
            print("🔒 Setting mandatory field constraints...")
            
            mandatory_fields = ['author_1', 'pages', 'price', 'edition']
            for field in mandatory_fields:
                try:
                    # Note: SQLite doesn't support ALTER COLUMN, so we'll skip this for SQLite
                    if 'sqlite' not in str(db.engine.url):
                        db.engine.execute(text(f"ALTER TABLE books ALTER COLUMN {field} SET NOT NULL"))
                        print(f"  ✓ Set {field} as NOT NULL")
                    else:
                        print(f"  ⚠️ Skipping NOT NULL constraint for {field} (SQLite limitation)")
                except Exception as e:
                    print(f"  ⚠️ Could not set NOT NULL for {field}: {str(e)}")
            
            print("\n✅ Migration completed successfully!")
            print("\n📊 Migration Summary:")
            print("  ✓ Added multiple author fields (author_1, author_2, author_3, author_4)")
            print("  ✓ Added pages field (integer)")
            print("  ✓ Added price field (decimal)")
            print("  ✓ Added edition field (text)")
            print("  ✓ Migrated existing author data to author_1")
            print("  ✓ Set default values for new mandatory fields")
            
            # Show updated schema
            inspector = db.inspect(db.engine)
            updated_columns = [col['name'] for col in inspector.get_columns('books')]
            print(f"\n📋 Updated columns: {updated_columns}")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            db.session.rollback()
            raise

def verify_migration():
    """Verify that the migration was successful"""
    
    with app.app_context():
        try:
            print("\n🔍 Verifying migration...")
            
            # Check if we can query with new fields
            book_count = Book.query.count()
            print(f"✓ Total books in database: {book_count}")
            
            if book_count > 0:
                # Check first book
                first_book = Book.query.first()
                print(f"✓ Sample book data:")
                print(f"  Title: {first_book.title}")
                print(f"  Author 1: {first_book.author_1}")
                print(f"  Author 2: {first_book.author_2 or 'None'}")
                print(f"  Pages: {first_book.pages}")
                print(f"  Price: ${first_book.price}")
                print(f"  Edition: {first_book.edition}")
            
            print("✅ Migration verification successful!")
            return True
            
        except Exception as e:
            print(f"❌ Migration verification failed: {str(e)}")
            return False

def rollback_migration():
    """Rollback the migration (remove new columns)"""
    
    with app.app_context():
        try:
            print("🔄 Rolling back migration...")
            
            # Columns to remove
            columns_to_remove = ['author_1', 'author_2', 'author_3', 'author_4', 'pages', 'price', 'edition']
            
            for column in columns_to_remove:
                try:
                    db.engine.execute(text(f"ALTER TABLE books DROP COLUMN {column}"))
                    print(f"✓ Removed column: {column}")
                except Exception as e:
                    print(f"⚠️ Could not remove column {column}: {str(e)}")
            
            print("✅ Rollback completed!")
            
        except Exception as e:
            print(f"❌ Rollback failed: {str(e)}")
            raise

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Books table migration script')
    parser.add_argument('--rollback', action='store_true', help='Rollback the migration')
    parser.add_argument('--verify', action='store_true', help='Verify migration only')
    
    args = parser.parse_args()
    
    if args.rollback:
        rollback_migration()
    elif args.verify:
        verify_migration()
    else:
        migrate_books_table()
        verify_migration()
