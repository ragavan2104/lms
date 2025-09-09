#!/usr/bin/env python3

"""
Test Flask app database connection and fix any issues
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_database_connection():
    try:
        print("🔍 Testing Flask app database connection...")
        
        # Import Flask app components
        from app import app, db, Book, User
        
        with app.app_context():
            print("✅ App context created successfully")
            
            # Test database connection
            try:
                # Create all tables if they don't exist
                db.create_all()
                print("✅ Database tables created/verified")
                
                # Test basic queries
                book_count = Book.query.count()
                user_count = User.query.count()
                
                print(f"📊 Books in database: {book_count}")
                print(f"📊 Users in database: {user_count}")
                
                # Test a simple book query with call_no
                print("🔍 Testing Book model with call_no...")
                books = Book.query.limit(5).all()
                
                for book in books:
                    print(f"  - Book: {book.title}, Call No: {getattr(book, 'call_no', 'N/A')}")
                
                print("✅ Database connection test successful!")
                return True
                
            except Exception as db_error:
                print(f"❌ Database error: {str(db_error)}")
                print(f"📋 Error type: {type(db_error).__name__}")
                
                # Try to inspect the actual database schema
                try:
                    result = db.engine.execute("PRAGMA table_info(books)")
                    columns = result.fetchall()
                    print("📋 Actual database columns:")
                    for col in columns:
                        print(f"  - {col[1]} ({col[2]})")
                except Exception as schema_error:
                    print(f"❌ Could not check schema: {schema_error}")
                
                return False
                
    except ImportError as import_error:
        print(f"❌ Import error: {str(import_error)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    if not success:
        print("\n❌ Database connection test failed!")
        sys.exit(1)
    else:
        print("\n🚀 Database connection test passed! Flask app should work now.")
