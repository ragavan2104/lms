#!/usr/bin/env python3
"""
Database migration script to add Category table and update existing data.
This script will:
1. Create the categories table
2. Extract unique categories from existing books
3. Populate the categories table with existing data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import from app.py since models are defined there
from app import app, db, Category, Book, Ebook
from datetime import datetime

def migrate_categories():
    """Add Category table and migrate existing category data"""
    
    with app.app_context():
        print("Starting category migration...")
        
        try:
            # Create the categories table
            print("Creating categories table...")
            db.create_all()
            print("✓ Categories table created successfully")
            
            # Get unique categories from books
            print("Extracting unique categories from books...")
            book_categories = db.session.query(Book.category).filter(
                Book.category.isnot(None),
                Book.category != ''
            ).distinct().all()
            
            ebook_categories = db.session.query(Ebook.category).filter(
                Ebook.category.isnot(None),
                Ebook.category != ''
            ).distinct().all()
            
            # Combine and deduplicate categories
            all_categories = set()
            for cat in book_categories:
                if cat[0] and cat[0].strip():
                    all_categories.add(cat[0].strip())
            
            for cat in ebook_categories:
                if cat[0] and cat[0].strip():
                    all_categories.add(cat[0].strip())
            
            print(f"Found {len(all_categories)} unique categories: {list(all_categories)}")
            
            # Create category records
            created_count = 0
            for category_name in all_categories:
                # Check if category already exists
                existing = Category.query.filter_by(name=category_name).first()
                if not existing:
                    category = Category(
                        name=category_name,
                        description=f"Auto-migrated category: {category_name}",
                        created_by=1  # Assume admin user with ID 1
                    )
                    db.session.add(category)
                    created_count += 1
                    print(f"✓ Created category: {category_name}")
                else:
                    print(f"- Category already exists: {category_name}")
            
            # Add some default categories if none exist
            if len(all_categories) == 0:
                print("No existing categories found. Adding default categories...")
                default_categories = [
                    ("Fiction", "Fiction books and novels"),
                    ("Non-Fiction", "Non-fiction books and reference materials"),
                    ("Science", "Science and technology books"),
                    ("History", "History and historical books"),
                    ("Biography", "Biographies and autobiographies"),
                    ("Education", "Educational and academic books"),
                    ("Literature", "Literature and poetry"),
                    ("Technology", "Technology and computer science books"),
                    ("Business", "Business and management books"),
                    ("Health", "Health and medical books")
                ]
                
                for name, description in default_categories:
                    category = Category(
                        name=name,
                        description=description,
                        created_by=1
                    )
                    db.session.add(category)
                    created_count += 1
                    print(f"✓ Created default category: {name}")
            
            # Commit all changes
            db.session.commit()
            print(f"✓ Successfully created {created_count} categories")
            
            # Verify the migration
            total_categories = Category.query.count()
            print(f"✓ Total categories in database: {total_categories}")
            
            print("\n" + "="*50)
            print("CATEGORY MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*50)
            print("\nNext steps:")
            print("1. Restart your Flask application")
            print("2. Test the 'Add Category' functionality in the admin panel")
            print("3. Verify that categories appear in book form dropdowns")
            
        except Exception as e:
            print(f"✗ Migration failed: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    migrate_categories()
