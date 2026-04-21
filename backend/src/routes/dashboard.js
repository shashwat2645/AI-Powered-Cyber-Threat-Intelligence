const express = require('express');
const router = express.Router();
const threatService = require('../services/threatService');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const threatStats = await threatService.getThreatStats();
    const anomalyStats = await threatService.getAnomalyStats();
    
    const [recentThreats] = await pool.execute(
      'SELECT * FROM threats ORDER BY detected_at DESC LIMIT 5'
    );
    
    const [recentPhishing] = await pool.execute(
      "SELECT * FROM threats WHERE type = 'phishing' ORDER BY detected_at DESC LIMIT 5"
    );
    
    res.json({
      threats: {
        total: threatStats.total,
        phishing_count: threatStats.phishing,
        today: threatStats.today,
        severity_breakdown: threatStats.severity_breakdown,
        status_breakdown: threatStats.status_breakdown
      },
      anomalies: {
        today: anomalyStats.anomalies_today,
        recent_flagged: anomalyStats.recent_flagged
      },
      recent_threats: recentThreats,
      recent_phishing: recentPhishing
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;