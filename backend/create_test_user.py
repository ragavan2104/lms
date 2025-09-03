#!/usr/bin/env python3
"""
Create test users for authentication testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
from datetime import datetime, date

def create_test_users():
    """Create test users with the new password format"""
    
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            print("✓ Database tables created/verified")
            
            # Test users to create
            test_users = [
                {
                    'user_id': 'ADMIN001',
                    'name': 'Test Admin',
                    'email': 'admin@test.com',
                    'role': 'admin',
                    'designation': 'Administrator'
                },
                {
                    'user_id': 'LIB001',
                    'name': 'Test Librarian',
                    'email': 'librarian@test.com',
                    'role': 'librarian',
                    'designation': 'Librarian'
                },
                {
                    'user_id': 'CS2024001',
                    'name': 'Test Student',
                    'email': 'student@test.com',
                    'role': 'student',
                    'designation': 'Student'
                }
            ]
            
            created_users = []
            
            for user_data in test_users:
                # Check if user already exists
                existing_user = User.query.filter_by(user_id=user_data['user_id']).first()
                if existing_user:
                    print(f"- User {user_data['user_id']} already exists")
                    # Update password to new format
                    new_password = User.generate_password(user_data['user_id'])
                    existing_user.set_password(new_password)
                    db.session.commit()
                    print(f"✓ Updated password for {user_data['user_id']}: {new_password}")
                    created_users.append((user_data['user_id'], new_password))
                    continue
                
                # Create new user
                user = User(
                    user_id=user_data['user_id'],
                    username=User.generate_username(user_data['name'], user_data['user_id']),
                    name=user_data['name'],
                    email=user_data['email'],
                    role=user_data['role'],
                    designation=user_data['designation'],
                    dob=date(1990, 1, 1),
                    validity_date=date(2025, 12, 31),
                    is_active=True,
                    college_id=None,
                    department_id=None
                )
                
                # Set password using new format
                password = User.generate_password(user_data['user_id'])
                user.set_password(password)
                
                db.session.add(user)
                db.session.commit()
                
                print(f"✓ Created user: {user_data['user_id']}")
                print(f"  Name: {user_data['name']}")
                print(f"  Role: {user_data['role']}")
                print(f"  Password: {password}")
                
                created_users.append((user_data['user_id'], password))
            
            print("\n" + "="*60)
            print("TEST USERS CREATED/UPDATED SUCCESSFULLY!")
            print("="*60)
            print("\nLogin Credentials:")
            print("-" * 40)
            
            for user_id, password in created_users:
                print(f"User ID: {user_id}")
                print(f"Password: {password}")
                print("-" * 40)
            
            print("\nYou can now test login with these credentials!")
            print("Example: User ID = 'ADMIN001', Password = 'ADMIN001ADMIN001'")
            
        except Exception as e:
            print(f"✗ Failed to create test users: {str(e)}")
            db.session.rollback()
            raise

def verify_authentication():
    """Verify that authentication works with test users"""
    
    with app.app_context():
        test_user_id = 'ADMIN001'
        test_password = User.generate_password(test_user_id)
        
        # Find user
        user = User.query.filter_by(user_id=test_user_id).first()
        if not user:
            print(f"✗ Test user {test_user_id} not found")
            return False
        
        # Test password
        if user.check_password(test_password):
            print(f"✓ Authentication test passed for {test_user_id}")
            return True
        else:
            print(f"✗ Authentication test failed for {test_user_id}")
            return False

if __name__ == '__main__':
    print("🔐 CREATING TEST USERS FOR AUTHENTICATION")
    create_test_users()
    print("\n🧪 VERIFYING AUTHENTICATION")
    verify_authentication()
