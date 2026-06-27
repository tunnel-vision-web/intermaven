import os
import sys

# Add backend to python path
backend_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_path)

try:
    from config import db
    if db is None:
        print("Database connection is None!")
        sys.exit(1)
        
    # Search for diagnostic users
    diag_users = list(db.users.find({"email": {"$regex": "^test_diag_"}}))
    print("Found {} diagnostic user(s):".format(len(diag_users)))
    for u in diag_users:
        print("  - Email: {}, Created At: {}".format(u.get("email"), u.get("created_at")))
        
except Exception as e:
    print("Error querying database: {}: {}".format(type(e).__name__, e))
