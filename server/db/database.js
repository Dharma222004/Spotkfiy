const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'data', 'navidrome.db');

// Ensure parent dir exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (err) {
  console.warn('Note on pragmas:', err.message);
}

function initSchema() {
  // 1. Inspect existing columns in media_file
  const existingCols = new Set(
    db.prepare("PRAGMA table_info(media_file)").all().map(c => c.name)
  );

  const columnsToAdd = [
    { name: 'cloudinary_public_id', type: 'VARCHAR(255)' },
    { name: 'audio_url', type: 'TEXT' },
    { name: 'cover_image_url', type: 'TEXT' },
    { name: 'language', type: 'VARCHAR(100)' },
    { name: 'is_active', type: 'BOOLEAN DEFAULT 1' },
    { name: 'search_keywords', type: 'TEXT' },
    { name: 'artists_json', type: 'TEXT' },
    { name: 'movie', type: 'VARCHAR(255)' },
    { name: 'slug', type: 'VARCHAR(255)' }
  ];

  for (const col of columnsToAdd) {
    if (!existingCols.has(col.name)) {
      try {
        db.exec(`ALTER TABLE media_file ADD COLUMN ${col.name} ${col.type};`);
        console.log(`[DB] Added column media_file.${col.name}`);
      } catch (err) {
        console.warn(`[DB] Column media_file.${col.name} note:`, err.message);
      }
    }
  }

  // Ensure slug column exists in artist table
  const existingArtistCols = new Set(
    db.prepare("PRAGMA table_info(artist)").all().map(c => c.name)
  );
  if (!existingArtistCols.has('slug')) {
    try {
      db.exec('ALTER TABLE artist ADD COLUMN slug VARCHAR(255);');
      console.log('[DB] Added column artist.slug');
    } catch (err) {
      console.warn('[DB] Column artist.slug note:', err.message);
    }
  }

  // 2. Create cloudinary_sync_log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cloudinary_sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      status VARCHAR(50) DEFAULT 'RUNNING',
      discovered INTEGER DEFAULT 0,
      added INTEGER DEFAULT 0,
      updated INTEGER DEFAULT 0,
      duplicates INTEGER DEFAULT 0,
      errors INTEGER DEFAULT 0,
      details TEXT
    );
  `);

  // 3. Create indexes for performance
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_media_file_cloudinary_id ON media_file(cloudinary_public_id);
      CREATE INDEX IF NOT EXISTS idx_media_file_language ON media_file(language);
      CREATE INDEX IF NOT EXISTS idx_media_file_genre ON media_file(genre);
      CREATE INDEX IF NOT EXISTS idx_media_file_artist_id ON media_file(artist_id);
      CREATE INDEX IF NOT EXISTS idx_media_file_album_id ON media_file(album_id);
      CREATE INDEX IF NOT EXISTS idx_media_file_created_at ON media_file(created_at);
      CREATE INDEX IF NOT EXISTS idx_annotation_user_star ON annotation(user_id, item_id, starred);
      CREATE INDEX IF NOT EXISTS idx_scrobbles_time ON scrobbles(user_id, submission_time);
      CREATE INDEX IF NOT EXISTS idx_artist_slug ON artist(slug);
      CREATE INDEX IF NOT EXISTS idx_mfa_media_file_id ON media_file_artists(media_file_id);
      CREATE INDEX IF NOT EXISTS idx_mfa_artist_id ON media_file_artists(artist_id);
    `);
  } catch (err) {
    console.warn('[DB] Index creation note:', err.message);
  }

  // 4. Ensure FTS5 search table exists for media_file
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS spotkify_fts USING fts5(
        song_id UNINDEXED,
        title,
        artist,
        album,
        genre,
        language,
        search_keywords,
        tokenize = 'porter unicode61'
      );
    `);
  } catch (err) {
    console.warn('[DB] FTS5 table note:', err.message);
  }

  // 5. Ensure default admin user
  const adminUser = db.prepare("SELECT * FROM user WHERE user_name = 'admin'").get();
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    const userId = 'admin-user-id';
    db.prepare(`
      INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(userId, 'admin', 'Administrator', 'admin@spotkify.local', hashedPassword);
    console.log('[DB] Created default admin user (admin / admin123)');
  }
}

initSchema();

module.exports = db;
