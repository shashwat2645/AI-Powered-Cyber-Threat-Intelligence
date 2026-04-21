const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const register = async (username, email, password) => {
  const password_hash = await bcrypt.hash(password, 10);
  
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [username, email, password_hash, 'viewer']
  );
  
  return { id: result.insertId, username, email };
};

const login = async (email, password, ip_address) => {
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  
  if (users.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = users[0];
  
  if (user.is_locked) {
    await logLoginAttempt(user.id, ip_address, false, true);
    throw new Error('Account is locked');
  }
  
  const validPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!validPassword) {
    const newFailedAttempts = user.failed_login_attempts + 1;
    const is_locked = newFailedAttempts >= 5;
    
    await pool.execute(
      'UPDATE users SET failed_login_attempts = ?, is_locked = ? WHERE id = ?',
      [newFailedAttempts, is_locked, user.id]
    );
    
    await logLoginAttempt(user.id, ip_address, false, is_locked);
    throw new Error('Invalid credentials');
  }
  
  await pool.execute(
    'UPDATE users SET failed_login_attempts = 0, last_login = NOW() WHERE id = ?',
    [user.id]
  );
  
  await logLoginAttempt(user.id, ip_address, true, false);
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
};

const logLoginAttempt = async (user_id, ip_address, success, flagged) => {
  await pool.execute(
    'INSERT INTO login_attempts (user_id, ip_address, success, flagged) VALUES (?, ?, ?, ?)',
    [user_id, ip_address, success, flagged]
  );
};

const getMe = async (userId) => {
  const [users] = await pool.execute(
    'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?',
    [userId]
  );
  
  if (users.length === 0) {
    throw new Error('User not found');
  }
  
  return users[0];
};

const getUserByEmail = async (email) => {
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  
  return users[0] || null;
};

module.exports = { register, login, logLoginAttempt, getMe, getUserByEmail };