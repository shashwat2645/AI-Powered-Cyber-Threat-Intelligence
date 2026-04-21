const express = require('express');
const router = express.Router();
const threatService = require('../services/threatService');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, status, type } = req.query;
    
    const result = await threatService.getThreats(
      parseInt(page),
      parseInt(limit),
      { severity, status, type }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const threat = await threatService.getThreatById(req.params.id);
    
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }
    
    res.json(threat);
  } catch (error) {
    console.error('Get threat error:', error);
    res.status(500).json({ error: 'Failed to fetch threat' });
  }
});

router.post('/scan', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const result = await threatService.scanUrl(url, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to scan URL' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const threat = await threatService.createThreat({
      ...req.body,
      reported_by: req.user.id
    });
    
    res.status(201).json(threat);
  } catch (error) {
    console.error('Create threat error:', error);
    res.status(500).json({ error: 'Failed to create threat' });
  }
});

module.exports = router;