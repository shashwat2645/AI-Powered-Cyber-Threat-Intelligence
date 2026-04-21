const { pool } = require('../config/database');
const { predictPhishing } = require('./mlService');
const socketService = require('./socketService');

const getThreats = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params = [];
  
  if (filters.severity) {
    whereClause += ' WHERE severity = ?';
    params.push(filters.severity);
  }
  
  if (filters.status) {
    whereClause += whereClause ? ' AND status = ?' : ' WHERE status = ?';
    params.push(filters.status);
  }
  
  if (filters.type) {
    whereClause += whereClause ? ' AND type = ?' : ' WHERE type = ?';
    params.push(filters.type);
  }
  
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM threats${whereClause}`,
    params
  );
  
  const [threats] = await pool.execute(
    `SELECT * FROM threats${whereClause} ORDER BY detected_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  
  return {
    threats,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / limit)
    }
  };
};

const getThreatById = async (id) => {
  const [threats] = await pool.execute(
    'SELECT * FROM threats WHERE id = ?',
    [id]
  );
  
  return threats[0] || null;
};

const createThreat = async (threatData) => {
  const { type, url, ip_address, severity, status, source, reported_by } = threatData;
  
  const [result] = await pool.execute(
    'INSERT INTO threats (type, url, ip_address, severity, status, source, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [type, url, ip_address, severity || 'medium', status || 'open', source, reported_by]
  );
  
  return getThreatById(result.insertId);
};

const scanUrl = async (url, userId) => {
  const mlResult = await predictPhishing(url);
  
  const type = mlResult.is_phishing ? 'phishing' : 'benign';
  const severity = mlResult.is_phishing ? (mlResult.confidence > 0.8 ? 'critical' : 'high') : 'low';
  
  const [result] = await pool.execute(
    'INSERT INTO threats (type, url, severity, status, source, reported_by) VALUES (?, ?, ?, ?, ?, ?)',
    [type, url, severity, 'open', 'automated_scan', userId]
  );
  
  const threatId = result.insertId;
  const threat = await getThreatById(threatId);
  
  if (mlResult.is_phishing) {
    await pool.execute(
      'INSERT INTO phishing_reports (url, features_json, prediction, confidence_score, reported_by, threat_id) VALUES (?, ?, ?, ?, ?, ?)',
      [url, JSON.stringify(mlResult.features), mlResult.is_phishing ? 'phishing' : 'benign', mlResult.confidence, userId, threatId]
    );
  }
  
  if (severity === 'critical' || severity === 'high') {
    socketService.emitNewThreat(threat);
    socketService.emitThreatCountUpdate((await getThreatStats()).total);
  }
  
  return {
    threat,
    ml_result: mlResult
  };
};

const getThreatStats = async () => {
  const [totalResult] = await pool.execute('SELECT COUNT(*) as count FROM threats');
  
  const [phishingResult] = await pool.execute(
    "SELECT COUNT(*) as count FROM threats WHERE type = 'phishing'"
  );
  
  const [todayResult] = await pool.execute(
    "SELECT COUNT(*) as count FROM threats WHERE DATE(detected_at) = CURDATE()"
  );
  
  const [severityBreakdown] = await pool.execute(
    "SELECT severity, COUNT(*) as count FROM threats GROUP BY severity"
  );
  
  const [statusBreakdown] = await pool.execute(
    "SELECT status, COUNT(*) as count FROM threats GROUP BY status"
  );
  
  return {
    total: totalResult[0].count,
    phishing: phishingResult[0].count,
    today: todayResult[0].count,
    severity_breakdown: severityBreakdown,
    status_breakdown: statusBreakdown
  };
};

const getAnomalyStats = async () => {
  const [todayResult] = await pool.execute(
    "SELECT COUNT(*) as count FROM login_attempts WHERE flagged = TRUE AND DATE(timestamp) = CURDATE()"
  );
  
  const [recentFlagged] = await pool.execute(
    "SELECT * FROM login_attempts WHERE flagged = TRUE ORDER BY timestamp DESC LIMIT 10"
  );
  
  return {
    anomalies_today: todayResult[0].count,
    recent_flagged: recentFlagged
  };
};

module.exports = { getThreats, getThreatById, createThreat, scanUrl, getThreatStats, getAnomalyStats };