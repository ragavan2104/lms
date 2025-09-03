#!/usr/bin/env python3
"""
Automatic Fine Generation System

This script will:
1. Check all issued books that are overdue
2. Automatically generate Fine records for overdue books
3. Update the circulation status to 'overdue'
4. Ensure fines are available in payment management
"""

import os
import sys
import sqlite3
from datetime import datetime, date

def generate_overdue_fines():
    """Generate fines for all overdue books that don't already have fines"""
    
    # Database file path
    db_file = os.path.join('instance', 'library.db')
    
    if not os.path.exists(db_file):
        print("❌ Database file not found at instance/library.db")
        return False
    
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        print("🔍 Checking for overdue books without fines...")
        
        # Get all issued books that are overdue
        today = date.today().isoformat()
        
        # First, get overdue circulations
        cursor.execute("""
            SELECT c.id, c.user_id, c.book_id, c.due_date, u.name, b.title, b.access_no
            FROM circulations c
            JOIN users u ON c.user_id = u.id
            JOIN books b ON c.book_id = b.id
            WHERE c.status = 'issued' 
            AND DATE(c.due_date) < ?
        """, (today,))
        
        overdue_circulations = cursor.fetchall()
        
        if not overdue_circulations:
            print("✅ No overdue books found!")
            return True
        
        print(f"📋 Found {len(overdue_circulations)} overdue books")
        
        daily_fine_rate = 1.0  # ₹1 per day
        created_fines = 0
        updated_status = 0
        
        for circulation_id, user_id, book_id, due_date_str, user_name, book_title, access_no in overdue_circulations:
            try:
                # Parse due date - handle different formats
                try:
                    # Try with microseconds
                    due_date = datetime.strptime(due_date_str, '%Y-%m-%d %H:%M:%S.%f').date()
                except ValueError:
                    try:
                        # Try without microseconds
                        due_date = datetime.strptime(due_date_str, '%Y-%m-%d %H:%M:%S').date()
                    except ValueError:
                        # Try date only
                        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                
                days_overdue = (date.today() - due_date).days
                
                if days_overdue <= 0:
                    continue
                
                # Check if fine already exists for this circulation
                cursor.execute("""
                    SELECT id FROM fines 
                    WHERE circulation_id = ? AND status = 'pending'
                """, (circulation_id,))
                
                existing_fine = cursor.fetchone()
                
                if not existing_fine:
                    # Calculate fine amount
                    fine_amount = days_overdue * daily_fine_rate
                    
                    # Create fine record
                    cursor.execute("""
                        INSERT INTO fines (user_id, circulation_id, amount, reason, status, created_date, created_by)
                        VALUES (?, ?, ?, ?, 'pending', ?, 1)
                    """, (
                        user_id,
                        circulation_id,
                        fine_amount,
                        f'Overdue fine for "{book_title}" ({access_no}) - {days_overdue} days late',
                        datetime.now().isoformat()
                    ))
                    
                    created_fines += 1
                    print(f"💰 Created fine: ₹{fine_amount:.2f} for {user_name} - {book_title} ({days_overdue} days)")
                
                # Update circulation status to overdue
                cursor.execute("""
                    UPDATE circulations 
                    SET status = 'overdue'
                    WHERE id = ? AND status = 'issued'
                """, (circulation_id,))
                
                if cursor.rowcount > 0:
                    updated_status += 1
                
            except Exception as e:
                print(f"❌ Error processing circulation {circulation_id}: {e}")
                continue
        
        # Commit changes
        conn.commit()
        
        print(f"\n✅ Automatic fine generation completed!")
        print(f"📊 Summary:")
        print(f"   • Overdue books found: {len(overdue_circulations)}")
        print(f"   • New fines created: {created_fines}")
        print(f"   • Status updated to 'overdue': {updated_status}")
        
        if created_fines > 0:
            print(f"\n💡 These fines are now available in Payment Management")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        conn.close()

def main():
    print("🚀 Starting automatic fine generation...")
    success = generate_overdue_fines()
    
    if success:
        print("\n🎉 Fine generation completed successfully!")
        print("💡 You can now view these fines in the Payment Management section")
    else:
        print("\n💥 Fine generation failed! Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
