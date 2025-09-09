#!/usr/bin/env python3

"""
Minimal Flask app to test database connection
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Create minimal Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define minimal Book model
class Book(db.Model):
    __tablename__ = 'books'
    
    id = db.Column(db.Integer, primary_key=True)
    access_no = db.Column(db.String(50), nullable=False, unique=True)
    call_no = db.Column(db.String(100), nullable=True)  # This is the problematic column
    title = db.Column(db.String(200), nullable=False)
    author_1 = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=True)
    publisher = db.Column(db.String(100))
    department = db.Column(db.String(100))
    category = db.Column(db.String(50))
    location = db.Column(db.String(50))
    number_of_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    isbn = db.Column(db.String(20))
    pages = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    edition = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def test_minimal_connection():
    try:
        with app.app_context():
            print("🔍 Testing minimal database connection...")
            
            # Check database file exists
            db_path = os.path.abspath('../instance/library.db')
            print(f"📂 Database path: {db_path}")
            print(f"📂 Database exists: {os.path.exists(db_path)}")
            
            # Test connection
            print("🔍 Testing database query...")
            count = Book.query.count()
            print(f"📊 Book count: {count}")
            
            # Test specific query that was failing
            print("🔍 Testing query with call_no...")
            books = Book.query.filter(Book.available_copies > 0).limit(5).all()
            print(f"📊 Available books: {len(books)}")
            
            print("✅ Minimal database test successful!")
            return True
            
    except Exception as e:
        print(f"❌ Error in minimal test: {str(e)}")
        print(f"📋 Error type: {type(e).__name__}")
        
        # Check the actual database schema
        try:
            import sqlite3
            conn = sqlite3.connect('../instance/library.db')
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(books)")
            columns = cursor.fetchall()
            print("📋 Actual database schema:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            conn.close()
        except Exception as schema_error:
            print(f"❌ Could not check schema: {schema_error}")
        
        return False

if __name__ == "__main__":
    success = test_minimal_connection()
    if success:
        print("\n🚀 Database connection works! The issue might be elsewhere.")
    else:
        print("\n❌ Database connection failed!")
