const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

const detectLoginAnomaly = async (ip, timestamp, user_id, failed_attempts, device_fingerprint) => {
  try {
    const response = await axios.post(`${ML_API_URL}/detect-login`, {
      ip,
      timestamp,
      user_id,
      failed_attempts,
      device_fingerprint
    }, {
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('ML API error:', error.message);
    return { is_anomaly: false, risk_score: 0, error: error.message };
  }
};

const predictPhishing = async (url) => {
  try {
    const response = await axios.post(`${ML_API_URL}/predict`, {
      url
    }, {
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('ML API error:', error.message);
    return { is_phishing: false, confidence: 0, error: error.message };
  }
};

const checkHealth = async () => {
  try {
    const response = await axios.get(`${ML_API_URL}/api/health`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

module.exports = { detectLoginAnomaly, predictPhishing, checkHealth };