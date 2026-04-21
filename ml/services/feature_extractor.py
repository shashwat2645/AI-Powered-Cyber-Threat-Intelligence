import pandas as pd
import numpy as np

class FeatureExtractor:
    def extract_ip_features(self, ip_data):
        features = []
        features.append(len(ip_data.get('address', '')))
        features.append(1 if ip_data.get('is_private') else 0)
        return np.array(features)

    def extract_url_features(self, url_data):
        features = []
        url = url_data.get('url', '')
        features.append(len(url))
        features.append(url.count('.'))
        features.append(1 if 'https' in url else 0)
        features.append(url.count('/'))
        return np.array(features)

    def extract_file_features(self, file_data):
        features = []
        features.append(file_data.get('size', 0))
        features.append(1 if file_data.get('is_executable') else 0)
        return np.array(features)