const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Username and password required' } });
  }

  const user = db.prepare('SELECT * FROM user WHERE LOWER(user_name) = LOWER(?)').get(username.trim());
  if (!user) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
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
        name: user.name,
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
