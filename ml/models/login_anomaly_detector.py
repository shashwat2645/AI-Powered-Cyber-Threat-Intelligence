import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime, timedelta
import json

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'login_anomaly_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'login_scaler.pkl')

IP_REPUTATION_DB = {
    '192.168.': {'score': 0.3, 'country': 'local'},
    '10.': {'score': 0.2, 'country': 'local'},
    '172.16.': {'score': 0.2, 'country': 'local'},
    '8.8.': {'score': 0.1, 'country': 'US'},
    '1.1.1.': {'score': 0.1, 'country': 'US'},
}

class LoginAnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.history = {}
        
    def _get_hour_of_day(self, timestamp):
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            dt = timestamp
        hour = dt.hour
        if 0 <= hour < 6:
            return 0
        elif 6 <= hour < 12:
            return 1
        elif 12 <= hour < 18:
            return 2
        else:
            return 3
    
    def _get_ip_reputation(self, ip):
        for prefix, data in IP_REPUTATION_DB.items():
            if ip.startswith(prefix):
                return data['score']
        return 0.5
    
    def _get_geo_change(self, user_id, ip):
        if user_id not in self.history:
            self.history[user_id] = {'last_ip': ip, 'last_geo': self._get_geo_from_ip(ip)}
            return 0
        
        last_geo = self.history[user_id]['last_geo']
        current_geo = self._get_geo_from_ip(ip)
        
        if last_geo != current_geo:
            self.history[user_id] = {'last_ip': ip, 'last_geo': current_geo}
            return 1
        return 0
    
    def _get_geo_from_ip(self, ip):
        for prefix, data in IP_REPUTATION_DB.items():
            if ip.startswith(prefix):
                return data['country']
        return 'unknown'
    
    def _get_device_change(self, user_id, device_fingerprint):
        if user_id not in self.history:
            self.history[user_id] = {'device': device_fingerprint}
            return 0
        
        last_device = self.history[user_id].get('device', None)
        if last_device and last_device != device_fingerprint:
            return 1
        return 0
    
    def _extract_features(self, ip, timestamp, user_id, failed_attempts, device_fingerprint=None):
        hour_of_day = self._get_hour_of_day(timestamp)
        ip_reputation = self._get_ip_reputation(ip)
        geo_change = self._get_geo_change(user_id, ip)
        device_change = self._get_device_change(user_id, device_fingerprint)
        
        failed_count = min(failed_attempts, 10)
        
        features = [
            hour_of_day,
            failed_count,
            ip_reputation,
            geo_change,
            device_change,
        ]
        return features
    
    def _to_vector(self, features):
        return [features]
    
    def extract_features(self, ip, timestamp, user_id, failed_attempts, device_fingerprint=None):
        features = self._extract_features(ip, timestamp, user_id, failed_attempts, device_fingerprint)
        return {
            'hour_of_day': features[0],
            'failed_attempts': features[1],
            'ip_reputation_score': features[2],
            'geolocation_change': features[3],
            'device_fingerprint_change': features[4]
        }
    
    def train(self, X=None, contamination=0.1):
        if X is None:
            X = self._generate_synthetic_data()
        
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_scaled)
        
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
        
        return self.model
    
    def _generate_synthetic_data(self, n_samples=1000):
        np.random.seed(42)
        data = []
        
        for _ in range(n_samples):
            hour = np.random.choice([0, 1, 2, 3])
            failed = np.random.randint(0, 5)
            ip_score = np.random.uniform(0.1, 0.5)
            geo = np.random.choice([0, 1], p=[0.95, 0.05])
            device = np.random.choice([0, 1], p=[0.95, 0.05])
            data.append([hour, failed, ip_score, geo, device])
        
        return np.array(data)
    
    def detect(self, ip, timestamp, user_id, failed_attempts, device_fingerprint=None):
        if self.model is None:
            try:
                self.load()
            except:
                self.train()
        
        features = self._extract_features(ip, timestamp, user_id, failed_attempts, device_fingerprint)
        X = self.scaler.transform([features])
        
        prediction = self.model.predict(X)[0]
        score = self.model.score_samples(X)[0]
        
        risk_score = (score * -1)
        risk_score = max(0, min(1, risk_score))
        
        is_anomaly = prediction == -1
        
        return {
            'is_anomaly': is_anomaly,
            'risk_score': round(risk_score, 4),
            'features': self.extract_features(ip, timestamp, user_id, failed_attempts, device_fingerprint)
        }
    
    def load(self):
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
        else:
            raise FileNotFoundError("Model not found. Train first.")
    
    def save(self):
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)