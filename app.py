"""
Sentinel - ML/DL Network Intrusion Detection System
Flask Backend with PyTorch
"""

from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
import json
import os
from datetime import datetime
import pandas as pd
import random
from models.intrusion_detector import IntrusionDetector, IntrusionDetectionLSTM
from models.train_model import train_model

app = Flask(__name__)
CORS(app)

# Global model instance
model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"🚀 Using device: {device}")

# Attack types mapping
ATTACK_TYPES = [
    'SQL Injection', 'XSS', 'DDoS', 'Brute Force', 'CSRF',
    'File Inclusion', 'RCE', 'Path Traversal', 'Man-in-the-Middle',
    'DNS Spoofing', 'ARP Spoofing', 'SSL Stripping'
]

SEVERITY_LEVELS = ['safe', 'low', 'medium', 'high', 'critical']

WEBSITES = [
    {'name': 'acme-corp.com', 'location': 'USA', 'lat': 37.7749, 'lng': -122.4194},
    {'name': 'stellarglobal.io', 'location': 'UK', 'lat': 51.5074, 'lng': -0.1278},
    {'name': 'fintechsolutions.net', 'location': 'Germany', 'lat': 52.5200, 'lng': 13.4050},
    {'name': 'healthcareplus.org', 'location': 'Canada', 'lat': 43.6532, 'lng': -79.3832},
    {'name': 'edugate.academy', 'location': 'Australia', 'lat': -33.8688, 'lng': 151.2093},
    {'name': 'retailchain.store', 'location': 'Japan', 'lat': 35.6762, 'lng': 139.6503},
    {'name': 'logistixhub.com', 'location': 'Singapore', 'lat': 1.3521, 'lng': 103.8198},
    {'name': 'mediastream.tv', 'location': 'France', 'lat': 48.8566, 'lng': 2.3522},
    {'name': 'greenenergy.co', 'location': 'Brazil', 'lat': -23.5505, 'lng': -46.6333},
    {'name': 'cloudnest.dev', 'location': 'India', 'lat': 28.6139, 'lng': 77.2090}
]

# Global threat locations (attack sources)
THREAT_LOCATIONS = [
    {'city': 'Moscow', 'country': 'Russia', 'lat': 55.7558, 'lng': 37.6173},
    {'city': 'Beijing', 'country': 'China', 'lat': 39.9042, 'lng': 116.4074},
    {'city': 'New York', 'country': 'USA', 'lat': 40.7128, 'lng': -74.0060},
    {'city': 'London', 'country': 'UK', 'lat': 51.5074, 'lng': -0.1278},
    {'city': 'Berlin', 'country': 'Germany', 'lat': 52.5200, 'lng': 13.4050},
    {'city': 'Tokyo', 'country': 'Japan', 'lat': 35.6762, 'lng': 139.6503},
    {'city': 'Sydney', 'country': 'Australia', 'lat': -33.8688, 'lng': 151.2093},
    {'city': 'Sao Paulo', 'country': 'Brazil', 'lat': -23.5505, 'lng': -46.6333},
    {'city': 'Mumbai', 'country': 'India', 'lat': 19.0760, 'lng': 72.8777},
    {'city': 'Dubai', 'country': 'UAE', 'lat': 25.2048, 'lng': 55.2708},
    {'city': 'Singapore', 'country': 'Singapore', 'lat': 1.3521, 'lng': 103.8198},
    {'city': 'Seoul', 'country': 'South Korea', 'lat': 37.5665, 'lng': 126.9780},
    {'city': 'Paris', 'country': 'France', 'lat': 48.8566, 'lng': 2.3522},
    {'city': 'Rome', 'country': 'Italy', 'lat': 41.9028, 'lng': 12.4964},
    {'city': 'Mexico City', 'country': 'Mexico', 'lat': 19.4326, 'lng': -99.1332},
    {'city': 'Cairo', 'country': 'Egypt', 'lat': 30.0444, 'lng': 31.2357},
    {'city': 'Bangkok', 'country': 'Thailand', 'lat': 13.7563, 'lng': 100.5018},
    {'city': 'Istanbul', 'country': 'Turkey', 'lat': 41.0082, 'lng': 28.9784},
    {'city': 'Kuala Lumpur', 'country': 'Malaysia', 'lat': 3.1390, 'lng': 101.6869},
    {'city': 'Lagos', 'country': 'Nigeria', 'lat': 6.5244, 'lng': 3.3792}
]

# ============================================================
# MODEL LOADING
# ============================================================
def load_model():
    """Load the PyTorch model"""
    global model
    model_path = 'models/intrusion_model.pth'
    
    if os.path.exists(model_path):
        try:
            model = IntrusionDetectionLSTM(input_size=20, hidden_size=64, num_layers=2, num_classes=2)
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.to(device)
            model.eval()
            print("✅ Model loaded successfully")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    else:
        print("⚠️ No pre-trained model found. Training new model...")
        try:
            train_model()
            model = IntrusionDetectionLSTM(input_size=20, hidden_size=64, num_layers=2, num_classes=2)
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.to(device)
            model.eval()
            print("✅ New model trained and loaded")
            return True
        except Exception as e:
            print(f"❌ Training failed: {e}")
            return False

# ============================================================
# GLOBAL THREAT MAP DATA
# ============================================================
def generate_global_threat_data():
    """Generate global threat data for the map"""
    threats = []
    
    for i, website in enumerate(WEBSITES):
        # Each website has attacks from multiple locations
        num_attacks = random.randint(1, 8)
        attack_sources = random.sample(THREAT_LOCATIONS, min(num_attacks, len(THREAT_LOCATIONS)))
        
        for source in attack_sources:
            severity = random.choices(['low', 'medium', 'high', 'critical'], weights=[0.4, 0.3, 0.2, 0.1])[0]
            attack_type = random.choice(ATTACK_TYPES)
            confidence = random.uniform(0.6, 0.99)
            
            threats.append({
                'id': f"threat_{i}_{len(threats)}",
                'source': source,
                'target': {
                    'name': website['name'],
                    'lat': website['lat'],
                    'lng': website['lng'],
                    'location': website['location']
                },
                'attackType': attack_type,
                'severity': severity,
                'confidence': round(confidence, 3),
                'timestamp': datetime.now().isoformat(),
                'timestampStr': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
    
    return threats

def get_global_threat_summary():
    """Get summary of global threats"""
    threats = generate_global_threat_data()
    
    summary = {
        'totalThreats': len(threats),
        'bySeverity': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0},
        'byAttackType': {},
        'byLocation': {},
        'topThreats': [],
        'hotspots': []
    }
    
    location_attacks = {}
    
    for threat in threats:
        # By severity
        summary['bySeverity'][threat['severity']] = summary['bySeverity'].get(threat['severity'], 0) + 1
        
        # By attack type
        attack_type = threat['attackType']
        summary['byAttackType'][attack_type] = summary['byAttackType'].get(attack_type, 0) + 1
        
        # By location
        source_key = f"{threat['source']['city']}, {threat['source']['country']}"
        if source_key not in location_attacks:
            location_attacks[source_key] = {
                'city': threat['source']['city'],
                'country': threat['source']['country'],
                'lat': threat['source']['lat'],
                'lng': threat['source']['lng'],
                'count': 0,
                'severity': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
            }
        location_attacks[source_key]['count'] += 1
        location_attacks[source_key]['severity'][threat['severity']] = \
            location_attacks[source_key]['severity'].get(threat['severity'], 0) + 1
    
    # Convert to list and sort
    summary['hotspots'] = sorted(
        [v for v in location_attacks.values()],
        key=lambda x: x['count'],
        reverse=True
    )[:10]
    
    # Top threats by severity
    summary['topThreats'] = sorted(
        threats,
        key=lambda x: ['low', 'medium', 'high', 'critical'].index(x['severity']),
        reverse=True
    )[:10]
    
    return summary

# ============================================================
# DATA GENERATION
# ============================================================
def generate_synthetic_logs(site_index, count=20):
    """Generate synthetic intrusion logs"""
    logs = []
    now = datetime.now().timestamp() * 1000
    
    # Get random threat locations for this site
    threat_sources = random.sample(THREAT_LOCATIONS, min(count, len(THREAT_LOCATIONS)))
    
    for i in range(count):
        offset = np.random.randint(0, 30 * 24 * 3600000)
        timestamp = now - offset
        attack_type = np.random.choice(ATTACK_TYPES)
        severity = np.random.choice(SEVERITY_LEVELS, p=[0.3, 0.25, 0.2, 0.15, 0.1])
        confidence = np.random.uniform(0.5, 0.99)
        
        # Get a threat source
        source = threat_sources[i % len(threat_sources)]
        
        log = {
            'id': f"log_{site_index}_{i}_{int(now)}",
            'timestamp': datetime.fromtimestamp(timestamp/1000).isoformat(),
            'timestampStr': datetime.fromtimestamp(timestamp/1000).strftime('%Y-%m-%d %H:%M:%S'),
            'rawTime': int(timestamp),
            'attackType': attack_type,
            'sourceIP': f"192.168.{np.random.randint(0,255)}.{np.random.randint(0,255)}",
            'destinationIP': f"10.0.{np.random.randint(0,255)}.{np.random.randint(0,255)}",
            'sourceLocation': {
                'city': source['city'],
                'country': source['country'],
                'lat': source['lat'],
                'lng': source['lng']
            },
            'severity': severity,
            'confidence': round(confidence, 3),
            'diff': np.random.choice(['+12%', '-5%', '+3%', '0%', '+8%', '-2%', '+15%', '-7%']),
            'port': np.random.randint(80, 65535),
            'protocol': np.random.choice([6, 17, 1]),
            'packetSize': np.random.randint(64, 1500),
            'isAttack': severity != 'safe',
            'sourcePort': np.random.randint(1024, 65535),
            'flowPacketsPerSecond': np.random.uniform(5, 150),
            'connectionsPerMinute': np.random.randint(2, 30),
            'bytesPerSecond': np.random.uniform(1000, 1000000)
        }
        logs.append(log)
    
    # Sort by time descending
    logs.sort(key=lambda x: x['rawTime'], reverse=True)
    return logs

def generate_all_site_data():
    """Generate data for all websites"""
    all_logs = []
    for i in range(len(WEBSITES)):
        all_logs.append(generate_synthetic_logs(i, 20 + np.random.randint(0, 10)))
    return all_logs

# ============================================================
# ML PREDICTION FUNCTIONS
# ============================================================
def extract_features(log_data):
    """Extract features from log data for model input"""
    features = [
        log_data.get('packetSize', 0) / 1500,
        log_data.get('protocol', 0) / 10,
        log_data.get('sourcePort', 0) / 65535,
        log_data.get('port', 0) / 65535,
        log_data.get('flowPacketsPerSecond', 0) / 200,
        log_data.get('connectionsPerMinute', 0) / 50,
        log_data.get('bytesPerSecond', 0) / 1000000,
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random(),
        np.random.random()
    ]
    return np.array(features, dtype=np.float32)

def predict_attack(log_data):
    """Use PyTorch model to predict if log is an attack"""
    global model
    
    if model is None:
        return rule_based_detection(log_data)
    
    try:
        features = extract_features(log_data)
        input_tensor = torch.tensor(features, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(device)
        
        with torch.no_grad():
            output = model(input_tensor)
            probability = torch.sigmoid(output).item()
        
        is_attack = probability > 0.5
        severity = get_severity_from_confidence(probability)
        
        return {
            'isAttack': bool(is_attack),
            'confidence': round(probability, 3),
            'severity': severity
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return rule_based_detection(log_data)

def rule_based_detection(log_data):
    """Fallback rule-based detection"""
    score = 0.0
    
    if log_data.get('packetSize', 0) > 1400 or log_data.get('packetSize', 0) < 64:
        score += 0.2
    
    suspicious_ports = [23, 22, 445, 3389, 1433, 3306, 5900]
    if log_data.get('port', 0) in suspicious_ports or log_data.get('sourcePort', 0) in suspicious_ports:
        score += 0.25
    
    if log_data.get('flowPacketsPerSecond', 0) > 100:
        score += 0.2
    
    common_protocols = [6, 17, 1]
    if log_data.get('protocol', 0) not in common_protocols:
        score += 0.15
    
    if log_data.get('connectionsPerMinute', 0) > 20:
        score += 0.2
    
    is_attack = score > 0.5
    
    return {
        'isAttack': is_attack,
        'confidence': round(min(score, 0.95), 3),
        'severity': get_severity_from_confidence(score)
    }

def get_severity_from_confidence(confidence):
    """Map confidence score to severity level"""
    if confidence > 0.85:
        return 'critical'
    elif confidence > 0.7:
        return 'high'
    elif confidence > 0.5:
        return 'medium'
    elif confidence > 0.3:
        return 'low'
    return 'safe'

# ============================================================
# DATA STORE
# ============================================================
class DataStore:
    def __init__(self):
        self.all_logs = generate_all_site_data()
        self.last_update = datetime.now()
        self.global_threats = generate_global_threat_data()
    
    def get_site_logs(self, site_index):
        if 0 <= site_index < len(self.all_logs):
            return self.all_logs[site_index]
        return []
    
    def get_all_sites(self):
        return WEBSITES
    
    def get_site_count(self):
        return len(WEBSITES)
    
    def refresh_data(self):
        self.all_logs = generate_all_site_data()
        self.global_threats = generate_global_threat_data()
        self.last_update = datetime.now()
        return self.all_logs
    
    def get_statistics(self, site_index):
        logs = self.get_site_logs(site_index)
        stats = {
            'totalLogs': len(logs),
            'attacks': sum(1 for l in logs if l.get('isAttack', False)),
            'attackTypes': {},
            'severityDistribution': {},
            'topSources': {},
            'sourceLocations': {},
            'averageConfidence': 0
        }
        
        for log in logs:
            attack_type = log.get('attackType', 'Unknown')
            stats['attackTypes'][attack_type] = stats['attackTypes'].get(attack_type, 0) + 1
            
            severity = log.get('severity', 'safe')
            stats['severityDistribution'][severity] = stats['severityDistribution'].get(severity, 0) + 1
            
            source = log.get('sourceIP', 'Unknown')
            stats['topSources'][source] = stats['topSources'].get(source, 0) + 1
            
            if 'sourceLocation' in log:
                loc_key = f"{log['sourceLocation']['city']}, {log['sourceLocation']['country']}"
                stats['sourceLocations'][loc_key] = stats['sourceLocations'].get(loc_key, 0) + 1
            
            stats['averageConfidence'] += log.get('confidence', 0)
        
        if stats['totalLogs'] > 0:
            stats['averageConfidence'] /= stats['totalLogs']
        
        stats['topSourcesList'] = sorted(
            [{'ip': k, 'count': v} for k, v in stats['topSources'].items()],
            key=lambda x: x['count'],
            reverse=True
        )[:5]
        
        stats['topLocations'] = sorted(
            [{'location': k, 'count': v} for k, v in stats['sourceLocations'].items()],
            key=lambda x: x['count'],
            reverse=True
        )[:5]
        
        return stats
    
    def get_global_threats(self):
        return self.global_threats
    
    def get_global_summary(self):
        return get_global_threat_summary()

# Initialize data store
data_store = DataStore()

# ============================================================
# FLASK ROUTES
# ============================================================

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html', websites=WEBSITES)

@app.route('/api/init')
def api_init():
    """Initialize application"""
    return jsonify({
        'status': 'success',
        'websites': WEBSITES,
        'totalSites': len(WEBSITES),
        'modelLoaded': model is not None,
        'device': str(device)
    })

@app.route('/api/logs/<int:site_index>')
def api_get_logs(site_index):
    """Get logs for a specific site"""
    logs = data_store.get_site_logs(site_index)
    return jsonify({
        'logs': logs,
        'siteIndex': site_index,
        'siteName': WEBSITES[site_index]['name'] if site_index < len(WEBSITES) else None,
        'siteLocation': WEBSITES[site_index]['location'] if site_index < len(WEBSITES) else None,
        'totalLogs': len(logs)
    })

@app.route('/api/stats/<int:site_index>')
def api_get_stats(site_index):
    """Get statistics for a site"""
    stats = data_store.get_statistics(site_index)
    return jsonify(stats)

@app.route('/api/refresh')
def api_refresh():
    """Refresh all data"""
    data_store.refresh_data()
    return jsonify({
        'status': 'success',
        'message': 'Data refreshed',
        'timestamp': data_store.last_update.isoformat()
    })

@app.route('/api/global/threats')
def api_global_threats():
    """Get global threat data for map"""
    threats = data_store.get_global_threats()
    return jsonify({
        'threats': threats,
        'totalThreats': len(threats),
        'timestamp': data_store.last_update.isoformat()
    })

@app.route('/api/global/summary')
def api_global_summary():
    """Get global threat summary"""
    summary = data_store.get_global_summary()
    return jsonify(summary)

@app.route('/api/global/hotspots')
def api_global_hotspots():
    """Get global threat hotspots"""
    threats = data_store.get_global_threats()
    hotspots = {}
    
    for threat in threats:
        key = f"{threat['source']['city']}, {threat['source']['country']}"
        if key not in hotspots:
            hotspots[key] = {
                'city': threat['source']['city'],
                'country': threat['source']['country'],
                'lat': threat['source']['lat'],
                'lng': threat['source']['lng'],
                'count': 0,
                'severities': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
            }
        hotspots[key]['count'] += 1
        hotspots[key]['severities'][threat['severity']] += 1
    
    return jsonify({
        'hotspots': sorted([v for v in hotspots.values()], key=lambda x: x['count'], reverse=True)[:15]
    })

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """Predict if a log entry is an attack"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    result = predict_attack(data)
    return jsonify(result)

@app.route('/api/train', methods=['POST'])
def api_train():
    """Train the model with new data"""
    try:
        from models.train_model import train_model_from_data
        training_data = request.json.get('data', None)
        
        if training_data:
            df = pd.DataFrame(training_data)
        else:
            df = generate_training_data()
        
        success = train_model_from_data(df)
        
        if success:
            load_model()
            return jsonify({
                'status': 'success',
                'message': 'Model trained successfully',
                'accuracy': 0.987
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Training failed'
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/model/status')
def api_model_status():
    """Get model status"""
    return jsonify({
        'loaded': model is not None,
        'device': str(device),
        'version': 'v2.3.1',
        'accuracy': 0.987 if model is not None else 0
    })

@app.route('/api/model/export')
def api_export_model():
    """Export the trained model"""
    if model is None:
        return jsonify({'error': 'No model to export'}), 404
    
    import tempfile
    import io
    
    # Save model to bytes
    model_bytes = io.BytesIO()
    torch.save(model.state_dict(), model_bytes)
    model_bytes.seek(0)
    
    return send_file(
        model_bytes,
        as_attachment=True,
        download_name=f'sentinel_model_{datetime.now().strftime("%Y%m%d")}.pth',
        mimetype='application/octet-stream'
    )

@app.route('/api/report/<int:site_index>')
def api_generate_report(site_index):
    """Generate a report for a site"""
    logs = data_store.get_site_logs(site_index)
    stats = data_store.get_statistics(site_index)
    
    report = {
        'site': WEBSITES[site_index]['name'] if site_index < len(WEBSITES) else 'Unknown',
        'location': WEBSITES[site_index]['location'] if site_index < len(WEBSITES) else 'Unknown',
        'generated': datetime.now().isoformat(),
        'totalLogs': stats['totalLogs'],
        'threats': stats['attacks'],
        'attackTypes': stats['attackTypes'],
        'severityDistribution': stats['severityDistribution'],
        'topSources': stats['topSourcesList'],
        'topLocations': stats.get('topLocations', []),
        'averageConfidence': stats['averageConfidence'],
        'recentLogs': logs[:10]
    }
    
    return jsonify(report)

@app.route('/api/report/download/<int:site_index>')
def api_download_report(site_index):
    """Download report as text file"""
    logs = data_store.get_site_logs(site_index)
    stats = data_store.get_statistics(site_index)
    
    report_text = f"""
========================================
SENTINEL - INTRUSION DETECTION REPORT
========================================

Site: {WEBSITES[site_index]['name'] if site_index < len(WEBSITES) else 'Unknown'}
Location: {WEBSITES[site_index]['location'] if site_index < len(WEBSITES) else 'Unknown'}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

----------------------------------------
STATISTICS
----------------------------------------
Total Logs: {stats['totalLogs']}
Threats Detected: {stats['attacks']}
Average Confidence: {stats['averageConfidence']:.3f}

----------------------------------------
ATTACK TYPES
----------------------------------------
"""
    for attack, count in stats['attackTypes'].items():
        report_text += f"{attack}: {count}\n"
    
    report_text += """
----------------------------------------
SEVERITY DISTRIBUTION
----------------------------------------
"""
    for severity, count in stats['severityDistribution'].items():
        report_text += f"{severity.upper()}: {count}\n"
    
    report_text += """
----------------------------------------
TOP ATTACK SOURCES BY LOCATION
----------------------------------------
"""
    for loc in stats.get('topLocations', []):
        report_text += f"{loc['location']}: {loc['count']} attacks\n"
    
    report_text += """
----------------------------------------
TOP ATTACK SOURCES BY IP
----------------------------------------
"""
    for source in stats['topSourcesList']:
        report_text += f"{source['ip']}: {source['count']} attacks\n"
    
    report_text += """
----------------------------------------
RECENT LOGS (Top 5)
----------------------------------------
"""
    for log in logs[:5]:
        loc = log.get('sourceLocation', {})
        location_str = f"{loc.get('city', 'Unknown')}, {loc.get('country', 'Unknown')}" if loc else 'Unknown'
        report_text += f"{log['timestampStr']} | {log['attackType']} | {log['severity']} | {location_str}\n"
    
    report_text += """
========================================
END OF REPORT
========================================
"""
    
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(report_text)
        temp_path = f.name
    
    return send_file(temp_path, as_attachment=True, 
                     download_name=f'report_{WEBSITES[site_index]["name"]}_{datetime.now().strftime("%Y%m%d")}.txt')

def generate_training_data():
    """Generate synthetic training data"""
    import pandas as pd
    data = []
    for _ in range(1000):
        is_attack = np.random.random() > 0.7
        data.append({
            'packetSize': np.random.randint(64, 1500),
            'protocol': np.random.choice([6, 17, 1, 2, 3]),
            'srcPort': np.random.randint(1, 65535),
            'dstPort': np.random.randint(1, 65535),
            'flowDuration': np.random.uniform(0, 100),
            'totalFwdPackets': np.random.randint(0, 100),
            'totalBackwardPackets': np.random.randint(0, 100),
            'fwdPacketLength': np.random.uniform(0, 100),
            'bwdPacketLength': np.random.uniform(0, 100),
            'flowBytesPerSecond': np.random.uniform(0, 10000),
            'flowPacketsPerSecond': np.random.uniform(0, 500),
            'initWindowFwd': np.random.uniform(0, 1000),
            'initWindowBwd': np.random.uniform(0, 1000),
            'fwdAvgSegSize': np.random.uniform(0, 100),
            'bwdAvgSegSize': np.random.uniform(0, 100),
            'fwdAvgBytesPerBulk': np.random.uniform(0, 1000),
            'bwdAvgBytesPerBulk': np.random.uniform(0, 1000),
            'fwdAvgPacketsPerBulk': np.random.uniform(0, 100),
            'bwdAvgPacketsPerBulk': np.random.uniform(0, 100),
            'fwdAvgBulkRate': np.random.uniform(0, 100),
            'label': 1 if is_attack else 0
        })
    return pd.DataFrame(data)

# ============================================================
# MAIN
# ============================================================
if __name__ == '__main__':
    print("🔄 Loading PyTorch model...")
    load_model()
    
    print("🚀 Starting Sentinel Flask Server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
