#!/usr/bin/env python3
"""
Database Reset Script for Library Management System

This script will:
1. Delete the existing database file
2. Create a new database with the correct schema
3. Add sample data for testing

Run this script if you're experiencing database schema issues.
"""

import os
import sys
from datetime import datetime, timedelta

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User, College, Department, Book, Ebook, Circulation, Fine

def reset_database():
    """Reset the database and create sample data"""
    
    with app.app_context():
        # Delete existing database file
        db_file = 'library.db'
        if os.path.exists(db_file):
            os.remove(db_file)
            print(f"✅ Deleted existing database: {db_file}")
        
        # Create all tables with correct schema
        db.create_all()
        print("✅ Created new database with correct schema")
        
        # Create sample data
        create_sample_data()
        
        print("🚀 Database reset completed successfully!")
        print("\n📋 Default Login Credentials:")
        print("   Admin: admin@library.com / admin123")
        print("   Librarian: librarian@library.com / lib123")
        print("   Student: student@library.com / student123")

def create_sample_data():
    """Create sample data for testing"""
    
    try:
        # Create Colleges
        college1 = College(name='Engineering College', address='123 Tech Street')
        college2 = College(name='Arts & Science College', address='456 Arts Avenue')
        db.session.add_all([college1, college2])
        db.session.flush()  # Get IDs
        
        # Create Departments
        dept1 = Department(name='Computer Science', college_id=college1.id)
        dept2 = Department(name='Mechanical Engineering', college_id=college1.id)
        dept3 = Department(name='English Literature', college_id=college2.id)
        db.session.add_all([dept1, dept2, dept3])
        db.session.flush()
        
        # Create Users
        # Admin User
        admin = User(
            user_id='ADMIN001',
            name='System Administrator',
            email='admin@library.com',
            role='admin'
        )
        admin.set_password('admin123')
        
        # Librarian User
        librarian = User(
            user_id='LIB001',
            name='John Librarian',
            email='librarian@library.com',
            role='librarian'
        )
        librarian.set_password('lib123')
        
        # Student User
        student = User(
            user_id='STU001',
            name='Jane Student',
            email='student@library.com',
            college_id=college1.id,
            department_id=dept1.id,
            role='student',
            dob=datetime(2000, 1, 15),
            validity_date=datetime(2025, 12, 31)
        )
        student.set_password('student123')
        
        db.session.add_all([admin, librarian, student])
        db.session.flush()
        
        # Create Sample Books
        books = [
            Book(
                access_no='1',
                title='Introduction to Programming',
                author='John Smith',
                publisher='Tech Publications',
                department='Computer Science',
                category='Programming',
                location='A-101',
                number_of_copies=5,
                available_copies=5,
                isbn='978-1234567890'
            ),
            Book(
                access_no='2',
                title='Data Structures and Algorithms',
                author='Jane Doe',
                publisher='Academic Press',
                department='Computer Science',
                category='Programming',
                location='A-102',
                number_of_copies=3,
                available_copies=2,
                isbn='978-0987654321'
            ),
            Book(
                access_no='3',
                title='Mechanical Engineering Handbook',
                author='Bob Engineer',
                publisher='Engineering Books',
                department='Mechanical Engineering',
                category='Engineering',
                location='B-201',
                number_of_copies=4,
                available_copies=4,
                isbn='978-1122334455'
            )
        ]
        db.session.add_all(books)
        db.session.flush()
        
        # Create Sample E-books
        ebooks = [
            Ebook(
                access_no='E1',
                title='Digital Programming Guide',
                author='Tech Author',
                publisher='Digital Press',
                department='Computer Science',
                category='Programming',
                file_format='PDF',
                file_size='15.2 MB'
            ),
            Ebook(
                access_no='E2',
                title='Modern Literature Collection',
                author='Literary Author',
                publisher='Digital Books',
                department='English Literature',
                category='Literature',
                file_format='EPUB',
                file_size='8.7 MB'
            )
        ]
        db.session.add_all(ebooks)
        db.session.flush()
        
        # Create Sample Circulation (one book issued to student)
        circulation = Circulation(
            user_id=student.id,
            book_id=books[1].id,  # Data Structures book
            due_date=datetime.now() + timedelta(days=14),
            status='issued',
            fine_amount=0.0
        )
        db.session.add(circulation)
        
        # Update book availability
        books[1].available_copies = 2
        
        # Create Sample Fine
        fine = Fine(
            user_id=student.id,
            circulation_id=None,  # Manual fine
            amount=5.00,
            reason='Late return penalty',
            status='pending',
            created_by=admin.id
        )
        db.session.add(fine)
        
        # Commit all changes
        db.session.commit()
        print("✅ Sample data created successfully")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.session.rollback()
        raise

if __name__ == '__main__':
    print("🔄 Starting database reset...")
    print("⚠️  This will delete all existing data!")
    
    confirm = input("Are you sure you want to continue? (yes/no): ").lower().strip()
    if confirm in ['yes', 'y']:
        reset_database()
    else:
        print("❌ Database reset cancelled")
