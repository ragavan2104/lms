#!/usr/bin/env python3

"""
Force SQLAlchemy metadata refresh and database recreation
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import sqlite3

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def fix_database_metadata():
    try:
        with app.app_context():
            print("🔍 Forcing SQLAlchemy metadata refresh...")
            
            # Clear any cached metadata
            db.metadata.clear()
            
            # Force SQLAlchemy to reflect the actual database schema
            print("🔍 Reflecting database schema...")
            db.metadata.reflect(bind=db.engine)
            
            # Check what tables SQLAlchemy sees
            print("📋 Tables SQLAlchemy sees:")
            for table_name in db.metadata.tables.keys():
                print(f"  - {table_name}")
                
                if table_name == 'books':
                    table = db.metadata.tables[table_name]
                    print(f"    Columns in {table_name}:")
                    for column in table.columns:
                        print(f"      - {column.name} ({column.type})")
            
            # Try to create a dynamic model based on reflected schema
            print("🔍 Creating dynamic Book model...")
            books_table = db.metadata.tables.get('books')
            
            if books_table is not None:
                # Check if call_no column exists in reflected table
                has_call_no = 'call_no' in [col.name for col in books_table.columns]
                print(f"📋 call_no column in reflected table: {has_call_no}")
                
                if has_call_no:
                    # Try a direct SQL query
                    print("🔍 Testing direct SQL query...")
                    result = db.engine.execute("SELECT COUNT(*) FROM books")
                    count = result.fetchone()[0]
                    print(f"📊 Book count (direct SQL): {count}")
                    
                    # Try querying with call_no
                    print("🔍 Testing call_no column directly...")
                    result = db.engine.execute("SELECT call_no FROM books LIMIT 1")
                    call_no_result = result.fetchone()
                    print(f"📊 Sample call_no: {call_no_result}")
                    
                    print("✅ Database metadata refresh successful!")
                    return True
                else:
                    print("❌ call_no column not found in reflected schema!")
                    return False
            else:
                print("❌ books table not found in reflected metadata!")
                return False
                
    except Exception as e:
        print(f"❌ Error in metadata refresh: {str(e)}")
        return False

def recreate_database_with_correct_schema():
    """
    As a last resort, recreate the books table with the correct schema
    """
    try:
        print("🔨 Recreating books table with correct schema...")
        
        # Backup existing data
        conn = sqlite3.connect('../instance/library.db')
        cursor = conn.cursor()
        
        # Get existing data
        cursor.execute("SELECT * FROM books")
        existing_books = cursor.fetchall()
        print(f"📊 Found {len(existing_books)} existing books to preserve")
        
        # Get column names
        cursor.execute("PRAGMA table_info(books)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        print(f"📋 Existing columns: {column_names}")
        
        # Drop and recreate table
        cursor.execute("DROP TABLE IF EXISTS books_backup")
        cursor.execute("CREATE TABLE books_backup AS SELECT * FROM books")
        
        cursor.execute("DROP TABLE books")
        
        # Create new table with correct schema
        create_table_sql = """
        CREATE TABLE books (
            id INTEGER PRIMARY KEY,
            access_no VARCHAR(50) NOT NULL UNIQUE,
            call_no VARCHAR(100),
            title VARCHAR(200) NOT NULL,
            author_1 VARCHAR(200) NOT NULL,
            author_2 VARCHAR(200),
            author_3 VARCHAR(200),
            author_4 VARCHAR(200),
            author VARCHAR(200),
            publisher VARCHAR(100),
            department VARCHAR(100),
            category VARCHAR(50),
            location VARCHAR(50),
            number_of_copies INTEGER DEFAULT 1,
            available_copies INTEGER DEFAULT 1,
            isbn VARCHAR(20),
            pages INTEGER NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            edition VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        cursor.execute(create_table_sql)
        
        # Restore data if any existed
        if existing_books:
            # Create insert statement with all columns
            placeholders = ', '.join(['?' for _ in column_names])
            insert_sql = f"INSERT INTO books ({', '.join(column_names)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, existing_books)
        
        conn.commit()
        conn.close()
        
        print("✅ Books table recreated successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error recreating table: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 Attempting to fix database metadata issues...")
    
    success = fix_database_metadata()
    
    if not success:
        print("\n🔨 Metadata refresh failed, attempting table recreation...")
        success = recreate_database_with_correct_schema()
        
        if success:
            print("\n🔍 Testing after recreation...")
            success = fix_database_metadata()
    
    if success:
        print("\n🚀 Database metadata fixed! SQLAlchemy should work now.")
    else:
        print("\n❌ Could not fix database metadata issues!")
