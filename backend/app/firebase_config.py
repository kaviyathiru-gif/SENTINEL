import firebase_admin
from firebase_admin import credentials, db
import os

# Initialize Firebase Admin SDK
# Make sure your serviceAccountKey.json is in the same folder or pass the exact path
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://YOUR_PROJECT_ID.firebaseio.com'  # Replace with your Firebase DB URL
    })

def push_metric_to_firebase(domain_url: str, payload: dict):
    """
    Pushes the metrics payload under the target domain's entry in Firebase Realtime Database.
    """
    # Sanitize URL for Firebase key (replace dots with underscores or encode)
    clean_domain = domain_url.replace("https://", "").replace("http://", "").replace(".", "_")
    
    # Reference node: /metrics/{clean_domain}
    ref = db.reference(f'metrics/{clean_domain}')
    
    # Push data as a time-series entry
    ref.push(payload)
