const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's liked songs
router.get('/liked', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : 'admin-user-id';

  const songs = db.prepare(`
    SELECT m.id, m.title, m.artist, m.artist_id, m.album, m.album_id, m.duration,
      m.cover_image_url, m.audio_url, m.cloudinary_public_id, m.genre, m.language,
      a.starred_at, 1 AS is_liked
    FROM annotation a
    JOIN media_file m ON a.item_id = m.id
    WHERE a.user_id = ? AND a.starred = 1 AND (m.is_active = 1 OR m.is_active IS NULL)
    ORDER BY a.starred_at DESC
  `).all(userId);

  res.json({ data: songs });
});

// Like a song
router.post('/liked/:songId', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : 'admin-user-id';
  const { songId } = req.params;

  const existing = db.prepare('SELECT user_id, starred FROM annotation WHERE user_id = ? AND item_id = ?').get(userId, songId);
  if (existing) {
    db.prepare(`
      UPDATE annotation SET starred = 1, starred_at = CURRENT_TIMESTAMP WHERE user_id = ? AND item_id = ?
    `).run(userId, songId);
  } else {
    db.prepare(`
      INSERT INTO annotation (user_id, item_id, item_type, starred, starred_at)
      VALUES (?, ?, 'media_file', 1, CURRENT_TIMESTAMP)
    `).run(userId, songId);
  }

  res.json({ status: 'liked', songId });
});

// Unlike a song
router.delete('/liked/:songId', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : 'admin-user-id';
  const { songId } = req.params;

  db.prepare(`
    UPDATE annotation SET starred = 0 WHERE user_id = ? AND item_id = ?
  `).run(userId, songId);

  res.json({ status: 'unliked', songId });
});

// Get recently played songs
router.get('/recently-played', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : 'admin-user-id';

  const songs = db.prepare(`
    SELECT DISTINCT m.id, m.title, m.artist, m.album, m.duration, m.cover_image_url,
      m.audio_url, m.cloudinary_public_id, m.genre, m.language, s.submission_time,
      EXISTS(SELECT 1 FROM annotation a WHERE a.user_id = ? AND a.item_id = m.id AND a.starred = 1) AS is_liked
    FROM scrobbles s
    JOIN media_file m ON s.media_file_id = m.id
    WHERE s.user_id = ? AND (m.is_active = 1 OR m.is_active IS NULL)
    ORDER BY s.submission_time DESC
    LIMIT 30
  `).all(userId, userId);

  res.json({ data: songs });
});

module.exports = router;
