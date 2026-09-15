import torch
import torch.nn as nn
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 1. Initialize Firebase Admin SDK
# Download your serviceAccountKey.json from Firebase Console
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Define PyTorch model
class SimpleModel(nn.Module):
    def __init__(self):
        super(SimpleModel, self).__init__()
        self.linear = nn.Linear(1, 1)

    def forward(self, x):
        return self.linear(x)

model = SimpleModel()
model.eval()

# 3. API Endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        input_value = data.get('input')

        # Run model inference
        input_tensor = torch.tensor([[float(input_value)]], dtype=torch.float32)
        with torch.no_grad():
            output = model(input_tensor)
            prediction = output.item()

        # Save to Firestore
        doc_ref = db.collection('predictions').add({
            'input': input_value,
            'prediction': prediction,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'doc_id': doc_ref[1].id
        })

    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
