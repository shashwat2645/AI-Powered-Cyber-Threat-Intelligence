import joblib
import numpy as np

class ThreatClassifier:
    def __init__(self, model_path=None):
        self.model = None
        if model_path:
            self.load(model_path)

    def load(self, model_path):
        self.model = joblib.load(model_path)

    def predict(self, features):
        if self.model is None:
            return {'prediction': 0, 'confidence': 0.5}
        prediction = self.model.predict([features])
        proba = self.model.predict_proba([features])
        return {
            'prediction': int(prediction[0]),
            'confidence': float(max(proba[0]))
        }

    def train(self, X, y):
        from sklearn.ensemble import RandomForestClassifier
        self.model = RandomForestClassifier(n_estimators=100)
        self.model.fit(X, y)

    def save(self, model_path):
        if self.model:
            joblib.dump(self.model, model_path)