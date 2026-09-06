const express = require('express');
const db = require('../db/database');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { syncCloudinaryCatalog } = require('../services/syncService');
const cloudinaryService = require('../services/cloudinary');

const router = express.Router();

// Apply admin protection
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard metrics
router.get('/dashboard', (req, res) => {
  const totalSongs = db.prepare('SELECT COUNT(*) as count FROM media_file').get().count;
  const totalArtists = db.prepare('SELECT COUNT(*) as count FROM artist').get().count;
  const totalAlbums = db.prepare('SELECT COUNT(*) as count FROM album').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM user').get().count;
  const totalPlays = db.prepare('SELECT COALESCE(SUM(play_count), 0) as count FROM annotation').get().count;
  
  const lastSync = db.prepare('SELECT * FROM cloudinary_sync_log ORDER BY id DESC LIMIT 1').get() || null;

  const topSongs = db.prepare(`
    SELECT m.id, m.title, m.artist, m.album, COALESCE(SUM(a.play_count), 0) AS plays
    FROM media_file m
    LEFT JOIN annotation a ON m.id = a.item_id
    GROUP BY m.id
    ORDER BY plays DESC
    LIMIT 5
  `).all();

  res.json({
    data: {
      metrics: {
        totalSongs,
        totalArtists,
        totalAlbums,
        totalUsers,
        totalPlays
      },
      lastSync,
      topSongs,
      cloudinaryConfigured: cloudinaryService.isConfigured()
    }
  });
});

// Save/Update Cloudinary Credentials
router.post('/cloudinary-config', (req, res) => {
  const { cloudName, apiKey, apiSecret, folder } = req.body || {};
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'cloudName, apiKey, and apiSecret are required' } });
  }

  cloudinaryService.updateConfig({ cloudName, apiKey, apiSecret, folder });

  // Update .env file
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    const lines = envContent.split('\n');
    const map = {};
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) map[match[1].trim()] = match[2].trim();
    }
    map['CLOUDINARY_CLOUD_NAME'] = cloudName.trim();
    map['CLOUDINARY_API_KEY'] = apiKey.trim();
    map['CLOUDINARY_API_SECRET'] = apiSecret.trim();
    if (folder) map['CLOUDINARY_FOLDER'] = folder.trim();

    const newEnv = Object.entries(map).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(envPath, newEnv, 'utf8');
  } catch (err) {
    console.warn('[Admin] Failed to persist .env:', err.message);
  }

  res.json({
    status: 'configured',
    configured: true,
    cloudName: cloudName.trim()
  });
});

// Trigger Cloudinary Synchronization
router.post('/sync', async (req, res) => {
  const { folder } = req.body || {};
  try {
    const result = await syncCloudinaryCatalog(folder);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'SYNC_ERROR', message: err.message } });
  }
});

// Get Sync Logs
router.get('/sync/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM cloudinary_sync_log ORDER BY id DESC LIMIT 20').all();
  res.json({ data: logs });
});

// Admin songs list with search and filter
router.get('/songs', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
  const offset = (page - 1) * limit;
  const search = req.query.search;
  const genre = req.query.genre;
  const language = req.query.language;

  let whereClauses = ['1=1'];
  let params = [];

  if (search) {
    whereClauses.push('(title LIKE ? OR artist LIKE ? OR album LIKE ? OR cloudinary_public_id LIKE ?)');
    const p = `%${search}%`;
    params.push(p, p, p, p);
  }
  if (genre) {
    whereClauses.push('LOWER(genre) = LOWER(?)');
    params.push(genre);
  }
  if (language) {
    whereClauses.push('LOWER(language) = LOWER(?)');
    params.push(language);
  }

  const whereSql = whereClauses.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) as count FROM media_file WHERE ${whereSql}`).get(...params).count;
  const songs = db.prepare(`
    SELECT id, title, artist, album, genre, language, duration, size, year,
      cloudinary_public_id, cover_image_url, audio_url, is_active, created_at
    FROM media_file
    WHERE ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    data: songs,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Update song metadata
router.patch('/songs/:id', (req, res) => {
  const { title, artist, album, genre, language, cover_image_url, is_active } = req.body || {};
  const song = db.prepare('SELECT id FROM media_file WHERE id = ?').get(req.params.id);

  if (!song) {
    return res.status(404).json({ error: { code: 'SONG_NOT_FOUND', message: 'Song not found' } });
  }

  const current = db.prepare('SELECT * FROM media_file WHERE id = ?').get(req.params.id);
  const updatedTitle = title !== undefined ? title : current.title;
  const updatedArtist = artist !== undefined ? artist : current.artist;
  const updatedAlbum = album !== undefined ? album : current.album;
  const updatedGenre = genre !== undefined ? genre : current.genre;
  const updatedLanguage = language !== undefined ? language : current.language;
  const updatedCover = cover_image_url !== undefined ? cover_image_url : current.cover_image_url;
  const updatedActive = is_active !== undefined ? (is_active ? 1 : 0) : current.is_active;

  const keywords = `${updatedTitle} ${updatedArtist} ${updatedAlbum} ${updatedGenre} ${updatedLanguage}`.toLowerCase();

  db.prepare(`
    UPDATE media_file SET
      title = ?, artist = ?, album = ?, genre = ?, language = ?,
      cover_image_url = ?, is_active = ?, search_keywords = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updatedTitle, updatedArtist, updatedAlbum, updatedGenre, updatedLanguage,
    updatedCover, updatedActive, keywords, req.params.id
  );

  // Update FTS
  db.prepare(`
    INSERT OR REPLACE INTO spotkify_fts (song_id, title, artist, album, genre, language, search_keywords)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, updatedTitle, updatedArtist, updatedAlbum, updatedGenre, updatedLanguage, keywords);

  res.json({ status: 'updated', songId: req.params.id });
});

// Bulk operations
router.post('/songs/bulk', (req, res) => {
  const { songIds, action, value } = req.body || {};
  if (!Array.isArray(songIds) || songIds.length === 0) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'songIds array required' } });
  }

  const placeholders = songIds.map(() => '?').join(',');

  if (action === 'activate') {
    db.prepare(`UPDATE media_file SET is_active = 1 WHERE id IN (${placeholders})`).run(...songIds);
  } else if (action === 'deactivate') {
    db.prepare(`UPDATE media_file SET is_active = 0 WHERE id IN (${placeholders})`).run(...songIds);
  } else if (action === 'setGenre' && value) {
    db.prepare(`UPDATE media_file SET genre = ? WHERE id IN (${placeholders})`).run(value, ...songIds);
  } else if (action === 'setLanguage' && value) {
    db.prepare(`UPDATE media_file SET language = ? WHERE id IN (${placeholders})`).run(value, ...songIds);
  } else {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid action or missing value' } });
  }

  res.json({ status: 'bulk_updated', count: songIds.length, action });
});

module.exports = router;
