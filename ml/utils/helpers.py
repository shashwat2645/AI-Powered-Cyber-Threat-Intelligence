import os

def get_env(var, default=None):
    return os.getenv(var, default)

ML_MODEL_PATH = get_env('ML_MODEL_PATH', 'models/threat_model.pkl')
THREAT_DB_PATH = get_env('THREAT_DB_PATH', 'data/threat_signatures.json')

def load_threat_signatures():
    import json
    if os.path.exists(THREAT_DB_PATH):
        with open(THREAT_DB_PATH, 'r') as f:
            return json.load(f)
    return {}