#!/usr/bin/env python3
"""
Create a test staff user for testing borrowing limits
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
from werkzeug.security import generate_password_hash

def create_test_staff():
    """Create a test staff user"""
    
    with app.app_context():
        try:
            # Check if staff user already exists
            existing_staff = User.query.filter_by(role='staff').first()
            if existing_staff:
                print(f"Staff user already exists: {existing_staff.user_id} ({existing_staff.name})")
                return True
            
            # Create a test staff user
            staff_user = User(
                user_id='staff001',
                name='Test Staff Member',
                email='staff@test.com',
                password_hash=generate_password_hash('password123'),
                role='staff',
                department='Library',
                phone='1234567890'
            )
            
            db.session.add(staff_user)
            db.session.commit()
            
            print(f"✓ Created test staff user: {staff_user.user_id} ({staff_user.name})")
            return True
            
        except Exception as e:
            print(f"✗ Error creating staff user: {str(e)}")
            return False

if __name__ == "__main__":
    print("Creating test staff user...")
    
    if create_test_staff():
        print("Test staff user created successfully!")
    else:
        print("Failed to create test staff user!")
        sys.exit(1)
