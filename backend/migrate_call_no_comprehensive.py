#!/usr/bin/env python3

"""
Comprehensive migration script to add call_no field to books table
"""

import sqlite3
import os
import sys
from datetime import datetime

def backup_database():
    """Create a backup of the database before migration"""
    db_path = '../instance/library.db'
    backup_path = f'../instance/library_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db'
    
    try:
        if os.path.exists(db_path):
            import shutil
            shutil.copy2(db_path, backup_path)
            print(f"✅ Database backed up to: {backup_path}")
            return True
    except Exception as e:
        print(f"❌ Failed to backup database: {str(e)}")
        return False
    
    return True

def check_database_exists():
    """Check if the database file exists"""
    db_path = '../instance/library.db'
    
    if not os.path.exists(db_path):
        print(f"❌ Database file does not exist: {db_path}")
        print("Creating directory and database...")
        
        # Create instance directory if it doesn't exist
        os.makedirs('../instance', exist_ok=True)
        
        # Create empty database
        conn = sqlite3.connect(db_path)
        conn.close()
        print(f"✅ Created database file: {db_path}")
        
    return True

def migrate_call_no_field():
    """Add call_no field to books table"""
    db_path = '../instance/library.db'
    
    print("🔧 Starting call_no field migration...")
    print(f"📂 Database path: {os.path.abspath(db_path)}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if books table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='books'")
        if not cursor.fetchone():
            print("⚠️  Books table does not exist. Creating it...")
            
            # Create books table with all required fields including call_no
            create_table_sql = """
            CREATE TABLE books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            conn.commit()
            print("✅ Created books table with call_no field")
            
        else:
            # Check current schema
            cursor.execute("PRAGMA table_info(books)")
            columns = cursor.fetchall()
            
            print("📋 Current columns in books table:")
            column_names = []
            for column in columns:
                print(f"  - {column[1]} ({column[2]})")
                column_names.append(column[1])
            
            # Check if call_no column exists
            if 'call_no' not in column_names:
                print("⚠️  call_no column is missing! Adding it...")
                cursor.execute("ALTER TABLE books ADD COLUMN call_no VARCHAR(100)")
                conn.commit()
                print("✅ Added call_no column")
            else:
                print("✅ call_no column already exists")
        
        # Verify the final schema
        cursor.execute("PRAGMA table_info(books)")
        columns = cursor.fetchall()
        
        print("\n📋 Final schema:")
        for column in columns:
            print(f"  - {column[1]} ({column[2]})")
        
        # Test the column works
        print("\n🔍 Testing call_no column...")
        cursor.execute("SELECT COUNT(*) FROM books")
        count = cursor.fetchone()[0]
        print(f"📊 Total books: {count}")
        
        # Test inserting a sample book if table is empty
        if count == 0:
            print("🔍 Inserting test book to verify schema...")
            cursor.execute("""
                INSERT INTO books (access_no, call_no, title, author_1, publisher, pages, price, edition)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, ("TEST001", "QA76.73.P98", "Test Book", "Test Author", "Test Publisher", 100, 29.99, "1st"))
            conn.commit()
            
            # Verify the insert worked
            cursor.execute("SELECT access_no, call_no, title FROM books WHERE access_no = 'TEST001'")
            test_book = cursor.fetchone()
            if test_book:
                print(f"✅ Test book inserted: {test_book[2]} (Call No: {test_book[1]})")
                
                # Clean up test book
                cursor.execute("DELETE FROM books WHERE access_no = 'TEST001'")
                conn.commit()
                print("✅ Test book removed")
            else:
                print("❌ Test book insertion failed")
                return False
        
        conn.close()
        print("\n✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def migrate_other_tables():
    """Ensure other required tables exist"""
    db_path = '../instance/library.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check and create users table if needed
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print("⚠️  Users table missing. Creating it...")
            cursor.execute("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id VARCHAR(50) NOT NULL UNIQUE,
                    username VARCHAR(80) NOT NULL UNIQUE,
                    password_hash VARCHAR(120) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(120) NOT NULL UNIQUE,
                    role VARCHAR(20) NOT NULL,
                    user_role VARCHAR(20) DEFAULT 'student',
                    designation VARCHAR(50) NOT NULL,
                    dob DATE NOT NULL,
                    validity_date DATE NOT NULL,
                    college_id INTEGER,
                    department_id INTEGER,
                    batch_from INTEGER,
                    batch_to INTEGER,
                    address TEXT,
                    phone VARCHAR(20),
                    profile_picture VARCHAR(255),
                    is_active BOOLEAN DEFAULT 1,
                    first_login_completed BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("✅ Created users table")
        
        # Check other essential tables
        essential_tables = ['circulations', 'categories']
        for table in essential_tables:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not cursor.fetchone():
                print(f"⚠️  {table} table missing. Will be created by Flask app.")
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating other tables: {str(e)}")
        return False

def test_flask_import():
    """Test if Flask app can import successfully"""
    print("\n🔍 Testing Flask app import...")
    
    try:
        import sys
        import os
        
        # Add current directory to path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
        
        # Try to import the app
        from app import app, db, Book
        print("✅ Flask app imported successfully")
        
        # Test app context
        with app.app_context():
            print("✅ App context works")
            
            # Test Book model
            count = Book.query.count()
            print(f"✅ Book model works. Count: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Flask import failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting comprehensive call_no migration...")
    print("=" * 50)
    
    # Step 1: Check database exists
    if not check_database_exists():
        print("❌ Database setup failed!")
        sys.exit(1)
    
    # Step 2: Backup database
    if not backup_database():
        print("❌ Database backup failed!")
        sys.exit(1)
    
    # Step 3: Migrate call_no field
    if not migrate_call_no_field():
        print("❌ call_no migration failed!")
        sys.exit(1)
    
    # Step 4: Ensure other tables exist
    if not migrate_other_tables():
        print("❌ Other tables setup failed!")
        sys.exit(1)
    
    # Step 5: Test Flask import
    if not test_flask_import():
        print("❌ Flask app test failed!")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 MIGRATION COMPLETED SUCCESSFULLY!")
    print("\n🚀 Next steps:")
    print("  1. Start the Flask server: python app.py")
    print("  2. Test the admin dashboard")
    print("  3. Add books with call numbers")
    print("  4. Test bulk upload with call_no column")
    print("\n✅ All call_no functionality should now work properly!")
