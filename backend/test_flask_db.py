#!/usr/bin/env python3

"""
Simple test to verify Flask app database connection
"""

def test_flask_db_connection():
    # Set up the Flask app context
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy
    
    # Create a fresh Flask app instance
    test_app = Flask(__name__)
    test_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/library.db'
    test_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize the database
    test_db = SQLAlchemy(test_app)
    
    # Define the Book model with call_no
    class TestBook(test_db.Model):
        __tablename__ = 'books'
        
        id = test_db.Column(test_db.Integer, primary_key=True)
        access_no = test_db.Column(test_db.String(50), nullable=False, unique=True)
        call_no = test_db.Column(test_db.String(100), nullable=True)
        title = test_db.Column(test_db.String(200), nullable=False)
        author_1 = test_db.Column(test_db.String(200), nullable=False)
        author_2 = test_db.Column(test_db.String(200), nullable=True)
        author_3 = test_db.Column(test_db.String(200), nullable=True)
        author_4 = test_db.Column(test_db.String(200), nullable=True)
        author = test_db.Column(test_db.String(200), nullable=True)
        publisher = test_db.Column(test_db.String(100))
        department = test_db.Column(test_db.String(100))
        category = test_db.Column(test_db.String(50))
        location = test_db.Column(test_db.String(50))
        number_of_copies = test_db.Column(test_db.Integer, default=1)
        available_copies = test_db.Column(test_db.Integer, default=1)
        isbn = test_db.Column(test_db.String(20))
        pages = test_db.Column(test_db.Integer, nullable=False)
        price = test_db.Column(test_db.Numeric(10, 2), nullable=False)
        edition = test_db.Column(test_db.String(50), nullable=False)
        created_at = test_db.Column(test_db.DateTime)
    
    with test_app.app_context():
        try:
            # Test basic connection
            print("🔍 Testing database connection...")
            count = TestBook.query.count()
            print(f"✅ Successfully connected! Book count: {count}")
            
            # Test the specific query that was failing
            print("🔍 Testing query with call_no...")
            books = TestBook.query.filter(TestBook.available_copies > 0).all()
            print(f"✅ Query successful! Found {len(books)} books with available copies")
            
            # Test pagination (the failing endpoint)
            print("🔍 Testing pagination...")
            page = 1
            per_page = 10
            paginated = TestBook.query.paginate(page=page, per_page=per_page, error_out=False)
            print(f"✅ Pagination successful! Page {paginated.page} of {paginated.pages}, {paginated.total} total books")
            
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    success = test_flask_db_connection()
    if success:
        print("\n🎉 Database connection test PASSED!")
    else:
        print("\n💥 Database connection test FAILED!")
