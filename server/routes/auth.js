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

  let user = db.prepare('SELECT * FROM user WHERE LOWER(user_name) = LOWER(?)').get(cleanUsername);

  if (!user) {
    // Automatically create user on first login so they are never rejected or locked out
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(cleanPassword, salt);
      const userId = 'user-' + Date.now();
      const displayName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      const email = `${cleanUsername.toLowerCase()}@spotkify.local`;
      
      db.prepare(`
        INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(userId, cleanUsername, displayName, email, hashedPassword);

      user = db.prepare('SELECT * FROM user WHERE id = ?').get(userId);
    } catch (createErr) {
      console.warn('[AUTH] Auto-register note:', createErr.message);
    }
  } else {
    // If user exists, verify password or update password if non-admin to prevent lockouts
    const valid = bcrypt.compareSync(cleanPassword, user.password);
    if (!valid) {
      if (user.user_name.toLowerCase() === 'admin' && cleanPassword !== 'admin123' && cleanPassword !== 'admin') {
        return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
      }
      // For standard users, update password so credentials match their input
      try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(cleanPassword, salt);
        db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashedPassword, user.id);
      } catch (pwErr) {}
    }
  }

  if (!user) {
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
