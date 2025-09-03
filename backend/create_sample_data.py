#!/usr/bin/env python3
"""
Create sample data for OPAC testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Book, Category
from datetime import datetime

def create_sample_data():
    """Create sample books and categories for OPAC testing"""
    
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            print("✓ Database tables created/verified")
            
            # Sample categories
            categories_data = [
                ("Fiction", "Fiction books, novels, and literature"),
                ("Science", "Science and technology books"),
                ("History", "Historical books and biographies"),
                ("Mathematics", "Mathematics and statistics books"),
                ("Computer Science", "Programming, algorithms, and computer science"),
                ("Engineering", "Engineering and technical books"),
                ("Business", "Business, management, and economics"),
                ("Philosophy", "Philosophy and ethics books"),
                ("Art", "Art, design, and creative books"),
                ("Medicine", "Medical and health science books")
            ]
            
            # Create categories
            created_categories = []
            for name, description in categories_data:
                existing = Category.query.filter_by(name=name).first()
                if not existing:
                    category = Category(
                        name=name,
                        description=description,
                        created_by=1
                    )
                    db.session.add(category)
                    created_categories.append(name)
                    print(f"✓ Created category: {name}")
                else:
                    print(f"- Category already exists: {name}")
            
            # Sample books
            books_data = [
                {
                    "access_no": "FIC001",
                    "title": "To Kill a Mockingbird",
                    "author": "Harper Lee",
                    "publisher": "J.B. Lippincott & Co.",
                    "category": "Fiction",
                    "department": "Literature",
                    "location": "A-1-001",
                    "number_of_copies": 5,
                    "isbn": "9780061120084"
                },
                {
                    "access_no": "SCI001",
                    "title": "A Brief History of Time",
                    "author": "Stephen Hawking",
                    "publisher": "Bantam Books",
                    "category": "Science",
                    "department": "Physics",
                    "location": "B-2-015",
                    "number_of_copies": 3,
                    "isbn": "9780553380163"
                },
                {
                    "access_no": "HIS001",
                    "title": "Sapiens: A Brief History of Humankind",
                    "author": "Yuval Noah Harari",
                    "publisher": "Harper",
                    "category": "History",
                    "department": "History",
                    "location": "C-1-025",
                    "number_of_copies": 4,
                    "isbn": "9780062316097"
                },
                {
                    "access_no": "MAT001",
                    "title": "Introduction to Linear Algebra",
                    "author": "Gilbert Strang",
                    "publisher": "Wellesley-Cambridge Press",
                    "category": "Mathematics",
                    "department": "Mathematics",
                    "location": "D-3-010",
                    "number_of_copies": 6,
                    "isbn": "9780980232776"
                },
                {
                    "access_no": "CS001",
                    "title": "Clean Code",
                    "author": "Robert C. Martin",
                    "publisher": "Prentice Hall",
                    "category": "Computer Science",
                    "department": "Computer Science",
                    "location": "E-2-008",
                    "number_of_copies": 8,
                    "isbn": "9780132350884"
                },
                {
                    "access_no": "ENG001",
                    "title": "Introduction to Engineering Design",
                    "author": "Ann McKenna",
                    "publisher": "McGraw-Hill",
                    "category": "Engineering",
                    "department": "Engineering",
                    "location": "F-1-020",
                    "number_of_copies": 5,
                    "isbn": "9780073534923"
                },
                {
                    "access_no": "BUS001",
                    "title": "Good to Great",
                    "author": "Jim Collins",
                    "publisher": "HarperBusiness",
                    "category": "Business",
                    "department": "Business",
                    "location": "G-2-012",
                    "number_of_copies": 4,
                    "isbn": "9780066620992"
                },
                {
                    "access_no": "PHI001",
                    "title": "The Republic",
                    "author": "Plato",
                    "publisher": "Penguin Classics",
                    "category": "Philosophy",
                    "department": "Philosophy",
                    "location": "H-1-005",
                    "number_of_copies": 3,
                    "isbn": "9780140455113"
                },
                {
                    "access_no": "ART001",
                    "title": "The Story of Art",
                    "author": "E.H. Gombrich",
                    "publisher": "Phaidon Press",
                    "category": "Art",
                    "department": "Fine Arts",
                    "location": "I-3-018",
                    "number_of_copies": 2,
                    "isbn": "9780714832470"
                },
                {
                    "access_no": "MED001",
                    "title": "Gray's Anatomy",
                    "author": "Henry Gray",
                    "publisher": "Churchill Livingstone",
                    "category": "Medicine",
                    "department": "Medicine",
                    "location": "J-2-030",
                    "number_of_copies": 3,
                    "isbn": "9780443066849"
                },
                {
                    "access_no": "FIC002",
                    "title": "1984",
                    "author": "George Orwell",
                    "publisher": "Secker & Warburg",
                    "category": "Fiction",
                    "department": "Literature",
                    "location": "A-1-002",
                    "number_of_copies": 6,
                    "isbn": "9780451524935"
                },
                {
                    "access_no": "SCI002",
                    "title": "The Origin of Species",
                    "author": "Charles Darwin",
                    "publisher": "John Murray",
                    "category": "Science",
                    "department": "Biology",
                    "location": "B-1-008",
                    "number_of_copies": 4,
                    "isbn": "9780486450063"
                },
                {
                    "access_no": "CS002",
                    "title": "Introduction to Algorithms",
                    "author": "Thomas H. Cormen",
                    "publisher": "MIT Press",
                    "category": "Computer Science",
                    "department": "Computer Science",
                    "location": "E-2-009",
                    "number_of_copies": 7,
                    "isbn": "9780262033848"
                },
                {
                    "access_no": "FIC003",
                    "title": "Pride and Prejudice",
                    "author": "Jane Austen",
                    "publisher": "T. Egerton",
                    "category": "Fiction",
                    "department": "Literature",
                    "location": "A-1-003",
                    "number_of_copies": 5,
                    "isbn": "9780141439518"
                },
                {
                    "access_no": "MAT002",
                    "title": "Calculus: Early Transcendentals",
                    "author": "James Stewart",
                    "publisher": "Cengage Learning",
                    "category": "Mathematics",
                    "department": "Mathematics",
                    "location": "D-3-011",
                    "number_of_copies": 10,
                    "isbn": "9781285741550"
                }
            ]
            
            # Create books
            created_books = []
            for book_data in books_data:
                existing = Book.query.filter_by(access_no=book_data["access_no"]).first()
                if not existing:
                    book = Book(
                        access_no=book_data["access_no"],
                        title=book_data["title"],
                        author=book_data["author"],
                        publisher=book_data["publisher"],
                        category=book_data["category"],
                        department=book_data["department"],
                        location=book_data["location"],
                        number_of_copies=book_data["number_of_copies"],
                        available_copies=book_data["number_of_copies"],  # All copies available initially
                        isbn=book_data["isbn"]
                    )
                    db.session.add(book)
                    created_books.append(book_data["title"])
                    print(f"✓ Created book: {book_data['title']}")
                else:
                    print(f"- Book already exists: {book_data['title']}")
            
            # Commit all changes
            db.session.commit()
            
            print("\n" + "="*60)
            print("SAMPLE DATA CREATED SUCCESSFULLY!")
            print("="*60)
            print(f"✓ Categories created: {len(created_categories)}")
            print(f"✓ Books created: {len(created_books)}")
            print("\nYou can now test the OPAC with this sample data!")
            print("Visit http://localhost:3000 to see the OPAC in action.")
            
        except Exception as e:
            print(f"✗ Failed to create sample data: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    print("📚 CREATING SAMPLE DATA FOR OPAC")
    create_sample_data()
