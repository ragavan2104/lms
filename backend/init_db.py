from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import date, timedelta
from werkzeug.security import generate_password_hash
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)

# Define models inline for initialization
class College(db.Model):
    __tablename__ = 'colleges'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(10), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey('colleges.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False, unique=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    role = db.Column(db.String(20), nullable=False)
    designation = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    validity_date = db.Column(db.Date, nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey('colleges.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if admin user already exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            # Create default admin user
            admin = User(
                user_id='ADMIN001',
                username='admin',
                name='System Administrator',
                email='admin@library.com',
                role='admin',
                designation='staff',
                dob=date(1990, 1, 1),
                validity_date=date(2030, 12, 31),
                is_active=True
            )
            admin.password_hash = generate_password_hash('admin123')
            db.session.add(admin)
            
            # Create a sample college
            college = College(
                name='Sample University',
                code='SU'
            )
            db.session.add(college)
            db.session.flush()  # To get the college ID
            
            # Create a sample department
            department = Department(
                name='Computer Science',
                code='CS',
                college_id=college.id
            )
            db.session.add(department)
            
            # Create a sample librarian
            librarian = User(
                user_id='LIB001',
                username='librarian',
                name='John Librarian',
                email='librarian@library.com',
                role='librarian',
                designation='staff',
                dob=date(1985, 5, 15),
                validity_date=date(2030, 12, 31),
                college_id=college.id,
                department_id=department.id,
                is_active=True
            )
            librarian.password_hash = generate_password_hash('lib123')
            db.session.add(librarian)

            # Create a sample student
            student = User(
                user_id='STU001',
                username='student001',
                name='Jane Student',
                email='student@library.com',
                role='student',
                designation='student',
                dob=date(2000, 3, 10),
                validity_date=date.today() + timedelta(days=365),
                college_id=college.id,
                department_id=department.id,
                is_active=True
            )
            student.password_hash = generate_password_hash('stu123')
            db.session.add(student)
            
            db.session.commit()
            
            print("Database initialized successfully!")
            print("Default users created:")
            print("Admin - Username: admin, Password: admin123")
            print("Librarian - Username: librarian, Password: lib123")
            print("Student - Username: student001, Password: stu123")
        else:
            print("Database already initialized!")

if __name__ == '__main__':
    init_database()
