const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Username and password required' } });
  }

  // Only sharu as username and sharu@123 as password is valid
  if (cleanUsername.toLowerCase() !== 'sharu' || cleanPassword !== 'sharu@123') {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password. Please try again.' } });
  }

  let user = db.prepare('SELECT * FROM user WHERE LOWER(user_name) = LOWER(?)').get('sharu');

  if (!user) {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('sharu@123', salt);
      db.prepare(`
        INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
        VALUES ('sharu-user-id', 'sharu', 'Sharu', 'sharu@spotkify.local', ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(hashedPassword);
      user = db.prepare('SELECT * FROM user WHERE user_name = ?').get('sharu');
    } catch (e) {}
  }

  try {
    db.prepare('UPDATE user SET updated_at = CURRENT_TIMESTAMP, last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  } catch (err) {
    try {
      db.prepare('UPDATE user SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    } catch (e) {}
  }

  const token = generateToken(user);

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        userName: user.user_name,
        name: user.name || user.user_name,
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
