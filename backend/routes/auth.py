from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, db
from datetime import timedelta

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
                'created_at': user.created_at.isoformat()
            }
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
