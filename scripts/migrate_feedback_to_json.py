# Script to migrate old feedback data to JSON format for detailed feedback display

import os
import psycopg2
import json

# Update these with your actual database credentials
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'your_db_name')
DB_USER = os.getenv('DB_USER', 'your_db_user')
DB_PASS = os.getenv('DB_PASS', 'your_db_password')

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS
)
cur = conn.cursor()

# Select all user_answers rows where feedback is not valid JSON (i.e., old format)
cur.execute("SELECT id, feedback FROM user_answers")
rows = cur.fetchall()

for row in rows:
    id, feedback = row
    try:
        # Try to parse as JSON
        parsed = json.loads(feedback)
        # If it's already a dict with required keys, skip
        if all(k in parsed for k in ["hook", "strength", "focus_area", "drill"]):
            continue
    except Exception:
        # Not valid JSON, so wrap in new format
        new_feedback = json.dumps({
            "hook": "",
            "strength": "",
            "focus_area": "",
            "drill": "",
            "feedback": feedback or ""
        })
        cur.execute("UPDATE user_answers SET feedback = %s WHERE id = %s", (new_feedback, id))
        print(f"Updated feedback for id {id}")

conn.commit()
cur.close()
conn.close()
print("Migration complete.")
