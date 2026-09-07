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

  // Strictly enforce credentials: username must be 'sharu' and password must be 'sharu@123' (or 'Sharu@123' for mobile keyboards)
  const isUserMatch = cleanUsername === 'sharu';
  const isPassMatch = cleanPassword === 'sharu@123' || cleanPassword === 'Sharu@123';

  if (!isUserMatch || !isPassMatch) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Incorrect username or password. Please try again.'
      }
    });
  }

  // Ensure 'sharu' user exists in database
  let user = db.prepare('SELECT * FROM user WHERE LOWER(user_name) = ?').get('sharu');
  if (!user) {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('sharu@123', salt);
      const newId = `user-sharu`;
      db.prepare(`
        INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
        VALUES (?, 'sharu', 'Sharu', 'sharu@spotkify.local', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(newId, hashedPassword);
      user = db.prepare('SELECT * FROM user WHERE id = ?').get(newId);
    } catch (e) {
      user = db.prepare('SELECT * FROM user LIMIT 1').get();
    }
  } else {
    try {
      if (!user.password || !bcrypt.compareSync('sharu@123', user.password)) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('sharu@123', salt);
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
        name: user.name || 'Sharu',
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
