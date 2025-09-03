#!/usr/bin/env python3
"""
Debug Login Test

Test the login endpoint to identify the 500 error
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
import json

def test_login():
    """Test login functionality"""
    
    with app.test_client() as client:
        # Test data
        test_data = {
            'user_id': 'ADMIN001',
            'password': 'admin123'
        }
        
        print("🔍 Testing login endpoint...")
        print(f"📋 Test data: {test_data}")
        
        try:
            # Make POST request to login endpoint
            response = client.post('/api/auth/login',
                                 data=json.dumps(test_data),
                                 content_type='application/json')
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            print(f"📝 Response Data: {response.get_data(as_text=True)}")
            
            if response.status_code == 500:
                print("❌ 500 Internal Server Error detected!")
                
                # Try to get more detailed error info
                try:
                    error_data = response.get_json()
                    if error_data and 'error' in error_data:
                        print(f"🔍 Error message: {error_data['error']}")
                except:
                    print("🔍 Could not parse error as JSON")
            
        except Exception as e:
            print(f"❌ Exception during test: {e}")
            import traceback
            traceback.print_exc()

def test_user_query():
    """Test direct user query"""
    print("\n🔍 Testing direct user query...")
    
    try:
        with app.app_context():
            user = User.query.filter_by(user_id='ADMIN001').first()
            if user:
                print(f"✅ User found: {user.username}")
                print(f"📋 User details:")
                print(f"   - ID: {user.id}")
                print(f"   - User ID: {user.user_id}")
                print(f"   - Username: {user.username}")
                print(f"   - Role: {user.role}")
                print(f"   - Active: {user.is_active}")
                print(f"   - First login completed: {user.first_login_completed}")
                
                # Test password check
                pwd_check = user.check_password('admin123')
                print(f"   - Password check: {pwd_check}")
                
            else:
                print("❌ User not found")
                
    except Exception as e:
        print(f"❌ Error querying user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🧪 Starting login debug test...")
    
    # Test direct user query first
    test_user_query()
    
    # Test login endpoint
    test_login()
    
    print("\n✅ Debug test completed!")
