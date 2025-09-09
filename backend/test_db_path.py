#!/usr/bin/env python3

"""
Test database path and schema to debug the call_no column issue
"""

import os
import sqlite3
from app import app, db

def test_database_path():
    with app.app_context():
        # Get the actual database URI
        database_uri = app.config['SQLALCHEMY_DATABASE_URI']
        print(f"🔍 Database URI: {database_uri}")
        
        # Extract the file path from the URI
        if database_uri.startswith('sqlite:///'):
            db_path = database_uri[10:]  # Remove 'sqlite:///'
            print(f"📁 Database file path: {db_path}")
            
            # Check if the file exists
            abs_path = os.path.abspath(db_path)
            print(f"📁 Absolute path: {abs_path}")
            print(f"📋 File exists: {os.path.exists(abs_path)}")
            
            if os.path.exists(abs_path):
                # Check the schema directly
                conn = sqlite3.connect(abs_path)
                cursor = conn.cursor()
                cursor.execute('PRAGMA table_info(books)')
                columns = [row[1] for row in cursor.fetchall()]
                print(f"📊 Columns in books table: {columns}")
                print(f"✅ call_no exists: {'call_no' in columns}")
                
                # Count books
                cursor.execute('SELECT COUNT(*) FROM books')
                count = cursor.fetchone()[0]
                print(f"📚 Total books: {count}")
                
                conn.close()
            else:
                print("❌ Database file not found!")
        
        # Test SQLAlchemy connection
        try:
            from app import Book
            print(f"📊 SQLAlchemy Book.query.count(): {Book.query.count()}")
        except Exception as e:
            print(f"❌ SQLAlchemy error: {e}")

if __name__ == "__main__":
    test_database_path()
