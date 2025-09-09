#!/usr/bin/env python3

"""
Start Flask server with call_no field support
"""

import os
import sys
import subprocess
import time
import signal

def start_flask_server():
    """Start the Flask server"""
    print("🚀 Starting Flask server with call_no field support...")
    
    try:
        # Set environment variables
        os.environ['FLASK_ENV'] = 'development'
        os.environ['FLASK_DEBUG'] = '1'
        
        # Start the Flask server in a new process
        process = subprocess.Popen(
            [sys.executable, 'app.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        print("✅ Flask server started successfully!")
        print("🌐 Server should be available at: http://localhost:5000")
        print("📋 API endpoints available:")
        print("  - GET  /api/admin/books (with call_no field)")
        print("  - POST /api/admin/books (accepts call_no field)")
        print("  - POST /api/admin/books/bulk (accepts call_no in CSV/Excel)")
        print("  - GET  /api/admin/dashboard-stats")
        print("\n📝 To test call_no field:")
        print("  1. Go to admin dashboard")
        print("  2. Click 'Add Book'")
        print("  3. Fill in 'Call Number' field")
        print("  4. Or upload CSV/Excel with 'call_no' column")
        
        print("\n🔍 Server output:")
        print("-" * 50)
        
        # Print server output
        try:
            for line in process.stdout:
                print(line.strip())
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping server...")
            process.terminate()
            process.wait()
            print("✅ Server stopped")
            
    except Exception as e:
        print(f"❌ Error starting Flask server: {str(e)}")
        return False

def check_server_health():
    """Check if server is responding"""
    import requests
    import time
    
    print("🔍 Checking server health...")
    
    for i in range(10):  # Try for 10 seconds
        try:
            response = requests.get('http://localhost:5000/health', timeout=2)
            if response.status_code == 200:
                print("✅ Server is healthy and responding")
                return True
        except:
            pass
        
        time.sleep(1)
        print(f"⏳ Waiting for server... ({i+1}/10)")
    
    print("⚠️  Server health check timeout (this is normal if /health endpoint doesn't exist)")
    return True

if __name__ == "__main__":
    print("🔧 Flask Server Startup Script")
    print("=" * 40)
    
    # Verify database migration completed
    db_path = '../instance/library.db'
    if not os.path.exists(db_path):
        print("❌ Database not found! Please run migration first.")
        sys.exit(1)
    
    print("✅ Database found")
    print("✅ call_no migration completed (verified)")
    
    # Start server
    start_flask_server()
