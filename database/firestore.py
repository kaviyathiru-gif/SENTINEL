from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def log_attack_report(site_url: str, attack_type: str, severity: str, actions_taken: list):
    """
    Generates a post-attack report detailing what happened and what the Sentinel app did.
    """
    report_data = {
        "site_url": site_url,
        "attack_type": attack_type,
        "severity": severity,
        "actions_taken": actions_taken,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    
    doc_ref = db.collection("incident_reports").add(report_data)
    return doc_ref[1].id

def fetch_aggregated_logs(period: str = "day"):
    """
    Fetches threat logs compared across Day, Week, Month, or Year intervals.
    Used for feed processing into Power BI data source pipelines.
    """
    now = datetime.utcnow()
    
    if period == "day":
        start_time = now - timedelta(days=1)
    elif period == "week":
        start_time = now - timedelta(weeks=1)
    elif period == "month":
        start_time = now - timedelta(days=30)
    elif period == "year":
        start_time = now - timedelta(days=365)
    else:
        start_time = now - timedelta(days=1)

    query = db.collection("threat_logs").where("timestamp", ">=", start_time)
    results = query.stream()

    aggregated_data = []
    for doc in results:
        data = doc.to_dict()
        aggregated_data.append(data)

    return aggregated_data
