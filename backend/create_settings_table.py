#!/usr/bin/env python3
"""
Database migration script to create the settings table and populate it with default values.
This script should be run once to add the settings functionality to the existing database.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Settings

def create_settings_table():
    """Create the settings table and populate with default values"""
    
    with app.app_context():
        try:
            # Create the settings table
            print("Creating settings table...")
            db.create_all()
            print("Settings table created successfully!")
            
            # Initialize default settings
            print("Initializing default settings...")
            Settings.initialize_default_settings()
            print("Default settings initialized successfully!")
            
            # Verify settings were created
            settings = Settings.get_all_settings()
            print(f"Created {len(settings)} default settings:")
            for key, value in settings.items():
                print(f"  {key}: {value}")
                
        except Exception as e:
            print(f"Error creating settings table: {str(e)}")
            return False
            
    return True

if __name__ == "__main__":
    print("Starting database migration for settings table...")
    
    if create_settings_table():
        print("\nMigration completed successfully!")
        print("The settings table has been created and populated with default values.")
        print("You can now use the admin settings panel to modify these values.")
    else:
        print("\nMigration failed!")
        sys.exit(1)
