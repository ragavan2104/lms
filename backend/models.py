from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import string
import random

# Initialize db as a placeholder - will be set by the main app
db = SQLAlchemy()

class College(db.Model):
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

    # New fields for enhanced categorization
    category = db.Column(db.String(50), nullable=True)  # For students: UG, PG, Research Scholar
    staff_designation = db.Column(db.String(50), nullable=True)  # For staff: Teaching, Non-Teaching

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
    call_no = db.Column(db.String(100), nullable=True)  # Call number for library classification
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

    # New procurement fields
    supplier_name = db.Column(db.String(200), nullable=True)  # Supplier/vendor name
    invoice_number = db.Column(db.String(100), nullable=True)  # Invoice number
    invoice_date = db.Column(db.Date, nullable=True)  # Invoice date

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

class Journal(db.Model):
    __tablename__ = 'journals'

    id = db.Column(db.Integer, primary_key=True)
    journal_name = db.Column(db.String(300), nullable=False)
    journal_type = db.Column(db.String(50), nullable=False)  # National Journal, International Journal
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
        """Calculate fine for overdue books excluding holidays and Sundays"""
        from datetime import timedelta

        if self.return_date and self.return_date > self.due_date:
            end_date = self.return_date.date()
        elif not self.return_date and datetime.utcnow() > self.due_date:
            end_date = datetime.utcnow().date()
        else:
            return 0.0

        due_date = self.due_date.date()

        # Calculate working days (excluding holidays and Sundays)
        working_days_overdue = 0
        current_date = due_date + timedelta(days=1)  # Start from day after due date

        while current_date <= end_date:
            # Check if current date is not a holiday and not a Sunday
            # weekday() returns 6 for Sunday
            if not Holiday.is_holiday(current_date) and current_date.weekday() != 6:
                working_days_overdue += 1
            current_date += timedelta(days=1)

        return working_days_overdue * fine_per_day

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

class Holiday(db.Model):
    __tablename__ = 'holidays'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text)
    is_recurring = db.Column(db.Boolean, default=False)  # Whether holiday repeats annually
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    created_by_user = db.relationship('User', backref='holidays_created')

    def __repr__(self):
        return f'<Holiday {self.name} on {self.date}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'date': self.date.isoformat() if self.date else None,
            'description': self.description,
            'is_recurring': self.is_recurring,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    @staticmethod
    def is_holiday(check_date):
        """Check if a given date is a holiday"""
        from datetime import date

        # Check for exact date match
        exact_match = Holiday.query.filter_by(date=check_date).first()
        if exact_match:
            return exact_match

        # Check for recurring holidays (same month and day)
        recurring_holidays = Holiday.query.filter_by(is_recurring=True).all()
        for holiday in recurring_holidays:
            if holiday.date.month == check_date.month and holiday.date.day == check_date.day:
                return holiday

        return None

    @staticmethod
    def get_upcoming_holidays(days_ahead=30):
        """Get holidays in the next N days"""
        from datetime import date, timedelta

        today = date.today()
        end_date = today + timedelta(days=days_ahead)

        # Get holidays in date range
        upcoming = Holiday.query.filter(
            Holiday.date >= today,
            Holiday.date <= end_date
        ).order_by(Holiday.date).all()

        # Add recurring holidays for current year
        recurring_holidays = Holiday.query.filter_by(is_recurring=True).all()
        for holiday in recurring_holidays:
            # Create date for current year
            try:
                current_year_date = date(today.year, holiday.date.month, holiday.date.day)
                if today <= current_year_date <= end_date:
                    # Check if not already in list
                    if not any(h.date == current_year_date for h in upcoming):
                        # Create a temporary holiday object for display
                        temp_holiday = Holiday()
                        temp_holiday.id = holiday.id
                        temp_holiday.name = holiday.name
                        temp_holiday.date = current_year_date
                        temp_holiday.description = holiday.description
                        temp_holiday.is_recurring = holiday.is_recurring
                        temp_holiday.created_at = holiday.created_at
                        upcoming.append(temp_holiday)
            except ValueError:
                # Handle leap year issues (Feb 29)
                continue

        # Sort by date
        upcoming.sort(key=lambda x: x.date)
        return upcoming

class Settings(db.Model):
    __tablename__ = 'settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @staticmethod
    def get_setting(key, default_value=None):
        """Get a setting value by key"""
        setting = Settings.query.filter_by(key=key).first()
        if setting:
            # Try to convert to appropriate type
            value = setting.value
            if value.lower() in ['true', 'false']:
                return value.lower() == 'true'
            try:
                return int(value)
            except ValueError:
                try:
                    return float(value)
                except ValueError:
                    return value
        return default_value

    @staticmethod
    def set_setting(key, value, description=None):
        """Set a setting value"""
        setting = Settings.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
            if description:
                setting.description = description
            setting.updated_at = datetime.utcnow()
        else:
            setting = Settings(key=key, value=str(value), description=description)
            db.session.add(setting)
        db.session.commit()
        return setting
