from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from datetime import datetime
from models.feature_extractor import URLFeatureExtractor
from models.train_model import MODEL_PATH
from models.login_anomaly_detector import LoginAnomalyDetector

app = Flask(__name__)
CORS(app)

MODEL_FILE = MODEL_PATH
feature_names = None
phishing_model = None
login_detector = None
extractor = URLFeatureExtractor()

def load_phishing_model():
    global phishing_model, feature_names
    try:
        if os.path.exists(MODEL_FILE):
            phishing_model = joblib.load(MODEL_FILE)
            feature_names = joblib.load(os.path.join(os.path.dirname(__FILE__), 'feature_names.pkl'))
            print(f"Phishing model loaded from {MODEL_FILE}")
        else:
            print("Phishing model file not found. Run train_model.py first.")
    except Exception as e:
        print(f"Error loading phishing model: {e}")

def load_login_detector():
    global login_detector
    try:
        login_detector = LoginAnomalyDetector()
        login_detector.load()
        print("Login anomaly detector loaded")
    except Exception as e:
        print(f"Training login anomaly detector: {e}")
        login_detector = LoginAnomalyDetector()
        login_detector.train()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'phishing_model_loaded': phishing_model is not None,
        'login_detector_loaded': login_detector is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({'error': 'Missing url field'}), 400
    
    url = data['url']
    
    try:
        features = extractor.extract(url)
        X = extractor.to_vector(features)
        
        prediction = phishing_model.predict(X)[0]
        probabilities = phishing_model.predict_proba(X)[0]
        
        is_phishing = bool(prediction)
        confidence = float(max(probabilities))
        
        result = {
            'is_phishing': is_phishing,
            'confidence': round(confidence, 4),
            'features': features,
            'url': url
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    data = request.get_json()
    
    if not data or 'urls' not in data:
        return jsonify({'error': 'Missing urls field'}), 400
    
    urls = data['urls']
    results = []
    
    for url in urls:
        try:
            features = extractor.extract(url)
            X = extractor.to_vector(features)
            
            prediction = phishing_model.predict(X)[0]
            probabilities = phishing_model.predict_proba(X)[0]
            
            results.append({
                'url': url,
                'is_phishing': bool(prediction),
                'confidence': round(float(max(probabilities)), 4)
            })
        except Exception as e:
            results.append({
                'url': url,
                'error': str(e)
            })
    
    return jsonify({'predictions': results})

@app.route('/detect-login', methods=['POST'])
def detect_login():
    data = request.get_json()
    
    required_fields = ['ip', 'timestamp', 'user_id', 'failed_attempts']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': f'Missing required fields: {required_fields}'}), 400
    
    ip = data['ip']
    timestamp = data['timestamp']
    user_id = data['user_id']
    failed_attempts = data['failed_attempts']
    device_fingerprint = data.get('device_fingerprint')
    
    try:
        result = login_detector.detect(
            ip=ip,
            timestamp=timestamp,
            user_id=user_id,
            failed_attempts=failed_attempts,
            device_fingerprint=device_fingerprint
        )
        
        return jsonify({
            'is_anomaly': result['is_anomaly'],
            'risk_score': result['risk_score'],
            'features': result['features'],
            'ip': ip,
            'user_id': user_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_detect_login', methods=['POST'])
def batch_detect_login():
    data = request.get_json()
    
    if not data or 'login_attempts' not in data:
        return jsonify({'error': 'Missing login_attempts field'}), 400
    
    attempts = data['login_attempts']
    results = []
    
    for attempt in attempts:
        try:
            result = login_detector.detect(
                ip=attempt.get('ip'),
                timestamp=attempt.get('timestamp'),
                user_id=attempt.get('user_id'),
                failed_attempts=attempt.get('failed_attempts'),
                device_fingerprint=attempt.get('device_fingerprint')
            )
            
            results.append({
                'ip': attempt.get('ip'),
                'user_id': attempt.get('user_id'),
                'is_anomaly': result['is_anomaly'],
                'risk_score': result['risk_score']
            })
        except Exception as e:
            results.append({
                'ip': attempt.get('ip'),
                'user_id': attempt.get('user_id'),
                'error': str(e)
            })
    
    return jsonify({'predictions': results})

if __name__ == '__main__':
    load_phishing_model()
    load_login_detector()
    app.run(host='0.0.0.0', port=5001, debug=True)