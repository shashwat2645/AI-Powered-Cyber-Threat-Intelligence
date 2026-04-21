const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { detectLoginAnomaly } = require('../services/mlService');
const { authMiddleware } = require('../middleware/auth');
const socketService = require('../services/socketService');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    
    const user = await authService.register(username, email, password);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await authService.getUserByEmail(email);
    
    if (user) {
      const anomalyResult = await detectLoginAnomaly(
        ip_address,
        new Date().toISOString(),
        user.id,
        user.failed_login_attempts + 1,
        req.headers['user-agent']
      );
      
      if (anomalyResult.is_anomaly) {
        await authService.logLoginAttempt(user.id, ip_address, false, true);
        socketService.emitAnomalyAlert({
          user_id: user.id,
          ip_address,
          risk_score: anomalyResult.risk_score
        });
        return res.status(403).json({ 
          error: 'Login attempt flagged as suspicious',
          risk_score: anomalyResult.risk_score
        });
      }
    }
    
    const result = await authService.login(email, password, ip_address);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (error.message === 'Account is locked') {
      return res.status(403).json({ error: 'Account is locked due to too many failed attempts' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;