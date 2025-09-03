#!/usr/bin/env python3
"""
Script to create the thesis table
"""

from app import app, db, Thesis

def create_thesis_table():
    """Create the thesis table"""
    with app.app_context():
        try:
            # Create all tables (including the new Thesis table)
            db.create_all()
            print("✅ Database tables created successfully!")
            print("✅ Thesis table is now available")
            
            # Check if the table was created
            thesis_count = Thesis.query.count()
            print(f"📚 Current thesis count: {thesis_count}")
            
        except Exception as e:
            print(f"❌ Error creating tables: {str(e)}")

if __name__ == '__main__':
    create_thesis_table()
