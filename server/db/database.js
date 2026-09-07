const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const bcrypt = require('bcryptjs');

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
let dbPath;

if (isVercel) {
  dbPath = path.join('/tmp', 'spotkify.db');
  // Copy seed db if it exists in bundle and not in /tmp
  const seedPath = path.resolve(process.cwd(), 'data', 'navidrome.db');
  if (!fs.existsSync(dbPath) && fs.existsSync(seedPath)) {
    try {
      fs.copyFileSync(seedPath, dbPath);
      console.log('[DB] Copied seed database to /tmp/spotkify.db');
    } catch (e) {
      console.warn('[DB] Could not copy seed db:', e.message);
    }
  }
} else {
  dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : path.resolve(process.cwd(), 'data', 'navidrome.db');
}

// Ensure parent dir exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (err) {
  console.warn('[DB] Pragmas note:', err.message);
}

function initSchema() {
  // 1. Create Core Tables if they do not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id VARCHAR(255) PRIMARY KEY,
      user_name VARCHAR(255) UNIQUE,
      name VARCHAR(255),
      email VARCHAR(255),
      password VARCHAR(255),
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artist (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      slug VARCHAR(255),
      full_text TEXT,
      large_image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS album (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      album_artist VARCHAR(255),
      album_artist_id VARCHAR(255),
      genre VARCHAR(100),
      song_count INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      large_image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_file (
      id VARCHAR(255) PRIMARY KEY,
      path TEXT,
      title VARCHAR(255),
      artist VARCHAR(255),
      artist_id VARCHAR(255),
      artists_json TEXT,
      album VARCHAR(255),
      album_id VARCHAR(255),
      album_artist VARCHAR(255),
      album_artist_id VARCHAR(255),
      duration INTEGER DEFAULT 0,
      size INTEGER DEFAULT 0,
      suffix VARCHAR(20),
      genre VARCHAR(100),
      language VARCHAR(100),
      year INTEGER,
      has_cover_art BOOLEAN DEFAULT 1,
      cloudinary_public_id VARCHAR(255),
      audio_url TEXT,
      cover_image_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      movie VARCHAR(255),
      folder VARCHAR(255),
      slug VARCHAR(255),
      search_keywords TEXT,
      full_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_file_artists (
      media_file_id VARCHAR(255),
      artist_id VARCHAR(255),
      role VARCHAR(50) DEFAULT 'artist',
      sub_role VARCHAR(50) DEFAULT '',
      PRIMARY KEY (media_file_id, artist_id)
    );

    CREATE TABLE IF NOT EXISTS annotation (
      user_id VARCHAR(255),
      item_id VARCHAR(255),
      item_type VARCHAR(50) DEFAULT 'media_file',
      starred BOOLEAN DEFAULT 0,
      starred_at DATETIME,
      rating INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      play_date DATETIME,
      PRIMARY KEY (user_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS scrobbles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id VARCHAR(255),
      media_file_id VARCHAR(255),
      submission_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS playlist (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      comment TEXT,
      duration INTEGER DEFAULT 0,
      song_count INTEGER DEFAULT 0,
      public BOOLEAN DEFAULT 1,
      owner_id VARCHAR(255),
      uploaded_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id VARCHAR(255) NOT NULL,
      media_file_id VARCHAR(255) NOT NULL
    );
  `);

  // 2. Inspect media_file columns and add any missing dynamically
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
    { name: 'folder', type: 'VARCHAR(255)' },
    { name: 'slug', type: 'VARCHAR(255)' }
  ];

  for (const col of columnsToAdd) {
    if (!existingCols.has(col.name)) {
      try {
        db.exec(`ALTER TABLE media_file ADD COLUMN ${col.name} ${col.type};`);
      } catch (err) {}
    }
  }

  // 3. Ensure artist slug, and user last_login_at column
  const existingArtistCols = new Set(
    db.prepare("PRAGMA table_info(artist)").all().map(c => c.name)
  );
  if (!existingArtistCols.has('slug')) {
    try {
      db.exec('ALTER TABLE artist ADD COLUMN slug VARCHAR(255);');
    } catch (err) {}
  }

  const existingUserCols = new Set(
    db.prepare("PRAGMA table_info(user)").all().map(c => c.name)
  );
  if (!existingUserCols.has('last_login_at')) {
    try {
      db.exec('ALTER TABLE user ADD COLUMN last_login_at DATETIME;');
    } catch (err) {}
  }

  // 4. Create indexes for high-speed queries
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
      CREATE INDEX IF NOT EXISTS idx_playlist_owner ON playlist(owner_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_tracks_pl ON playlist_tracks(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_tracks_mf ON playlist_tracks(media_file_id);
      CREATE INDEX IF NOT EXISTS idx_media_file_folder ON media_file(folder);
    `);
  } catch (err) {}

  // 5. Ensure FTS5 search table exists
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
  } catch (err) {}

  // 6. Ensure default admin and sharu demo users
  try {
    const adminUser = db.prepare("SELECT * FROM user WHERE user_name = 'admin'").get();
    const salt = bcrypt.genSaltSync(10);
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      db.prepare(`
        INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
        VALUES ('admin-user-id', 'admin', 'Administrator', 'admin@spotkify.local', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(hashedPassword);
    }

    const sharuUser = db.prepare("SELECT * FROM user WHERE user_name = 'sharu'").get();
    if (!sharuUser) {
      const sharuHashed = bcrypt.hashSync('sharu@123', salt);
      db.prepare(`
        INSERT INTO user (id, user_name, name, email, password, is_admin, created_at, updated_at)
        VALUES ('sharu-user-id', 'sharu', 'Sharu', 'sharu@spotkify.local', ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(sharuHashed);
    }
  } catch (err) {
    console.warn('[DB] User seeding note:', err.message);
  }
}

initSchema();

module.exports = db;
