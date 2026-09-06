const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const THRESHOLD = parseInt(process.env.PLAYBACK_ANALYTICS_THRESHOLD_SECONDS) || 30;

/**
 * Record a play event asynchronously
 * POST /api/playback/record
 * Body: { songId, durationPlayed, completed }
 */
router.post('/record', authMiddleware, (req, res) => {
  const { songId, durationPlayed, completed } = req.body || {};
  const userId = req.user ? req.user.id : 'admin-user-id';

  if (!songId) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'songId required' } });
  }

  // Check threshold: only count if played >= 30s or completed
  const duration = Number(durationPlayed) || 0;
  if (duration < THRESHOLD && !completed) {
    return res.json({ status: 'ignored', reason: 'Under playback threshold' });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  // 1. Record scrobble
  try {
    db.prepare(`
      INSERT INTO scrobbles (media_file_id, user_id, submission_time)
      VALUES (?, ?, ?)
    `).run(songId, userId, nowSeconds);
  } catch (err) {
    console.warn('[Playback] Scrobble insert note:', err.message);
  }

  // 2. Increment play count in annotation
  try {
    const existing = db.prepare('SELECT play_count FROM annotation WHERE user_id = ? AND item_id = ?').get(userId, songId);
    if (existing) {
      db.prepare(`
        UPDATE annotation SET
          play_count = play_count + 1,
          play_date = CURRENT_TIMESTAMP
        WHERE user_id = ? AND item_id = ?
      `).run(userId, songId);
    } else {
      db.prepare(`
        INSERT INTO annotation (user_id, item_id, item_type, play_count, play_date)
        VALUES (?, ?, 'media_file', 1, CURRENT_TIMESTAMP)
      `).run(userId, songId);
    }
  } catch (err) {
    console.warn('[Playback] Annotation update note:', err.message);
  }

  res.json({ status: 'recorded', songId, durationPlayed: duration });
});

module.exports = router;
