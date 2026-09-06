const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// List albums
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
  const offset = (page - 1) * limit;

  const total = db.prepare('SELECT COUNT(*) as count FROM album').get().count;
  const albums = db.prepare(`
    SELECT alb.id, alb.name, alb.album_artist, alb.album_artist_id, alb.large_image_url,
      alb.genre, alb.min_year, COUNT(m.id) AS song_count
    FROM album alb
    LEFT JOIN media_file m ON alb.id = m.album_id
    GROUP BY alb.id
    ORDER BY alb.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  res.json({
    data: albums,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Album detail with full tracklist
router.get('/:id', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : 'admin-user-id';
  const album = db.prepare('SELECT * FROM album WHERE id = ?').get(req.params.id);

  if (!album) {
    return res.status(404).json({ error: { code: 'ALBUM_NOT_FOUND', message: 'Album not found' } });
  }

  // Full tracklist
  const tracks = db.prepare(`
    SELECT m.id, m.title, m.artist, m.artist_id, m.album, m.duration, m.track_number,
      m.cover_image_url, m.audio_url, m.cloudinary_public_id, m.genre, m.language,
      EXISTS(SELECT 1 FROM annotation a WHERE a.user_id = ? AND a.item_id = m.id AND a.starred = 1) AS is_liked
    FROM media_file m
    WHERE (m.album_id = ? OR LOWER(m.album) = LOWER(?))
      AND (m.is_active = 1 OR m.is_active IS NULL)
    ORDER BY m.track_number ASC, m.title ASC
  `).all(userId, album.id, album.name);

  res.json({
    data: {
      ...album,
      tracks
    }
  });
});

module.exports = router;
