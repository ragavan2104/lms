from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Book, Ebook, Circulation, db
from datetime import datetime
from functools import wraps

student_bp = Blueprint('student', __name__)

def student_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return f(*args, **kwargs)
    return decorated_function

# Student Dashboard
@student_bp.route('/dashboard', methods=['GET'])
@student_required
def get_dashboard():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Get current borrowed books
        borrowed_books = Circulation.query.filter_by(
            user_id=user_id, 
            status='issued'
        ).all()
        
        # Get book history
        book_history = Circulation.query.filter_by(user_id=user_id).all()
        
        # Calculate total fines
        total_fines = sum(circ.fine_amount for circ in book_history)
        
        return jsonify({
            'user': {
                'name': user.name,
                'user_id': user.user_id,
                'email': user.email,
                'college': user.college.name if user.college else None,
                'department': user.department.name if user.department else None,
                'validity_date': user.validity_date.isoformat()
            },
            'stats': {
                'books_borrowed': len(borrowed_books),
                'total_books_read': len(book_history),
                'total_fines': total_fines
            },
            'borrowed_books': [{
                'id': circ.id,
                'book_title': circ.book.title,
                'book_author': circ.book.author,
                'issue_date': circ.issue_date.isoformat(),
                'due_date': circ.due_date.isoformat(),
                'days_remaining': (circ.due_date - datetime.utcnow()).days,
                'is_overdue': datetime.utcnow() > circ.due_date
            } for circ in borrowed_books]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Browse Books
@student_bp.route('/books', methods=['GET'])
@student_required
def browse_books():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        
        query = Book.query
        if search:
            query = query.filter(
                Book.title.contains(search) | 
                Book.author.contains(search)
            )
        if category:
            query = query.filter_by(category=category)
        
        books = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'books': [{
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'publisher': book.publisher,
                'publication_year': book.publication_year,
                'category': book.category,
                'available_copies': book.available_copies,
                'total_copies': book.total_copies,
                'description': book.description
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

# Browse Ebooks
@student_bp.route('/ebooks', methods=['GET'])
@student_required
def browse_ebooks():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        
        query = Ebook.query
        if search:
            query = query.filter(
                Ebook.title.contains(search) | 
                Ebook.author.contains(search)
            )
        if category:
            query = query.filter_by(category=category)
        
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
                'description': ebook.description
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

# Get Borrowing History
@student_bp.route('/history', methods=['GET'])
@student_required
def get_history():
    try:
        user_id = get_jwt_identity()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        circulations = Circulation.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'history': [{
                'id': circ.id,
                'book_title': circ.book.title,
                'book_author': circ.book.author,
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

# Download Ebook
@student_bp.route('/ebooks/<int:ebook_id>/download', methods=['POST'])
@student_required
def download_ebook(ebook_id):
    try:
        ebook = Ebook.query.get(ebook_id)
        if not ebook:
            return jsonify({'error': 'Ebook not found'}), 404
        
        # Increment download count
        ebook.download_count += 1
        db.session.commit()
        
        return jsonify({
            'message': 'Download started',
            'file_path': ebook.file_path,
            'download_count': ebook.download_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
