from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash
import string
import random

# db will be imported from the main app
db = None

def get_db():
    return db

class College(get_db().Model):
    __tablename__ = 'colleges'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(10), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    departments = db.relationship('Department', backref='college', lazy=True, cascade='all, delete-orphan')
    users = db.relationship('User', backref='college', lazy=True)

class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey('colleges.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='department', lazy=True)
    
    __table_args__ = (db.UniqueConstraint('name', 'college_id'),)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False, unique=True)  # Roll number for students
    username = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    role = db.Column(db.String(20), nullable=False)  # admin, librarian, student, staff
    designation = db.Column(db.String(50), nullable=False)  # student or staff
    dob = db.Column(db.Date, nullable=False)
    validity_date = db.Column(db.Date, nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey('colleges.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    batch_from = db.Column(db.Integer, nullable=True)  # Starting year of batch
    batch_to = db.Column(db.Integer, nullable=True)    # Ending year of batch
    address = db.Column(db.Text, nullable=True)  # User address
    phone = db.Column(db.String(20), nullable=True)  # Phone number
    profile_picture = db.Column(db.String(255), nullable=True)  # Profile picture path
    is_active = db.Column(db.Boolean, default=True)
    first_login_completed = db.Column(db.Boolean, default=False)  # Track if user has completed mandatory password change
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    circulations = db.relationship('Circulation', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def generate_username(name, user_id):
        """Generate username from name + user_id"""
        # Remove spaces and special characters from name, take first part
        clean_name = ''.join(c for c in name.split()[0] if c.isalnum()).lower()
        return f"{clean_name}{user_id}"
    
    @staticmethod
    def generate_password(user_id):
        """Generate password using userid+userid format"""
        return f"{user_id}{user_id}"

    @staticmethod
    def generate_random_password(length=8):
        """Generate random password (legacy method)"""
        characters = string.ascii_letters + string.digits
        return ''.join(random.choice(characters) for _ in range(length))

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    access_no = db.Column(db.String(50), nullable=False, unique=True)  # Access number
    isbn = db.Column(db.String(20))
    title = db.Column(db.String(200), nullable=False)

    # Multiple authors support
    author_1 = db.Column(db.String(200), nullable=False)  # Primary author (required)
    author_2 = db.Column(db.String(200), nullable=True)   # Optional
    author_3 = db.Column(db.String(200), nullable=True)   # Optional
    author_4 = db.Column(db.String(200), nullable=True)   # Optional

    # Legacy author field for backward compatibility
    author = db.Column(db.String(200), nullable=True)

    publisher = db.Column(db.String(100))
    publication_year = db.Column(db.Integer)
    category = db.Column(db.String(50))
    department = db.Column(db.String(100))  # Academic department

    # Optional fields for bulk upload compatibility
    pages = db.Column(db.Integer, nullable=True, default=0)  # Number of pages - now optional
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Book price
    edition = db.Column(db.String(50), nullable=True, default='Not Specified')  # Edition - now optional

    # Copy management
    number_of_copies = db.Column(db.Integer, default=1)  # Total copies
    available_copies = db.Column(db.Integer, default=1)  # Available copies

    location = db.Column(db.String(50))  # Shelf location
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    circulations = db.relationship('Circulation', backref='book', lazy=True)

    def get_authors_list(self):
        """Return a list of all authors (non-empty)"""
        authors = []
        if self.author_1:
            authors.append(self.author_1)
        if self.author_2:
            authors.append(self.author_2)
        if self.author_3:
            authors.append(self.author_3)
        if self.author_4:
            authors.append(self.author_4)
        return authors

    def get_authors_string(self):
        """Return authors as a formatted string"""
        authors = self.get_authors_list()
        if len(authors) == 1:
            return authors[0]
        elif len(authors) == 2:
            return f"{authors[0]} and {authors[1]}"
        elif len(authors) > 2:
            return f"{authors[0]} et al."
        return "Unknown Author"

class Ebook(db.Model):
    __tablename__ = 'ebooks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    publisher = db.Column(db.String(100))
    publication_year = db.Column(db.Integer)
    category = db.Column(db.String(50))
    file_path = db.Column(db.String(500))  # Path to ebook file
    file_size = db.Column(db.String(20))   # File size in MB
    format = db.Column(db.String(10))      # PDF, EPUB, etc.
    description = db.Column(db.Text)
    download_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Circulation(db.Model):
    __tablename__ = 'circulations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)
    fine_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='issued')  # issued, returned, overdue
    notes = db.Column(db.Text)
    
    def calculate_fine(self, fine_per_day=1.0):
        """Calculate fine for overdue books"""
        if self.return_date and self.return_date > self.due_date:
            days_overdue = (self.return_date - self.due_date).days
            return days_overdue * fine_per_day
        elif not self.return_date and datetime.utcnow() > self.due_date:
            days_overdue = (datetime.utcnow() - self.due_date).days
            return days_overdue * fine_per_day
        return 0.0

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

class NewsClipping(db.Model):
    __tablename__ = 'news_clippings'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    source = db.Column(db.String(100))
    date_published = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50))
    image_path = db.Column(db.String(500))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Thesis(db.Model):
    __tablename__ = 'thesis'
    
    id = db.Column(db.Integer, primary_key=True)
    # New required fields
    thesis_number = db.Column(db.String(50), nullable=False, unique=True)  # Unique thesis number
    author = db.Column(db.String(200), nullable=False)  # Student/Author name
    project_guide = db.Column(db.String(200), nullable=False)  # Project guide/supervisor name
    
    # Existing fields
    title = db.Column(db.String(300), nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey('colleges.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # mini project, design project, major project
    
    # File information
    pdf_file_name = db.Column(db.String(255), nullable=False)
    pdf_file_path = db.Column(db.String(500), nullable=False)
    pdf_file_size = db.Column(db.String(20))
    
    # Metadata
    download_count = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    college = db.relationship('College', backref='theses')
    department = db.relationship('Department', backref='theses')
    creator = db.relationship('User', backref='created_theses')
