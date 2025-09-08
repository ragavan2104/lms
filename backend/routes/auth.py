from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import User, db
from datetime import timedelta
import os
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user_id = data.get('user_id') or data.get('username')  # Support both for backward compatibility
        password = data.get('password')

        if not user_id or not password:
            return jsonify({'error': 'User ID and password required'}), 400

        # Try to find user by user_id first, then by username for backward compatibility
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            user = User.query.filter_by(username=user_id).first()
        
        if user and user.check_password(password) and user.is_active:
            # Check if user's validity date has not expired
            from datetime import date
            if user.validity_date < date.today():
                return jsonify({'error': 'Account has expired'}), 401
            
            access_token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(hours=24)
            )
            
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'designation': user.designation,
                    'college_id': user.college_id,
                    'department_id': user.department_id
                }
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'user_id': user.user_id,
                'username': user.username,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'designation': user.designation,
                'dob': user.dob.isoformat() if user.dob else None,
                'validity_date': user.validity_date.isoformat() if user.validity_date else None,
                'college': user.college.name if user.college else None,
                'department': user.department.name if user.department else None,
                'address': user.address,
                'phone': user.phone,
                'profile_picture': user.profile_picture,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'address' in data:
            user.address = data['address']
        if 'phone' in data:
            user.phone = data['phone']
        if 'profile_picture' in data:
            user.profile_picture = data['profile_picture']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'user_id': user.user_id,
                'username': user.username,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'designation': user.designation,
                'dob': user.dob.isoformat() if user.dob else None,
                'validity_date': user.validity_date.isoformat() if user.validity_date else None,
                'college': user.college.name if user.college else None,
                'department': user.department.name if user.department else None,
                'address': user.address,
                'phone': user.phone,
                'profile_picture': user.profile_picture,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/upload-profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'profile_picture' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['profile_picture']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type. Please upload an image file.'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join('uploads', 'profile_pictures')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Delete old profile picture if exists
        if user.profile_picture and os.path.exists(user.profile_picture):
            try:
                os.remove(user.profile_picture)
            except OSError:
                pass  # Ignore if file doesn't exist or can't be deleted
        
        # Update user profile picture path
        user.profile_picture = file_path
        db.session.commit()
        
        return jsonify({
            'message': 'Profile picture uploaded successfully',
            'profile_picture': file_path
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password required'}), 400
        
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
