#!/usr/bin/env python3

import sqlite3
import os

# Connect to database
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'library.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🔍 Checking thesis table structure...")

# Check table structure
cursor.execute("PRAGMA table_info(thesis)")
columns = cursor.fetchall()
print("\n📋 Table columns:")
for col in columns:
    print(f"  - {col[1]} ({col[2]}) {'NOT NULL' if col[3] else 'NULL'} {'DEFAULT: ' + str(col[4]) if col[4] else ''}")

# Check existing data
print("\n📊 Existing thesis records:")
cursor.execute("SELECT id, title, thesis_number, author, project_guide FROM thesis LIMIT 5")
records = cursor.fetchall()

if records:
    for record in records:
        print(f"  ID: {record[0]}")
        print(f"  Title: {record[1]}")
        print(f"  Thesis Number: {record[2]}")
        print(f"  Author: {record[3]}")
        print(f"  Project Guide: {record[4]}")
        print("  ---")
else:
    print("  No thesis records found")

# Check total count
cursor.execute("SELECT COUNT(*) FROM thesis")
count = cursor.fetchone()[0]
print(f"\n📈 Total thesis records: {count}")

conn.close()
print("\n✅ Done checking thesis data")
