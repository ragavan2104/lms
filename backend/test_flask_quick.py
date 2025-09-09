#!/usr/bin/env python3

"""
Quick test to verify Flask app works after removing call_no
"""

import os
import sys
from datetime import datetime

def test_flask_app():
    try:
        print("🔍 Testing Flask app after call_no fix...")
        
        # Import Flask app
        from app import app, db, Book, User, College, Circulation, Ebook, Fine
        
        with app.app_context():
            print("✅ App context created successfully")
            
            # Test database connection
            try:
                # Test basic model queries
                book_count = Book.query.count()
                user_count = User.query.count()
                college_count = College.query.count()
                
                print(f"📊 Books: {book_count}")
                print(f"📊 Users: {user_count}")
                print(f"📊 Colleges: {college_count}")
                
                # Test the specific query from dashboard stats
                total_books = Book.query.count()
                total_students = User.query.filter_by(role='student').count()
                available_books = db.session.query(db.func.sum(Book.available_copies)).scalar() or 0
                
                print(f"📊 Total books: {total_books}")
                print(f"📊 Total students: {total_students}")
                print(f"📊 Available books: {available_books}")
                
                print("✅ All database queries successful!")
                return True
                
            except Exception as db_error:
                print(f"❌ Database error: {str(db_error)}")
                return False
                
    except Exception as e:
        print(f"❌ Flask app error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_flask_app()
    if success:
        print("\n🚀 Flask app is working! You can now start the server.")
    else:
        print("\n❌ Flask app still has issues!")
