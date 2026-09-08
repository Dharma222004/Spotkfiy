const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Validate supported credentials:
  // 1. sharu / sharu@123
  // 2. you / you@123
  const isSharu = cleanUsername === 'sharu' && (cleanPassword === 'sharu@123' || cleanPassword === 'Sharu@123');
  const isYou = cleanUsername === 'you' && (cleanPassword === 'you@123' || cleanPassword === 'You@123');

  if (!isSharu && !isYou) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Incorrect username or password. Please try again.'
      }
    });
  }

  const targetUsername = cleanUsername; // 'sharu' or 'you'
  const displayName = targetUsername === 'sharu' ? 'Sharu' : 'You';
  const canonicalPassword = targetUsername === 'sharu' ? 'sharu@123' : 'you@123';

  // Ensure user exists in database with hashed password
  let user = db.prepare('SELECT * FROM user WHERE LOWER(user_name) = ?').get(targetUsername);
  if (!user) {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(canonicalPassword, salt);
      const newId = `user-${targetUsername}`;
      db.prepare(`
        INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(newId, targetUsername, displayName, `${targetUsername}@spotkify.local`, hashedPassword);
      user = db.prepare('SELECT * FROM user WHERE id = ?').get(newId);
    } catch (e) {
      user = db.prepare('SELECT * FROM user LIMIT 1').get();
    }
  } else {
    try {
      if (!user.password || !bcrypt.compareSync(canonicalPassword, user.password)) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(canonicalPassword, salt);
        db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashedPassword, user.id);
      }
    } catch (err) {}
  }

  try {
    db.prepare('UPDATE user SET updated_at = CURRENT_TIMESTAMP, last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  } catch (err) {}

  const token = generateToken(user);

  return res.json({
    data: {
      token,
      user: {
        id: user.id,
        userName: user.user_name,
        name: user.name || displayName,
        email: user.email,
        isAdmin: Boolean(user.is_admin)
      }
    }
  });
});

// Current user profile
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, user_name, name, email, is_admin FROM user WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
  }
  res.json({
    data: {
      id: user.id,
      userName: user.user_name,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.is_admin)
    }
  });
});

module.exports = router;
