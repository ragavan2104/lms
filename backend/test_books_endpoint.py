#!/usr/bin/env python3

"""
Test script for the books endpoint to debug the 500 error
"""

import sys
import traceback
from app import app, db, User, Book

def test_books_endpoint():
    with app.app_context():
        try:
            print("🔍 Testing books endpoint logic...")
            
            # Test database connection
            print(f"📊 Total books: {Book.query.count()}")
            print(f"📊 Total users: {User.query.count()}")
            
            # Test the query logic from the endpoint
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
            print(f"✅ Pagination successful. Found {len(books.items)} books")
            
            # Test the response construction
            print("🔍 Building response...")
            response_data = []
            for book in books.items:
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
                response_data.append(book_data)
                print(f"✅ Processed book: {book_data['title']}")
            
            final_response = {
                'books': response_data,
                'pagination': {
                    'page': books.page,
                    'pages': books.pages,
                    'per_page': books.per_page,
                    'total': books.total
                }
            }
            
            print("✅ Response construction successful!")
            print(f"📊 Response: {final_response}")
            
        except Exception as e:
            print(f"❌ Error occurred: {str(e)}")
            print(f"📋 Traceback:")
            traceback.print_exc()

if __name__ == "__main__":
    test_books_endpoint()
