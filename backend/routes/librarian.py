from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Book, Ebook, Circulation, NewsClipping, Settings, Reservation, Department, Category, College, Thesis, Holiday, db
from datetime import datetime, timedelta
from functools import wraps
import os
import uuid

librarian_bp = Blueprint('librarian', __name__)

def calculate_due_date_skipping_holidays_and_sundays(start_date, days):
    """Calculate due date skipping holidays and Sundays"""
    from datetime import date, timedelta

    current_date = start_date
    days_added = 0

    while days_added < days:
        current_date += timedelta(days=1)

        # Check if current date is not a holiday and not a Sunday
        # weekday() returns 6 for Sunday
        if not Holiday.is_holiday(current_date) and current_date.weekday() != 6:
            days_added += 1

    return current_date

def librarian_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role not in ['admin', 'librarian']:
            return jsonify({'error': 'Librarian access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Book Management
@librarian_bp.route('/books', methods=['GET'])
@librarian_required
def get_books():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        
        query = Book.query
        if search:
            query = query.filter(
                Book.title.contains(search) |
                Book.author.contains(search) |
                Book.isbn.contains(search) |
                Book.call_no.contains(search) |
                Book.access_no.contains(search) |
                Book.author_1.contains(search)
            )
        
        books = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'books': [{
                'id': book.id,
                'access_no': getattr(book, 'access_no', None),
                'call_no': getattr(book, 'call_no', None),
                'isbn': book.isbn,
                'title': book.title,
                'author': book.author or getattr(book, 'author_1', None),
                'author_1': getattr(book, 'author_1', None),
                'author_2': getattr(book, 'author_2', None),
                'author_3': getattr(book, 'author_3', None),
                'author_4': getattr(book, 'author_4', None),
                'publisher': book.publisher,
                'publication_year': getattr(book, 'publication_year', None),
                'category': book.category,
                'department': getattr(book, 'department', None),
                'total_copies': getattr(book, 'number_of_copies', 1),
                'available_copies': getattr(book, 'available_copies', 1),
                'location': book.location,
                'pages': getattr(book, 'pages', None),
                'price': float(getattr(book, 'price', 0)) if getattr(book, 'price', None) else None,
                'edition': getattr(book, 'edition', None),
                'description': getattr(book, 'description', None),
                'created_at': book.created_at.isoformat()
            } for book in books.items],
            'pagination': {
                'page': books.page,
                'pages': books.pages,
                'per_page': books.per_page,
                'total': books.total
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@librarian_bp.route('/books', methods=['POST'])
@librarian_required
def create_book():
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('title') or not data.get('author_1'):
            return jsonify({'error': 'Title and primary author are required'}), 400

        # Validate call_no if provided
        call_no = data.get('call_no', '').strip() if data.get('call_no') else None
        if call_no and len(call_no) > 100:
            return jsonify({'error': 'Call number cannot exceed 100 characters'}), 400

        book = Book(
            access_no=data.get('access_no'),
            call_no=call_no,
            isbn=data.get('isbn'),
            title=data.get('title'),
            author_1=data.get('author_1'),
            author_2=data.get('author_2'),
            author_3=data.get('author_3'),
            author_4=data.get('author_4'),
            author=data.get('author_1'),  # Legacy field
            publisher=data.get('publisher'),
            department=data.get('department'),
            category=data.get('category'),
            number_of_copies=data.get('total_copies', 1),
            available_copies=data.get('total_copies', 1),
            location=data.get('location'),
            pages=data.get('pages', 0),
            price=data.get('price', 0),
            edition=data.get('edition', 'Not Specified'),
            description=data.get('description')
        )

        db.session.add(book)
        db.session.commit()

        return jsonify({
            'message': 'Book created successfully',
            'book': {
                'id': book.id,
                'title': book.title,
                'author': book.author_1,
                'call_no': book.call_no
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ebook Management
@librarian_bp.route('/ebooks', methods=['GET'])
@librarian_required
def get_ebooks():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        
        query = Ebook.query
        if search:
            query = query.filter(
                Ebook.title.contains(search) | 
                Ebook.author.contains(search)
            )
        
        ebooks = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'ebooks': [{
                'id': ebook.id,
                'title': ebook.title,
                'author': ebook.author,
                'publisher': ebook.publisher,
                'publication_year': ebook.publication_year,
                'category': ebook.category,
                'format': ebook.format,
                'file_size': ebook.file_size,
                'download_count': ebook.download_count,
                'description': ebook.description,
                'created_at': ebook.created_at.isoformat()
            } for ebook in ebooks.items],
            'pagination': {
                'page': ebooks.page,
                'pages': ebooks.pages,
                'per_page': ebooks.per_page,
                'total': ebooks.total
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@librarian_bp.route('/ebooks', methods=['POST'])
@librarian_required
def create_ebook():
    try:
        data = request.get_json()
        
        ebook = Ebook(
            title=data.get('title'),
            author=data.get('author'),
            publisher=data.get('publisher'),
            publication_year=data.get('publication_year'),
            category=data.get('category'),
            file_path=data.get('file_path'),
            file_size=data.get('file_size'),
            format=data.get('format'),
            description=data.get('description')
        )
        
        db.session.add(ebook)
        db.session.commit()
        
        return jsonify({
            'message': 'Ebook created successfully',
            'ebook': {
                'id': ebook.id,
                'title': ebook.title,
                'author': ebook.author
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Circulation Management
@librarian_bp.route('/circulation/issue', methods=['POST'])
@librarian_required
def issue_book():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        book_id = data.get('book_id')
        days = data.get('days', 14)  # Default 14 days
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if user account is active and not expired
        if not user.is_active:
            return jsonify({'error': 'User account has been deactivated. Please contact the administrator.'}), 400

        if user.is_expired():
            expiration_status = user.get_expiration_status()
            return jsonify({
                'error': 'Cannot issue book to expired user account',
                'message': expiration_status['message'],
                'expired_date': user.validity_date.isoformat() if user.validity_date else None
            }), 400

        # Check if today is a holiday
        from datetime import date
        today = date.today()
        holiday = Holiday.is_holiday(today)

        # Check if book issues are allowed on holidays (configurable setting)
        allow_issues_on_holidays = Settings.get_setting('allow_book_issues_on_holidays', False)

        if holiday and not allow_issues_on_holidays:
            return jsonify({
                'error': f'Book issues are not allowed on holidays',
                'holiday_name': holiday.name,
                'holiday_date': holiday.date.isoformat(),
                'message': f'Today is {holiday.name}. Library book issues are suspended on holidays.'
            }), 400

        # Check borrowing limits
        current_borrowed_count = Circulation.query.filter_by(
            user_id=user.id,
            status='issued'
        ).count()

        # Get maximum books allowed based on user role
        if user.role == 'student':
            max_books = Settings.get_setting('max_books_per_student', 3)
        elif user.role == 'staff':
            max_books = Settings.get_setting('max_books_per_staff', 5)
        else:
            # For other roles, use student limit as default
            max_books = Settings.get_setting('max_books_per_student', 3)

        if current_borrowed_count >= max_books:
            return jsonify({
                'error': f'User has reached the maximum borrowing limit of {max_books} books. Currently borrowed: {current_borrowed_count} books. Please return some books before issuing new ones.'
            }), 400

        # Check if book exists and is available
        book = Book.query.get(book_id)
        if not book:
            return jsonify({'error': 'Book not found'}), 404

        if book.available_copies <= 0:
            return jsonify({'error': 'Book not available'}), 400

        # Check for active reservations
        active_reservations = db.session.query(Reservation, User).join(
            User, Reservation.user_id == User.id
        ).filter(
            Reservation.book_id == book.id,
            Reservation.status == 'active'
        ).order_by(Reservation.queue_position).all()

        # Check if we need to handle reservations
        reservation_override = data.get('override_reservation', False)

        if active_reservations:
            # Check if the user trying to issue is the first in queue
            first_reservation, first_reserved_user = active_reservations[0]

            if first_reserved_user.id == user.id:
                # User is the first in queue, fulfill the reservation
                first_reservation.status = 'fulfilled'
                # Update queue positions for remaining reservations
                for reservation, _ in active_reservations[1:]:
                    reservation.queue_position -= 1
            elif not reservation_override:
                # Book is reserved by someone else and no override requested
                return jsonify({
                    'error': 'RESERVATION_CONFLICT',
                    'message': f'This book is currently reserved by {first_reserved_user.name} (ID: {first_reserved_user.user_id}). You can override this reservation to issue the book to another user.',
                    'reservation_details': {
                        'student_name': first_reserved_user.name,
                        'student_id': first_reserved_user.user_id,
                        'student_email': first_reserved_user.email,
                        'reservation_date': first_reservation.reservation_date.isoformat(),
                        'queue_position': first_reservation.queue_position,
                        'total_reservations': len(active_reservations)
                    },
                    'can_override': True
                }), 409  # Conflict status code
            else:
                # Override reservation - issue to different user
                # Note: We don't cancel the reservation, just issue the book
                # The reservation will be handled when the book is returned
                pass

        # Calculate due date (skip holidays if setting is enabled)
        skip_holidays_for_due_date = Settings.get_setting('skip_holidays_for_due_date', True)

        if skip_holidays_for_due_date:
            due_date = calculate_due_date_skipping_holidays_and_sundays(today, days)
            due_datetime = datetime.combine(due_date, datetime.min.time())
        else:
            due_datetime = datetime.utcnow() + timedelta(days=days)

        # Create circulation record
        circulation = Circulation(
            user_id=user_id,
            book_id=book_id,
            due_date=due_datetime
        )
        
        # Update book availability
        book.available_copies -= 1
        
        db.session.add(circulation)
        db.session.commit()
        
        return jsonify({
            'message': 'Book issued successfully',
            'circulation': {
                'id': circulation.id,
                'due_date': circulation.due_date.isoformat()
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@librarian_bp.route('/circulation/return', methods=['POST'])
@librarian_required
def return_book():
    try:
        data = request.get_json()
        circulation_id = data.get('circulation_id')
        
        circulation = Circulation.query.get(circulation_id)
        if not circulation:
            return jsonify({'error': 'Circulation record not found'}), 404
        
        if circulation.return_date:
            return jsonify({'error': 'Book already returned'}), 400
        
        # Update circulation record
        circulation.return_date = datetime.utcnow()
        circulation.status = 'returned'
        
        # Calculate fine if overdue
        fine = circulation.calculate_fine()
        circulation.fine_amount = fine
        
        # Update book availability
        book = Book.query.get(circulation.book_id)
        book.available_copies += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Book returned successfully',
            'fine_amount': fine
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@librarian_bp.route('/circulation', methods=['GET'])
@librarian_required
def get_circulation():
    try:
        status = request.args.get('status', 'issued')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        query = Circulation.query.filter_by(status=status)
        circulations = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'circulations': [{
                'id': circ.id,
                'user_name': circ.user.name,
                'book_title': circ.book.title,
                'issue_date': circ.issue_date.isoformat(),
                'due_date': circ.due_date.isoformat(),
                'return_date': circ.return_date.isoformat() if circ.return_date else None,
                'fine_amount': circ.fine_amount,
                'status': circ.status
            } for circ in circulations.items],
            'pagination': {
                'page': circulations.page,
                'pages': circulations.pages,
                'per_page': circulations.per_page,
                'total': circulations.total
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Analytics Dashboard
@librarian_bp.route('/analytics/dashboard', methods=['GET'])
@librarian_required
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
        
        # Recent activity (filtered)
        recent_activity_query = Circulation.query
        if start_date_obj:
            recent_activity_query = recent_activity_query.filter(Circulation.issue_date >= start_date_obj)
        if end_date_obj:
            recent_activity_query = recent_activity_query.filter(Circulation.issue_date <= end_date_obj)
            
        recent_activity = recent_activity_query.order_by(
            Circulation.issue_date.desc()
        ).limit(10).all()
        
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
            'recentActivity': [
                {
                    'id': activity.id,
                    'book_title': activity.book.title if activity.book else 'N/A',
                    'user_name': activity.user.full_name if activity.user else 'N/A',
                    'issue_date': activity.issue_date.isoformat() if activity.issue_date else None,
                    'status': activity.status
                }
                for activity in recent_activity
            ],
            'reportType': report_type,
            'dateRange': {
                'startDate': start_date,
                'endDate': end_date
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Thesis Management Routes for Librarians
@librarian_bp.route('/colleges', methods=['GET'])
@librarian_required
def get_colleges():
    try:
        colleges = College.query.all()
        return jsonify([{
            'id': college.id,
            'name': college.name,
            'code': college.code
        } for college in colleges]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@librarian_bp.route('/departments', methods=['GET'])
@librarian_required
def get_departments():
    try:
        departments = Department.query.all()
        return jsonify([{
            'id': dept.id,
            'name': dept.name,
            'code': dept.code,
            'college_id': dept.college_id
        } for dept in departments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@librarian_bp.route('/thesis', methods=['GET'])
@librarian_required
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

@librarian_bp.route('/thesis', methods=['POST'])
@librarian_required
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

@librarian_bp.route('/thesis/<int:thesis_id>/download', methods=['GET'])
@librarian_required
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
