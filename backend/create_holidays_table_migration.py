#!/usr/bin/env python3
"""
Migration script to create the holidays table and populate it with sample data.
This script will:
1. Create the holidays table
2. Add sample holidays including national holidays and common library closure days
3. Verify the migration was successful
"""

import sqlite3
import os
from datetime import datetime, date

def create_holidays_table(cursor):
    """Create the holidays table"""
    print("🔧 Creating holidays table...")
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS holidays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            description TEXT,
            is_recurring BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    print("✅ Holidays table created successfully")

def insert_sample_holidays(cursor):
    """Insert sample holidays"""
    print("📦 Inserting sample holidays...")
    
    # Sample holidays for India (recurring)
    sample_holidays = [
        # National Holidays (recurring)
        ('Republic Day', '2024-01-26', 'India Republic Day', True),
        ('Independence Day', '2024-08-15', 'India Independence Day', True),
        ('Gandhi Jayanti', '2024-10-02', 'Mahatma Gandhi Birthday', True),
        
        # Religious Holidays (recurring - approximate dates)
        ('Diwali', '2024-11-01', 'Festival of Lights', True),
        ('Holi', '2024-03-25', 'Festival of Colors', True),
        ('Dussehra', '2024-10-12', 'Victory of Good over Evil', True),
        ('Eid ul-Fitr', '2024-04-10', 'End of Ramadan', True),
        ('Eid ul-Adha', '2024-06-17', 'Festival of Sacrifice', True),
        ('Christmas', '2024-12-25', 'Christmas Day', True),
        ('Good Friday', '2024-03-29', 'Good Friday', True),
        
        # Common Library Closure Days
        ('New Year\'s Day', '2024-01-01', 'New Year Holiday', True),
        ('Library Annual Maintenance', '2024-06-15', 'Annual library maintenance and inventory', False),
        ('Summer Break Start', '2024-05-01', 'Summer vacation begins', False),
        ('Summer Break End', '2024-06-30', 'Summer vacation ends', False),
        
        # Academic Calendar Events
        ('Examination Period Start', '2024-04-01', 'Final examinations begin - limited library hours', False),
        ('Examination Period End', '2024-04-30', 'Final examinations end', False),
        
        # Additional Regional Holidays
        ('Guru Nanak Jayanti', '2024-11-15', 'Guru Nanak Birthday', True),
        ('Karva Chauth', '2024-11-01', 'Karva Chauth Festival', True),
        ('Raksha Bandhan', '2024-08-19', 'Brother-Sister Festival', True),
        ('Janmashtami', '2024-08-26', 'Krishna Birthday', True),
    ]
    
    for name, holiday_date, description, is_recurring in sample_holidays:
        cursor.execute('''
            INSERT INTO holidays (name, date, description, is_recurring)
            VALUES (?, ?, ?, ?)
        ''', (name, holiday_date, description, is_recurring))
    
    print(f"✅ Inserted {len(sample_holidays)} sample holidays")

def verify_migration(cursor):
    """Verify the migration was successful"""
    print("\n🔍 Verifying migration...")
    
    # Check table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='holidays'")
    table_exists = cursor.fetchone()
    
    if not table_exists:
        print("❌ Migration failed: holidays table not found")
        return False
    
    # Check table structure
    cursor.execute('PRAGMA table_info(holidays)')
    columns = cursor.fetchall()
    expected_columns = ['id', 'name', 'date', 'description', 'is_recurring', 'created_at']
    actual_columns = [col[1] for col in columns]
    
    missing_columns = set(expected_columns) - set(actual_columns)
    if missing_columns:
        print(f"❌ Migration failed: missing columns {missing_columns}")
        return False
    
    # Check data
    cursor.execute('SELECT COUNT(*) FROM holidays')
    holiday_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM holidays WHERE is_recurring = 1')
    recurring_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM holidays WHERE is_recurring = 0')
    non_recurring_count = cursor.fetchone()[0]
    
    print(f"✅ Migration verified:")
    print(f"  - Table structure: ✓")
    print(f"  - Total holidays: {holiday_count}")
    print(f"  - Recurring holidays: {recurring_count}")
    print(f"  - Non-recurring holidays: {non_recurring_count}")
    
    # Show sample holidays
    cursor.execute('SELECT name, date, is_recurring FROM holidays ORDER BY date LIMIT 5')
    sample_holidays = cursor.fetchall()
    print(f"  - Sample holidays:")
    for name, holiday_date, is_recurring in sample_holidays:
        recurring_text = "(recurring)" if is_recurring else "(one-time)"
        print(f"    * {name} - {holiday_date} {recurring_text}")
    
    return True

def create_holidays_table_migration():
    """Main function to create holidays table and populate with sample data"""
    db_path = 'instance/library.db'
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create holidays table
        create_holidays_table(cursor)
        
        # Insert sample holidays
        insert_sample_holidays(cursor)
        
        # Verify migration
        if verify_migration(cursor):
            conn.commit()
            print("\n✅ Migration completed successfully!")
            print("The holidays table has been created and populated with sample data.")
            print("You can now manage holidays through the admin dashboard.")
            return True
        else:
            conn.rollback()
            print("\n❌ Migration verification failed. Rolling back...")
            return False
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    print('🚀 Starting holidays table creation migration...')
    success = create_holidays_table_migration()
    
    if success:
        print('\n🎉 Migration completed successfully!')
        print('The holidays table is now ready for use.')
        print('Next steps:')
        print('1. Restart the backend server to load the new model')
        print('2. Access holiday management through the admin dashboard')
        print('3. Add or modify holidays as needed for your library')
    else:
        print('\n💥 Migration failed!')
        print('Please check the error messages above and try again.')
