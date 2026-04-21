import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import json
from feature_extractor import URLFeatureExtractor
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

def generate_sample_data(n_samples=1000):
    np.random.seed(42)
    
    benign_urls = [
        f"https://www.example{i}.com/page" for i in range(n_samples // 2)
    ] + [
        f"https://google.com/search?q=query{i}" for i in range(n_samples // 4)
    ] + [
        f"https://github.com/user/repo{i}/blob/main/file.py" for i in range(n_samples // 4)
    ]
    
    phishing_urls = [
        f"http://192.168.1.{i%255}/login.php?user=admin" for i in range(n_samples // 2)
    ] + [
        f"https://secure-bank{i}-login.com/account" for i in range(n_samples // 3)
    ] + [
        f"http:// suspicious-phishing{i}.xyz/verify" for i in range(n_samples // 3)
    ]
    
    all_urls = benign_urls + phishing_urls
    labels = [0] * len(benign_urls) + [1] * len(phishing_urls)
    
    return all_urls, labels

def extract_features(urls, extractor):
    features_list = []
    for url in urls:
        features = extractor.extract(url)
        vector = extractor.to_vector(features)[0]
        features_list.append(vector)
    return features_list

def train_model(data_path=None, n_samples=1000):
    print("Extracting features...")
    extractor = URLFeatureExtractor()
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
        urls = df['url'].tolist()
        labels = df['label'].tolist()
    else:
        urls, labels = generate_sample_data(n_samples)
    
    X = extract_features(urls, extractor)
    y = labels
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['benign', 'phishing']))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"\nCross-validation scores: {cv_scores}")
    print(f"Mean CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
    
    print(f"\nSaving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    
    feature_names = [
        'url_length', 'special_char_count', 'has_ip', 'subdomain_count',
        'uses_https', 'domain_age_days', 'digit_count', 'dot_count',
        'has_at_symbol', 'has_double_slash', 'url_entropy',
        'path_length', 'query_params_count'
    ]
    joblib.dump(feature_names, os.path.join(os.path.dirname(__file__), 'feature_names.pkl'))
    
    print("Model trained successfully!")
    return model

if __name__ == '__main__':
    train_model()