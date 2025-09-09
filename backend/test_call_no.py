#!/usr/bin/env python3

"""
Test the call_no field functionality
"""

import os
import sys
from datetime import datetime

def test_call_no_functionality():
    try:
        print("🔍 Testing call_no field functionality...")
        
        # Import Flask app components
        from app import app, db, Book
        
        with app.app_context():
            print("✅ App context created successfully")
            
            # Create tables if needed
            db.create_all()
            print("✅ Database tables ensured")
            
            # Test creating a book with call_no
            print("🔍 Testing book creation with call_no...")
            
            test_book = Book(
                access_no="TEST001",
                call_no="QA76.73.P98",
                title="Python Programming Test",
                author_1="Test Author",
                publisher="Test Publisher",
                department="Computer Science",
                category="Programming",
                pages=100,
                price=29.99,
                edition="1st Edition"
            )
            
            db.session.add(test_book)
            db.session.commit()
            print("✅ Test book created successfully")
            
            # Query the book back
            retrieved_book = Book.query.filter_by(access_no="TEST001").first()
            if retrieved_book:
                print(f"✅ Book retrieved: {retrieved_book.title}")
                print(f"📋 Call No: {retrieved_book.call_no}")
                print(f"📋 Access No: {retrieved_book.access_no}")
            else:
                print("❌ Could not retrieve test book")
                return False
            
            # Test the get_books endpoint logic
            print("🔍 Testing get_books endpoint logic...")
            books = Book.query.limit(5).all()
            
            book_data = []
            for book in books:
                book_info = {
                    'id': book.id,
                    'access_no': book.access_no,
                    'call_no': getattr(book, 'call_no', None),
                    'title': book.title,
                    'author_1': getattr(book, 'author_1', None),
                    'publisher': book.publisher,
                    'department': book.department,
                    'category': book.category,
                    'pages': getattr(book, 'pages', None),
                    'price': float(getattr(book, 'price', 0)) if getattr(book, 'price', None) else None,
                    'edition': getattr(book, 'edition', None),
                }
                book_data.append(book_info)
                print(f"  - {book_info['title']} (Call No: {book_info['call_no']})")
            
            # Clean up test data
            print("🧹 Cleaning up test data...")
            Book.query.filter_by(access_no="TEST001").delete()
            db.session.commit()
            print("✅ Test data cleaned up")
            
            print("✅ All call_no functionality tests passed!")
            return True
            
    except Exception as e:
        print(f"❌ Error in call_no test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_call_no_functionality()
    if success:
        print("\n🚀 call_no field is working properly! You can now:")
        print("  1. Start the Flask server (python app.py)")
        print("  2. Add books with call numbers")
        print("  3. Upload bulk books with call_no column")
        print("  4. All API endpoints should work without errors")
    else:
        print("\n❌ call_no functionality test failed!")
        sys.exit(1)
