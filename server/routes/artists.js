const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { slugify } = require('../services/metadataParser');

const router = express.Router();

/**
 * Helper to parse artists_json safely
 */
function formatSongRow(m) {
  let artists = [];
  try {
    artists = m.artists_json ? JSON.parse(m.artists_json) : [];
  } catch (_) {
    artists = [];
  }
  if (artists.length === 0 && m.artist) {
    artists = m.artist.split(',').map(a => a.trim()).filter(Boolean);
  }

  return {
    ...m,
    artists,
    cloudinaryPublicId: m.cloudinary_public_id,
    audioUrl: m.audio_url,
    coverImageUrl: m.cover_image_url,
    is_liked: Boolean(m.is_liked)
  };
}

/**
 * List all artists with dynamic song counts derived from media_file_artists
 * GET /api/artists?page=1&limit=50
 */
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const total = db.prepare(`
    SELECT COUNT(DISTINCT a.id) as count
    FROM artist a
    JOIN media_file_artists mfa ON a.id = mfa.artist_id
  `).get().count;

  const artists = db.prepare(`
    SELECT a.id, a.name, a.slug, a.large_image_url,
      COUNT(mfa.media_file_id) AS song_count
    FROM artist a
    JOIN media_file_artists mfa ON a.id = mfa.artist_id
    GROUP BY a.id
    ORDER BY song_count DESC, a.name ASC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  res.json({
    data: artists,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Artist profile with all songs containing this artist
 * GET /api/artists/:slugOrId
 */
router.get('/:slugOrId', (req, res) => {
  const param = req.params.slugOrId.trim();
  const slugParam = slugify(param);
  const userId = (req.user && req.user.id) || 'admin-user-id';

  // Find artist by ID, slug, or exact name
  let artist = db.prepare('SELECT * FROM artist WHERE id = ?').get(param);
  if (!artist && slugParam) {
    artist = db.prepare('SELECT * FROM artist WHERE slug = ?').get(slugParam);
  }
  if (!artist) {
    artist = db.prepare('SELECT * FROM artist WHERE LOWER(name) = LOWER(?)').get(param);
  }

  if (!artist) {
    return res.status(404).json({ error: { code: 'ARTIST_NOT_FOUND', message: 'Artist not found' } });
  }

  // Find ALL songs where this artist is in the artists array via junction table
  const songsRaw = db.prepare(`
    SELECT DISTINCT m.id, m.title, m.artist, m.artists_json, m.album, m.movie, m.duration,
      m.cover_image_url, m.audio_url, m.cloudinary_public_id, m.genre, m.language,
      COALESCE((SELECT SUM(play_count) FROM annotation WHERE item_id = m.id), 0) AS play_count,
      EXISTS(SELECT 1 FROM annotation a WHERE a.user_id = ? AND a.item_id = m.id AND a.starred = 1) AS is_liked
    FROM media_file m
    JOIN media_file_artists mfa ON m.id = mfa.media_file_id
    WHERE mfa.artist_id = ? AND (m.is_active = 1 OR m.is_active IS NULL)
    ORDER BY play_count DESC, m.created_at DESC
  `).all(userId, artist.id);

  const songs = songsRaw.map(formatSongRow);

  // Albums associated with this artist
  const albums = db.prepare(`
    SELECT DISTINCT alb.id, alb.name, alb.album_artist, alb.large_image_url, alb.genre,
      COUNT(m.id) AS song_count
    FROM album alb
    JOIN media_file m ON alb.id = m.album_id
    JOIN media_file_artists mfa ON m.id = mfa.media_file_id
    WHERE mfa.artist_id = ?
    GROUP BY alb.id
    ORDER BY alb.created_at DESC
  `).all(artist.id);

  res.json({
    data: {
      id: artist.id,
      name: artist.name,
      slug: artist.slug,
      large_image_url: artist.large_image_url,
      song_count: songs.length,
      artist: {
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        large_image_url: artist.large_image_url,
        song_count: songs.length
      },
      songs,
      popularSongs: songs.slice(0, 10),
      albums
    }
  });
});

module.exports = router;
