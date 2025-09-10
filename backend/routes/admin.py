from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Book, Ebook, College, Department, Circulation, NewsClipping, Category, Thesis, Holiday, db
from datetime import datetime, date, timedelta
import pandas as pd
import io
import os
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# College Management
@admin_bp.route('/colleges', methods=['GET'])
@admin_required
def get_colleges():
    try:
        colleges = College.query.all()
        return jsonify({
            'colleges': [{
                'id': college.id,
                'name': college.name,
                'code': college.code,
                'created_at': college.created_at.isoformat(),
                'departments_count': len(college.departments)
            } for college in colleges]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/colleges', methods=['POST'])
@admin_required
def create_college():
    try:
        data = request.get_json()
        name = data.get('name')
        code = data.get('code')
        
        if not name or not code:
            return jsonify({'error': 'Name and code are required'}), 400
        
        # Check if college already exists
        existing = College.query.filter_by(name=name).first()
        if existing:
            return jsonify({'error': 'College already exists'}), 400
        
        college = College(name=name, code=code)
        db.session.add(college)
        db.session.commit()
        
        return jsonify({
            'message': 'College created successfully',
            'college': {
                'id': college.id,
                'name': college.name,
                'code': college.code
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Department Management
@admin_bp.route('/departments', methods=['GET'])
@admin_required
def get_departments():
    try:
        college_id = request.args.get('college_id')
        if college_id:
            departments = Department.query.filter_by(college_id=college_id).all()
        else:
            departments = Department.query.all()
        
        return jsonify({
            'departments': [{
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'college_id': dept.college_id,
                'college_name': dept.college.name,
                'created_at': dept.created_at.isoformat()
            } for dept in departments]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/departments', methods=['POST'])
@admin_required
def create_department():
    try:
        data = request.get_json()
        name = data.get('name')
        code = data.get('code')
        college_id = data.get('college_id')
        
        if not name or not code or not college_id:
            return jsonify({'error': 'Name, code, and college_id are required'}), 400
        
        # Check if college exists
        college = College.query.get(college_id)
        if not college:
            return jsonify({'error': 'College not found'}), 404
        
        # Check if department already exists in this college
        existing = Department.query.filter_by(name=name, college_id=college_id).first()
        if existing:
            return jsonify({'error': 'Department already exists in this college'}), 400
        
        department = Department(name=name, code=code, college_id=college_id)
        db.session.add(department)
        db.session.commit()
        
        return jsonify({
            'message': 'Department created successfully',
            'department': {
                'id': department.id,
                'name': department.name,
                'code': department.code,
                'college_id': department.college_id
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Management
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    try:
        role = request.args.get('role')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        query = User.query
        if role:
            query = query.filter_by(role=role)
        
        users = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'users': [{
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
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat()
            } for user in users.items],
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Single User Creation
@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')  # Roll number
        name = data.get('name')
        email = data.get('email')
        college_id = data.get('college_id')
        department_id = data.get('department_id')
        designation = data.get('designation')  # student or staff
        dob = data.get('dob')
        validity_date = data.get('validity_date')
        role = data.get('role', 'student')  # Default to student
        batch_from = data.get('batch_from')  # Starting year of batch
        batch_to = data.get('batch_to')      # Ending year of batch

        # New fields for enhanced categorization
        category = data.get('category')  # For students: UG, PG, Research Scholar
        staff_designation = data.get('staff_designation')  # For staff: Teaching, Non-Teaching

        if not all([user_id, name, email, designation, dob, validity_date]):
            return jsonify({'error': 'All fields are required'}), 400

        # Validate batch fields if provided
        if batch_from and batch_to:
            try:
                batch_from = int(batch_from)
                batch_to = int(batch_to)
                if batch_from > batch_to:
                    return jsonify({'error': 'Batch from year cannot be greater than batch to year'}), 400
                if batch_from < 1900 or batch_to > 2100:
                    return jsonify({'error': 'Invalid batch year range'}), 400
            except ValueError:
                return jsonify({'error': 'Batch years must be valid integers'}), 400

        # Check if user already exists
        existing = User.query.filter_by(user_id=user_id).first()
        if existing:
            return jsonify({'error': 'User ID already exists'}), 400

        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            return jsonify({'error': 'Email already exists'}), 400

        # Generate username and password
        username = User.generate_username(name, user_id)
        password = User.generate_password(user_id)  # Use userid+userid format

        # Parse dates
        dob_date = datetime.strptime(dob, '%Y-%m-%d').date()
        validity_date_obj = datetime.strptime(validity_date, '%Y-%m-%d').date()

        user = User(
            user_id=user_id,
            username=username,
            name=name,
            email=email,
            role=role,
            designation=designation,
            dob=dob_date,
            validity_date=validity_date_obj,
            college_id=college_id,
            department_id=department_id,
            batch_from=batch_from,
            batch_to=batch_to,
            category=category,
            staff_designation=staff_designation
        )
        user.set_password(password)

        # Admin and librarian users don't need mandatory password change
        if role in ['admin', 'librarian']:
            user.first_login_completed = True

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'user_id': user.user_id,
                'username': username,
                'password': password,  # Return password for admin to share
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Update
@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_email = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing_email:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'designation' in data:
            user.designation = data['designation']
        if 'college_id' in data:
            user.college_id = data['college_id']
        if 'department_id' in data:
            user.department_id = data['department_id']
        if 'batch_from' in data:
            user.batch_from = data['batch_from']
        if 'batch_to' in data:
            user.batch_to = data['batch_to']
        if 'validity_date' in data:
            user.validity_date = datetime.strptime(data['validity_date'], '%Y-%m-%d').date()
        if 'is_active' in data:
            user.is_active = data['is_active']

        db.session.commit()

        return jsonify({
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'designation': user.designation
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Bulk User Upload
@admin_bp.route('/users/bulk', methods=['POST'])
@admin_required
def bulk_create_users():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        college_id = request.form.get('college_id')
        department_id = request.form.get('department_id')
        role = request.form.get('role', 'student')  # Default to student
        category = request.form.get('category')  # For students: UG, PG, Research Scholar
        staff_designation = request.form.get('staff_designation')  # For staff: Teaching, Non-Teaching

        if not college_id or not department_id:
            return jsonify({'error': 'College and department are required'}), 400

        # Read Excel file
        df = pd.read_excel(file)

        # Validate required columns
        required_columns = ['user_id', 'name', 'email', 'validity_date', 'dob']
        if not all(col in df.columns for col in required_columns):
            return jsonify({'error': f'Excel file must contain columns: {required_columns}'}), 400

        created_users = []
        errors = []

        for index, row in df.iterrows():
            try:
                user_id = str(row['user_id'])
                name = row['name']
                email = row['email']
                dob = pd.to_datetime(row['dob']).date()
                validity_date = pd.to_datetime(row['validity_date']).date()

                # Handle optional batch fields
                batch_from = None
                batch_to = None
                if 'batch_from' in df.columns and pd.notna(row['batch_from']):
                    batch_from = int(row['batch_from'])
                if 'batch_to' in df.columns and pd.notna(row['batch_to']):
                    batch_to = int(row['batch_to'])

                # Check if user already exists
                existing = User.query.filter_by(user_id=user_id).first()
                if existing:
                    errors.append(f"Row {index + 1}: User ID {user_id} already exists")
                    continue

                # Generate username and password
                username = User.generate_username(name, user_id)
                password = User.generate_password(user_id)  # Use userid+userid format

                user = User(
                    user_id=user_id,
                    username=username,
                    name=name,
                    email=email,
                    role=role,
                    designation=role,  # Use role as designation for backward compatibility
                    dob=dob,
                    validity_date=validity_date,
                    college_id=college_id,
                    department_id=department_id,
                    batch_from=batch_from,
                    batch_to=batch_to,
                    category=category if role == 'student' else None,
                    staff_designation=staff_designation if role == 'staff' else None
                )
                user.set_password(password)

                db.session.add(user)
                created_users.append({
                    'user_id': user_id,
                    'username': username,
                    'password': password,
                    'name': name,
                    'email': email
                })

            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")

        db.session.commit()

        return jsonify({
            'message': f'Successfully created {len(created_users)} users',
            'created_users': created_users,
            'errors': errors
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Download Credentials
@admin_bp.route('/users/credentials', methods=['POST'])
@admin_required
def download_credentials():
    try:
        data = request.get_json()
        users_data = data.get('users', [])

        if not users_data:
            return jsonify({'error': 'No user data provided'}), 400

        # Create DataFrame
        df = pd.DataFrame(users_data)

        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='User Credentials', index=False)

        output.seek(0)

        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='user_credentials.xlsx'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Category Management
@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories():
    try:
        categories = Category.query.order_by(Category.name).all()
        return jsonify({
            'categories': [{
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'created_at': category.created_at.isoformat() if category.created_at else None
            } for category in categories]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        name = data.get('name', '').strip()
        description = data.get('description', '').strip()

        if not name:
            return jsonify({'error': 'Category name is required'}), 400

        # Check if category already exists (case-insensitive)
        existing_category = Category.query.filter(
            Category.name.ilike(name)
        ).first()

        if existing_category:
            return jsonify({'error': f'Category "{name}" already exists'}), 400

        # Create new category
        category = Category(
            name=name,
            description=description if description else None,
            created_by=user_id
        )

        db.session.add(category)
        db.session.commit()

        return jsonify({
            'message': 'Category created successfully',
            'category': {
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'created_at': category.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()

        name = data.get('name', '').strip()
        description = data.get('description', '').strip()

        if not name:
            return jsonify({'error': 'Category name is required'}), 400

        # Check if another category with this name exists
        existing_category = Category.query.filter(
            Category.name.ilike(name),
            Category.id != category_id
        ).first()

        if existing_category:
            return jsonify({'error': f'Category "{name}" already exists'}), 400

        category.name = name
        category.description = description if description else None

        db.session.commit()

        return jsonify({
            'message': 'Category updated successfully',
            'category': {
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'created_at': category.created_at.isoformat()
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)

        # Check if category is being used by any books
        books_using_category = Book.query.filter_by(category=category.name).count()
        ebooks_using_category = Ebook.query.filter_by(category=category.name).count()

        if books_using_category > 0 or ebooks_using_category > 0:
            return jsonify({
                'error': f'Cannot delete category "{category.name}" as it is being used by {books_using_category + ebooks_using_category} book(s)'
            }), 400

        db.session.delete(category)
        db.session.commit()

        return jsonify({'message': 'Category deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Analytics Dashboard
@admin_bp.route('/analytics/dashboard', methods=['GET'])
@admin_required
def get_analytics_dashboard():
    try:
        # Get filter parameters
        report_type = request.args.get('reportType', '')
        start_date = request.args.get('startDate', '')
        end_date = request.args.get('endDate', '')
        
        # Parse dates
        start_date_obj = None
        end_date_obj = None
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            
        # Base query for circulation with date filtering
        circulation_query = Circulation.query
        if start_date_obj:
            circulation_query = circulation_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            circulation_query = circulation_query.filter(Circulation.issue_date <= end_date_obj)
            
        # Basic Statistics
        total_books = Book.query.count()
        total_ebooks = Ebook.query.count()
        total_users = User.query.filter(User.role.in_(['student', 'faculty'])).count()
        
        # Filtered statistics based on report type and date range
        if report_type == 'issue_book':
            filtered_issued = circulation_query.filter_by(status='issued').count()
            filtered_returned = circulation_query.filter_by(status='returned').count()
            total_issued = filtered_issued
            total_returned = filtered_returned
        elif report_type == 'return_book':
            total_issued = circulation_query.filter_by(status='returned').count()
            total_returned = circulation_query.filter_by(status='returned').count()
        elif report_type == 'fine':
            total_issued = circulation_query.filter(Circulation.fine_amount > 0).count()
            total_returned = circulation_query.filter(Circulation.fine_amount > 0, Circulation.status == 'returned').count()
        else:
            total_issued = circulation_query.filter_by(status='issued').count()
            total_returned = circulation_query.filter_by(status='returned').count()
            
        total_overdue = circulation_query.filter(
            Circulation.status == 'issued',
            Circulation.due_date < datetime.now().date()
        ).count()
        
        # Book categories distribution
        category_stats = db.session.query(
            Category.name,
            db.func.count(Book.id).label('count')
        ).outerjoin(Book).group_by(Category.id, Category.name).all()
        
        # Monthly circulation data for bar chart (filtered)
        monthly_query = db.session.query(
            db.func.strftime('%Y-%m', Circulation.issue_date).label('month'),
            db.func.count(Circulation.id).label('count')
        )
        
        if start_date_obj:
            monthly_query = monthly_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            monthly_query = monthly_query.filter(Circulation.issue_date <= end_date_obj)
            
        if report_type == 'issue_book':
            monthly_query = monthly_query.filter_by(status='issued')
        elif report_type == 'return_book':
            monthly_query = monthly_query.filter_by(status='returned')
        elif report_type == 'fine':
            monthly_query = monthly_query.filter(Circulation.fine_amount > 0)
            
        monthly_data = monthly_query.group_by(
            db.func.strftime('%Y-%m', Circulation.issue_date)
        ).order_by('month').limit(12).all()
        
        # User type distribution
        user_type_stats = db.session.query(
            User.role,
            db.func.count(User.id).label('count')
        ).filter(User.role.in_(['student', 'faculty'])).group_by(User.role).all()
        
        # Popular books (filtered)
        popular_books_query = db.session.query(
            Book.title,
            db.func.count(Circulation.id).label('circulation_count')
        ).join(Circulation)
        
        if start_date_obj:
            popular_books_query = popular_books_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            popular_books_query = popular_books_query.filter(Circulation.issue_date <= end_date_obj)
            
        popular_books = popular_books_query.group_by(Book.id, Book.title).order_by(
            db.func.count(Circulation.id).desc()
        ).limit(5).all()
        
        # Report type specific statistics
        if report_type == 'fine':
            fine_stats = db.session.query(
                db.func.sum(Circulation.fine_amount).label('total_fines'),
                db.func.count(Circulation.id).label('fine_records')
            ).filter(Circulation.fine_amount > 0)
            
            if start_date_obj:
                fine_stats = fine_stats.filter(Circulation.issue_date >= start_date_obj)
            if end_date_obj:
                fine_stats = fine_stats.filter(Circulation.issue_date <= end_date_obj)
                
            fine_data = fine_stats.first()
            total_fines = float(fine_data.total_fines or 0)
            fine_records = fine_data.fine_records or 0
        else:
            total_fines = 0
            fine_records = 0
        
        # College-wise statistics
        college_stats = db.session.query(
            College.name,
            db.func.count(User.id).label('user_count')
        ).outerjoin(User).group_by(College.id, College.name).all()
        
        # Department-wise statistics
        department_stats = db.session.query(
            Department.name,
            db.func.count(User.id).label('user_count')
        ).outerjoin(User).group_by(Department.id, Department.name).limit(10).all()
        
        return jsonify({
            'statistics': {
                'totalBooks': total_books,
                'totalEbooks': total_ebooks,
                'totalUsers': total_users,
                'totalIssued': total_issued,
                'totalReturned': total_returned,
                'totalOverdue': total_overdue,
                'totalFines': total_fines,
                'fineRecords': fine_records
            },
            'categoryDistribution': [
                {'name': category, 'value': count}
                for category, count in category_stats
            ],
            'monthlyCirculation': [
                {'month': month or 'N/A', 'count': count}
                for month, count in monthly_data
            ],
            'userTypeDistribution': [
                {'type': role, 'count': count}
                for role, count in user_type_stats
            ],
            'popularBooks': [
                {'title': title, 'count': count}
                for title, count in popular_books
            ],
            'collegeStats': [
                {'college': college, 'users': count}
                for college, count in college_stats
            ],
            'departmentStats': [
                {'department': department, 'users': count}
                for department, count in department_stats
            ],
            'reportType': report_type,
            'dateRange': {
                'startDate': start_date,
                'endDate': end_date
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Download Analytics Dashboard Report
@admin_bp.route('/analytics/dashboard/download', methods=['GET'])
@admin_required
def download_analytics_dashboard():
    try:
        # Get filter parameters (same as analytics dashboard)
        report_type = request.args.get('reportType', '')
        start_date = request.args.get('startDate', '')
        end_date = request.args.get('endDate', '')
        format_type = request.args.get('format', 'excel')  # excel, csv, or pdf

        # Parse dates
        start_date_obj = None
        end_date_obj = None
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            
        # Base query for circulation with date filtering
        circulation_query = Circulation.query
        if start_date_obj:
            circulation_query = circulation_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            circulation_query = circulation_query.filter(Circulation.issue_date <= end_date_obj)
            
        # Basic Statistics
        total_books = Book.query.count()
        total_ebooks = Ebook.query.count()
        total_users = User.query.filter(User.role.in_(['student', 'faculty'])).count()
        
        # Filtered statistics based on report type and date range
        if report_type == 'issue_book':
            filtered_issued = circulation_query.filter_by(status='issued').count()
            filtered_returned = circulation_query.filter_by(status='returned').count()
            total_issued = filtered_issued
            total_returned = filtered_returned
        elif report_type == 'return_book':
            total_issued = circulation_query.filter_by(status='returned').count()
            total_returned = circulation_query.filter_by(status='returned').count()
        elif report_type == 'fine':
            total_issued = circulation_query.filter(Circulation.fine_amount > 0).count()
            total_returned = circulation_query.filter(Circulation.fine_amount > 0, Circulation.status == 'returned').count()
        else:
            total_issued = circulation_query.filter_by(status='issued').count()
            total_returned = circulation_query.filter_by(status='returned').count()
            
        total_overdue = circulation_query.filter(
            Circulation.status == 'issued',
            Circulation.due_date < datetime.now().date()
        ).count()

        # Book categories distribution
        category_stats = db.session.query(
            Category.name,
            db.func.count(Book.id).label('count')
        ).outerjoin(Book).group_by(Category.id, Category.name).all()

        # Monthly circulation data
        monthly_query = db.session.query(
            db.func.strftime('%Y-%m', Circulation.issue_date).label('month'),
            db.func.count(Circulation.id).label('count')
        )
        
        if start_date_obj:
            monthly_query = monthly_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            monthly_query = monthly_query.filter(Circulation.issue_date <= end_date_obj)
            
        if report_type == 'issue_book':
            monthly_query = monthly_query.filter_by(status='issued')
        elif report_type == 'return_book':
            monthly_query = monthly_query.filter_by(status='returned')
        elif report_type == 'fine':
            monthly_query = monthly_query.filter(Circulation.fine_amount > 0)
            
        monthly_data = monthly_query.group_by(
            db.func.strftime('%Y-%m', Circulation.issue_date)
        ).order_by('month').limit(12).all()

        # User type distribution
        user_type_stats = db.session.query(
            User.role,
            db.func.count(User.id).label('count')
        ).filter(User.role.in_(['student', 'faculty'])).group_by(User.role).all()

        # Popular books
        popular_books_query = db.session.query(
            Book.title,
            Book.author,
            db.func.count(Circulation.id).label('circulation_count')
        ).join(Circulation)
        
        if start_date_obj:
            popular_books_query = popular_books_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            popular_books_query = popular_books_query.filter(Circulation.issue_date <= end_date_obj)
            
        popular_books = popular_books_query.group_by(Book.id, Book.title, Book.author).order_by(
            db.func.count(Circulation.id).desc()
        ).limit(10).all()

        # College-wise statistics
        college_stats = db.session.query(
            College.name,
            db.func.count(User.id).label('user_count')
        ).outerjoin(User).group_by(College.id, College.name).all()

        # Department-wise statistics
        department_stats = db.session.query(
            Department.name,
            db.func.count(User.id).label('user_count')
        ).outerjoin(User).group_by(Department.id, Department.name).all()

        # Fine statistics
        if report_type == 'fine':
            fine_stats = db.session.query(
                db.func.sum(Circulation.fine_amount).label('total_fines'),
                db.func.count(Circulation.id).label('fine_records')
            ).filter(Circulation.fine_amount > 0)
            
            if start_date_obj:
                fine_stats = fine_stats.filter(Circulation.issue_date >= start_date_obj)
            if end_date_obj:
                fine_stats = fine_stats.filter(Circulation.issue_date <= end_date_obj)
                
            fine_data = fine_stats.first()
            total_fines = float(fine_data.total_fines or 0)
            fine_records = fine_data.fine_records or 0
        else:
            total_fines = 0
            fine_records = 0

        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = f'analytics_report_{timestamp}'
        
        if format_type == 'excel':
            return generate_excel_report(
                base_filename, total_books, total_ebooks, total_users, total_issued, 
                total_returned, total_overdue, total_fines, fine_records,
                category_stats, monthly_data, user_type_stats, popular_books,
                college_stats, department_stats, report_type, start_date, end_date
            )
        elif format_type == 'csv':
            return generate_csv_report(
                base_filename, total_books, total_ebooks, total_users, total_issued, 
                total_returned, total_overdue, total_fines, fine_records,
                category_stats, monthly_data, user_type_stats, popular_books,
                college_stats, department_stats, report_type, start_date, end_date
            )
        else:  # pdf
            return generate_pdf_report(
                base_filename, total_books, total_ebooks, total_users, total_issued, 
                total_returned, total_overdue, total_fines, fine_records,
                category_stats, monthly_data, user_type_stats, popular_books,
                college_stats, department_stats, report_type, start_date, end_date
            )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_excel_report(filename, total_books, total_ebooks, total_users, total_issued, 
                         total_returned, total_overdue, total_fines, fine_records,
                         category_stats, monthly_data, user_type_stats, popular_books,
                         college_stats, department_stats, report_type, start_date, end_date):
    """Generate Excel report with multiple sheets"""
    
    # Create Excel file in memory
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Summary Sheet
        summary_data = {
            'Metric': ['Total Books', 'Total E-books', 'Total Users', 'Books Issued', 
                      'Books Returned', 'Overdue Books', 'Total Fines', 'Fine Records'],
            'Value': [total_books, total_ebooks, total_users, total_issued, 
                     total_returned, total_overdue, total_fines, fine_records]
        }
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        # Category Distribution Sheet
        if category_stats:
            category_df = pd.DataFrame(category_stats, columns=['Category', 'Book Count'])
            category_df.to_excel(writer, sheet_name='Category Distribution', index=False)
        
        # Monthly Circulation Sheet
        if monthly_data:
            monthly_df = pd.DataFrame(monthly_data, columns=['Month', 'Circulation Count'])
            monthly_df.to_excel(writer, sheet_name='Monthly Circulation', index=False)
        
        # User Type Distribution Sheet
        if user_type_stats:
            user_type_df = pd.DataFrame(user_type_stats, columns=['User Type', 'Count'])
            user_type_df.to_excel(writer, sheet_name='User Distribution', index=False)
        
        # Popular Books Sheet
        if popular_books:
            popular_books_df = pd.DataFrame(popular_books, columns=['Title', 'Author', 'Circulation Count'])
            popular_books_df.to_excel(writer, sheet_name='Popular Books', index=False)
        
        # College Statistics Sheet
        if college_stats:
            college_df = pd.DataFrame(college_stats, columns=['College', 'User Count'])
            college_df.to_excel(writer, sheet_name='College Statistics', index=False)
        
        # Department Statistics Sheet
        if department_stats:
            department_df = pd.DataFrame(department_stats, columns=['Department', 'User Count'])
            department_df.to_excel(writer, sheet_name='Department Statistics', index=False)
        
        # Report Info Sheet
        report_info_data = {
            'Parameter': ['Report Type', 'Start Date', 'End Date', 'Generated On'],
            'Value': [
                report_type.replace('_', ' ').title() if report_type else 'All Data',
                start_date if start_date else 'N/A',
                end_date if end_date else 'N/A',
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ]
        }
        report_info_df = pd.DataFrame(report_info_data)
        report_info_df.to_excel(writer, sheet_name='Report Info', index=False)
    
    output.seek(0)
    
    return send_file(
        io.BytesIO(output.read()),
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'{filename}.xlsx'
    )

def generate_csv_report(filename, total_books, total_ebooks, total_users, total_issued, 
                       total_returned, total_overdue, total_fines, fine_records,
                       category_stats, monthly_data, user_type_stats, popular_books,
                       college_stats, department_stats, report_type, start_date, end_date):
    """Generate CSV report with summary data"""
    
    output = io.StringIO()
    
    # Write report header
    output.write(f"Library Analytics Report\n")
    output.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    if report_type:
        output.write(f"Report Type: {report_type.replace('_', ' ').title()}\n")
    if start_date and end_date:
        output.write(f"Period: {start_date} to {end_date}\n")
    output.write("\n")
    
    # Summary statistics
    output.write("SUMMARY STATISTICS\n")
    output.write("Metric,Value\n")
    output.write(f"Total Books,{total_books}\n")
    output.write(f"Total E-books,{total_ebooks}\n")
    output.write(f"Total Users,{total_users}\n")
    output.write(f"Books Issued,{total_issued}\n")
    output.write(f"Books Returned,{total_returned}\n")
    output.write(f"Overdue Books,{total_overdue}\n")
    output.write(f"Total Fines,{total_fines}\n")
    output.write(f"Fine Records,{fine_records}\n")
    output.write("\n")
    
    # Category distribution
    if category_stats:
        output.write("CATEGORY DISTRIBUTION\n")
        output.write("Category,Book Count\n")
        for category, count in category_stats:
            output.write(f"{category},{count}\n")
        output.write("\n")
    
    # Popular books
    if popular_books:
        output.write("POPULAR BOOKS\n")
        output.write("Title,Author,Circulation Count\n")
        for title, author, count in popular_books:
            output.write(f'"{title}","{author}",{count}\n')
        output.write("\n")
    
    # College statistics
    if college_stats:
        output.write("COLLEGE STATISTICS\n")
        output.write("College,User Count\n")
        for college, count in college_stats:
            output.write(f'"{college}",{count}\n')
    
    csv_data = output.getvalue()
    output.close()
    
    return send_file(
        io.BytesIO(csv_data.encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'{filename}.csv'
    )

def generate_pdf_report(filename, total_books, total_ebooks, total_users, total_issued, 
                       total_returned, total_overdue, total_fines, fine_records,
                       category_stats, monthly_data, user_type_stats, popular_books,
                       college_stats, department_stats, report_type, start_date, end_date):
    """Generate HTML report (can be converted to PDF by browser)"""
    
    # Generate comprehensive HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Library Analytics Report</title>
        <meta charset="UTF-8">
        <style>
            body {{ 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                color: #333; 
                line-height: 1.6;
                background: #f8f9fa;
            }}
            .container {{ 
                max-width: 1200px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }}
            .header {{ 
                text-align: center; 
                margin-bottom: 40px; 
                border-bottom: 3px solid #2563eb; 
                padding-bottom: 20px; 
            }}
            .header h1 {{ 
                color: #2563eb; 
                margin: 0; 
                font-size: 2.5em; 
                font-weight: 300; 
            }}
            .header p {{ 
                color: #666; 
                margin: 10px 0; 
                font-size: 1.1em; 
            }}
            .stats-grid {{ 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin-bottom: 40px; 
            }}
            .stat-card {{ 
                border: 1px solid #e1e5e9; 
                padding: 25px; 
                border-radius: 10px; 
                text-align: center; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }}
            .stat-value {{ 
                font-size: 2.5em; 
                font-weight: bold; 
                margin-bottom: 5px; 
            }}
            .stat-label {{ 
                font-size: 0.9em; 
                opacity: 0.9; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
            }}
            .section {{ 
                margin-bottom: 40px; 
                page-break-inside: avoid; 
            }}
            .section h3 {{ 
                border-bottom: 2px solid #2563eb; 
                padding-bottom: 10px; 
                color: #2563eb; 
                font-size: 1.5em; 
                margin-bottom: 20px; 
            }}
            table {{ 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
            }}
            th, td {{ 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
            }}
            th {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                font-weight: 600; 
                text-transform: uppercase; 
                font-size: 0.9em; 
                letter-spacing: 0.5px; 
            }}
            tbody tr:nth-child(even) {{ 
                background-color: #f8f9fa; 
            }}
            tbody tr:hover {{ 
                background-color: #e3f2fd; 
            }}
            .footer {{ 
                margin-top: 50px; 
                text-align: center; 
                color: #666; 
                font-size: 0.9em; 
                border-top: 1px solid #eee; 
                padding-top: 20px; 
            }}
            .two-column {{ 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 30px; 
            }}
            @media print {{
                body {{ background: white; }}
                .container {{ box-shadow: none; }}
                .section {{ page-break-inside: avoid; }}
                .stat-card {{ background: #f0f0f0 !important; color: #333 !important; }}
                th {{ background: #f0f0f0 !important; color: #333 !important; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Library Analytics Report</h1>
                <p><strong>Generated on:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                {f'<p><strong>Report Period:</strong> {start_date} to {end_date}</p>' if start_date and end_date else '<p><strong>Report Period:</strong> All Time Data</p>'}
                {f'<p><strong>Report Type:</strong> {report_type.replace("_", " ").title()}</p>' if report_type else ''}
            </div>

            <div class="section">
                <h3>📈 Key Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">{total_books:,}</div>
                        <div class="stat-label">Total Books</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{total_ebooks:,}</div>
                        <div class="stat-label">Total E-books</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{total_users:,}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{total_issued:,}</div>
                        <div class="stat-label">Books Issued</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{total_returned:,}</div>
                        <div class="stat-label">Books Returned</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{total_overdue:,}</div>
                        <div class="stat-label">Overdue Books</div>
                    </div>
                    {f'''
                    <div class="stat-card">
                        <div class="stat-value">₹{total_fines:,.2f}</div>
                        <div class="stat-label">Total Fines</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{fine_records:,}</div>
                        <div class="stat-label">Fine Records</div>
                    </div>
                    ''' if total_fines > 0 else ''}
                </div>
            </div>

            <div class="two-column">
                <div class="section">
                    <h3>📚 Category Distribution</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Book Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join([f'<tr><td>{category or "Uncategorized"}</td><td>{count:,}</td></tr>' for category, count in category_stats])}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h3>👥 User Distribution</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>User Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join([f'<tr><td>{role.title()}</td><td>{count:,}</td></tr>' for role, count in user_type_stats])}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section">
                <h3>🔥 Most Popular Books</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Circulation Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {''.join([f'<tr><td>{title}</td><td>{author}</td><td>{count:,}</td></tr>' for title, author, count in popular_books])}
                    </tbody>
                </table>
            </div>

            <div class="two-column">
                <div class="section">
                    <h3>🏫 College Statistics</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>College</th>
                                <th>Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join([f'<tr><td>{college or "Not Specified"}</td><td>{count:,}</td></tr>' for college, count in college_stats[:10]])}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h3>🏛️ Department Statistics</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join([f'<tr><td>{dept or "Not Specified"}</td><td>{count:,}</td></tr>' for dept, count in department_stats[:10]])}
                        </tbody>
                    </table>
                </div>
            </div>

            {f'''
            <div class="section">
                <h3>📅 Monthly Circulation Trend</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Circulation Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {''.join([f'<tr><td>{month or "N/A"}</td><td>{count:,}</td></tr>' for month, count in monthly_data])}
                    </tbody>
                </table>
            </div>
            ''' if monthly_data else ''}

            <div class="footer">
                <p>📖 Library Management System - Analytics Report</p>
                <p>This report contains confidential information. Handle with care.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_file(
        io.BytesIO(html_content.encode('utf-8')),
        mimetype='text/html',
        as_attachment=True,
        download_name=f'{filename}.html'
    )

# Thesis Management
@admin_bp.route('/thesis', methods=['GET'])
@admin_required
def get_thesis():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        college_id = request.args.get('college_id', type=int)
        department_id = request.args.get('department_id', type=int)
        thesis_type = request.args.get('type', '', type=str)
        
        # Build query
        query = Thesis.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Thesis.title.contains(search),
                    Thesis.author.contains(search),
                    Thesis.thesis_number.contains(search),
                    Thesis.project_guide.contains(search)
                )
            )
        
        if college_id:
            query = query.filter(Thesis.college_id == college_id)
            
        if department_id:
            query = query.filter(Thesis.department_id == department_id)
            
        if thesis_type:
            query = query.filter(Thesis.type == thesis_type)
        
        # Paginate
        paginated_thesis = query.order_by(Thesis.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get related data
        thesis_list = []
        for thesis in paginated_thesis.items:
            college = College.query.get(thesis.college_id)
            department = Department.query.get(thesis.department_id)
            creator = User.query.get(thesis.created_by)
            
            thesis_list.append({
                'id': thesis.id,
                'thesis_number': thesis.thesis_number,
                'author': thesis.author,
                'project_guide': thesis.project_guide,
                'title': thesis.title,
                'college_id': thesis.college_id,
                'college_name': college.name if college else 'Unknown',
                'department_id': thesis.department_id,
                'department_name': department.name if department else 'Unknown',
                'type': thesis.type,
                'pdf_file_name': thesis.pdf_file_name,
                'pdf_file_size': thesis.pdf_file_size,
                'download_count': thesis.download_count,
                'created_by': creator.name if creator else 'Unknown',
                'created_at': thesis.created_at.isoformat() if thesis.created_at else None,
                'updated_at': thesis.updated_at.isoformat() if thesis.updated_at else None
            })
        
        return jsonify({
            'thesis': thesis_list,
            'pagination': {
                'page': page,
                'pages': paginated_thesis.pages,
                'per_page': per_page,
                'total': paginated_thesis.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/thesis', methods=['POST'])
@admin_required
def create_thesis():
    try:
        user_id = get_jwt_identity()
        
        # Get form data
        thesis_number = request.form.get('thesis_number')
        author = request.form.get('author')
        project_guide = request.form.get('project_guide')
        title = request.form.get('title')
        college_id = request.form.get('college_id', type=int)
        department_id = request.form.get('department_id', type=int)
        thesis_type = request.form.get('type')
        
        # Validate required fields
        if not all([thesis_number, author, project_guide, title, college_id, department_id, thesis_type]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if thesis number already exists
        existing_thesis = Thesis.query.filter_by(thesis_number=thesis_number).first()
        if existing_thesis:
            return jsonify({'error': 'Thesis number already exists'}), 400
        
        # Handle file upload
        pdf_file = request.files.get('pdf_file')
        if not pdf_file:
            return jsonify({'error': 'PDF file is required'}), 400
        
        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join('uploads', 'thesis')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        unique_filename = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        pdf_file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        file_size_mb = f"{file_size / (1024 * 1024):.2f} MB"
        
        # Create thesis record
        thesis = Thesis(
            thesis_number=thesis_number,
            author=author,
            project_guide=project_guide,
            title=title,
            college_id=college_id,
            department_id=department_id,
            type=thesis_type,
            pdf_file_name=pdf_file.filename,
            pdf_file_path=file_path,
            pdf_file_size=file_size_mb,
            created_by=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(thesis)
        db.session.commit()
        
        return jsonify({'message': 'Thesis added successfully', 'thesis_id': thesis.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/thesis/<int:thesis_id>/download', methods=['GET'])
@admin_required
def download_thesis(thesis_id):
    try:
        thesis = Thesis.query.get_or_404(thesis_id)
        
        # Increment download count
        thesis.download_count = (thesis.download_count or 0) + 1
        db.session.commit()
        
        # Return file
        return send_file(
            thesis.pdf_file_path,
            as_attachment=True,
            download_name=thesis.pdf_file_name,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/thesis/<int:thesis_id>', methods=['DELETE'])
@admin_required
def delete_thesis(thesis_id):
    try:
        thesis = Thesis.query.get_or_404(thesis_id)
        
        # Delete file from filesystem
        if os.path.exists(thesis.pdf_file_path):
            os.remove(thesis.pdf_file_path)
        
        # Delete from database
        db.session.delete(thesis)
        db.session.commit()
        
        return jsonify({'message': 'Thesis deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Holiday Management Endpoints

@admin_bp.route('/holidays', methods=['GET'])
@admin_required
def get_holidays():
    """Get all holidays with pagination and filtering"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '').strip()
        is_recurring = request.args.get('is_recurring')

        query = Holiday.query

        # Apply search filter
        if search:
            query = query.filter(Holiday.name.ilike(f'%{search}%'))

        # Apply recurring filter
        if is_recurring is not None:
            is_recurring_bool = is_recurring.lower() == 'true'
            query = query.filter(Holiday.is_recurring == is_recurring_bool)

        # Order by date
        query = query.order_by(Holiday.date)

        holidays = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'holidays': [holiday.to_dict() for holiday in holidays.items],
            'pagination': {
                'page': holidays.page,
                'pages': holidays.pages,
                'per_page': holidays.per_page,
                'total': holidays.total
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/holidays', methods=['POST'])
@admin_required
def create_holiday():
    """Create a new holiday"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        holiday_date = data.get('date')
        description = data.get('description', '').strip()
        is_recurring = data.get('is_recurring', False)

        if not name or not holiday_date:
            return jsonify({'error': 'Name and date are required'}), 400

        # Parse date
        try:
            parsed_date = datetime.strptime(holiday_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # Check for duplicate holidays on the same date
        existing = Holiday.query.filter_by(date=parsed_date).first()
        if existing:
            return jsonify({'error': f'A holiday already exists on {holiday_date}: {existing.name}'}), 400

        holiday = Holiday(
            name=name,
            date=parsed_date,
            description=description if description else None,
            is_recurring=is_recurring
        )

        db.session.add(holiday)
        db.session.commit()

        return jsonify({
            'message': 'Holiday created successfully',
            'holiday': holiday.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/holidays/<int:holiday_id>', methods=['PUT'])
@admin_required
def update_holiday(holiday_id):
    """Update an existing holiday"""
    try:
        holiday = Holiday.query.get_or_404(holiday_id)
        data = request.get_json()

        name = data.get('name', '').strip()
        holiday_date = data.get('date')
        description = data.get('description', '').strip()
        is_recurring = data.get('is_recurring')

        if name:
            holiday.name = name

        if holiday_date:
            try:
                parsed_date = datetime.strptime(holiday_date, '%Y-%m-%d').date()
                # Check for duplicate holidays on the same date (excluding current holiday)
                existing = Holiday.query.filter(
                    Holiday.date == parsed_date,
                    Holiday.id != holiday_id
                ).first()
                if existing:
                    return jsonify({'error': f'A holiday already exists on {holiday_date}: {existing.name}'}), 400
                holiday.date = parsed_date
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        if description is not None:
            holiday.description = description if description else None

        if is_recurring is not None:
            holiday.is_recurring = is_recurring

        db.session.commit()

        return jsonify({
            'message': 'Holiday updated successfully',
            'holiday': holiday.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/holidays/<int:holiday_id>', methods=['DELETE'])
@admin_required
def delete_holiday(holiday_id):
    """Delete a holiday"""
    try:
        holiday = Holiday.query.get_or_404(holiday_id)

        db.session.delete(holiday)
        db.session.commit()

        return jsonify({'message': 'Holiday deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/holidays/upcoming', methods=['GET'])
@admin_required
def get_upcoming_holidays():
    """Get upcoming holidays"""
    try:
        days_ahead = int(request.args.get('days', 30))
        upcoming_holidays = Holiday.get_upcoming_holidays(days_ahead)

        return jsonify({
            'holidays': [holiday.to_dict() for holiday in upcoming_holidays],
            'count': len(upcoming_holidays)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/holidays/bulk', methods=['POST'])
@admin_required
def bulk_import_holidays():
    """Bulk import holidays from CSV/Excel file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format. Use CSV or Excel files.'}), 400

        # Validate required columns
        required_columns = ['name', 'date']
        if not all(col in df.columns for col in required_columns):
            return jsonify({'error': f'File must contain columns: {required_columns}'}), 400

        created_holidays = []
        errors = []

        for index, row in df.iterrows():
            try:
                name = str(row['name']).strip()
                holiday_date = row['date']
                description = str(row.get('description', '')).strip() if pd.notna(row.get('description')) else None
                is_recurring = bool(row.get('is_recurring', False)) if pd.notna(row.get('is_recurring')) else False

                if not name:
                    errors.append(f"Row {index + 1}: Holiday name is required")
                    continue

                # Parse date
                if isinstance(holiday_date, str):
                    try:
                        parsed_date = datetime.strptime(holiday_date, '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            parsed_date = datetime.strptime(holiday_date, '%m/%d/%Y').date()
                        except ValueError:
                            errors.append(f"Row {index + 1}: Invalid date format for '{holiday_date}'. Use YYYY-MM-DD or MM/DD/YYYY")
                            continue
                else:
                    # Handle pandas datetime
                    parsed_date = pd.to_datetime(holiday_date).date()

                # Check for duplicate
                existing = Holiday.query.filter_by(date=parsed_date).first()
                if existing:
                    errors.append(f"Row {index + 1}: Holiday already exists on {parsed_date}: {existing.name}")
                    continue

                holiday = Holiday(
                    name=name,
                    date=parsed_date,
                    description=description,
                    is_recurring=is_recurring
                )

                db.session.add(holiday)
                created_holidays.append({
                    'name': name,
                    'date': parsed_date.isoformat(),
                    'description': description,
                    'is_recurring': is_recurring
                })

            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")

        if created_holidays:
            db.session.commit()

        return jsonify({
            'message': f'Bulk import completed. Created {len(created_holidays)} holidays.',
            'created_holidays': created_holidays,
            'errors': errors,
            'summary': {
                'total_rows': len(df),
                'created': len(created_holidays),
                'errors': len(errors)
            }
        }), 200 if created_holidays else 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/holidays/export', methods=['GET'])
@admin_required
def export_holidays():
    """Export holidays to CSV"""
    try:
        holidays = Holiday.query.order_by(Holiday.date).all()

        # Create CSV data
        output = io.StringIO()
        output.write('name,date,description,is_recurring\n')

        for holiday in holidays:
            description = holiday.description.replace(',', ';') if holiday.description else ''
            output.write(f'"{holiday.name}",{holiday.date},{description},{holiday.is_recurring}\n')

        # Create response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'holidays_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500
