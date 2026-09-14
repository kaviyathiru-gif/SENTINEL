import firebase_admin
from firebase_admin import credentials, db
import os

# Initialize Firebase Admin SDK
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': os.getenv("FIREBASE_DATABASE_URL", "https://YOUR_PROJECT_ID.firebaseio.com")
    })

def push_metric_to_firebase(domain_url: str, payload: dict) -> None:
    """Pushes metric/vision telemetry payload under the target domain node in Firebase."""
    clean_domain = domain_url.replace("https://", "").replace("http://", "").replace("/", "_").replace(".", "_")
    ref = db.reference(f'metrics/{clean_domain}')
    ref.push(payload)
