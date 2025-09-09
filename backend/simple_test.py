#!/usr/bin/env python3

"""
Simple test to check database connection and identify the 500 error
"""

import traceback
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("🔍 Importing Flask app...")
    from app import app, db, User, Book
    
    print("🔍 Creating app context...")
    with app.app_context():
        try:
            print("📊 Testing database connection...")
            print(f"Total books: {Book.query.count()}")
            print(f"Total users: {User.query.count()}")
            
            print("🔍 Testing books query logic...")
            page = 1
            per_page = 10
            search = ''
            
            query = Book.query
            if search:
                query = query.filter(
                    Book.title.contains(search) |
                    Book.author.contains(search) |
                    Book.access_no.contains(search)
                )
            
            print("🔍 Running pagination query...")
            books = query.paginate(page=page, per_page=per_page, error_out=False)
            print(f"✅ Query successful. Found {books.total} total books, {len(books.items)} on this page")
            
            # Test response construction for each book
            for book in books.items:
                print(f"🔍 Processing book: {book.title}")
                book_data = {
                    'id': book.id,
                    'access_no': book.access_no,
                    'call_no': getattr(book, 'call_no', None),
                    'title': book.title,
                    'author_1': getattr(book, 'author_1', None) or book.author,
                    'author_2': getattr(book, 'author_2', None),
                    'author_3': getattr(book, 'author_3', None),
                    'author_4': getattr(book, 'author_4', None),
                    'author': book.author or getattr(book, 'author_1', None),
                    'publisher': book.publisher,
                    'department': book.department,
                    'category': book.category,
                    'location': book.location,
                    'number_of_copies': book.number_of_copies,
                    'available_copies': book.available_copies,
                    'isbn': book.isbn,
                    'pages': getattr(book, 'pages', None),
                    'price': float(getattr(book, 'price', 0)) if getattr(book, 'price', None) else None,
                    'edition': getattr(book, 'edition', None),
                    'created_at': book.created_at.isoformat()
                }
                print(f"✅ Book processed successfully: {book_data['title']}")
            
            print("✅ All tests passed! The endpoint logic should work.")
            
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
            print("📋 Traceback:")
            traceback.print_exc()
            
except Exception as e:
    print(f"❌ Import/setup error: {str(e)}")
    print("📋 Traceback:")
    traceback.print_exc()
