const db = require('../db/database');

console.log('Clearing all default songs and related metadata...');

const tablesToClear = [
  'media_file',
  'media_file_artists',
  'album',
  'album_artists',
  'artist',
  'tag',
  'library_tag',
  'library_artist',
  'annotation',
  'scrobbles',
  'playlist_tracks',
  'playlist',
  'spotkify_fts',
  'media_file_fts',
  'album_fts',
  'artist_fts',
  'cloudinary_sync_log'
];

for (const table of tablesToClear) {
  try {
    db.prepare(`DELETE FROM ${table}`).run();
    console.log(`[Cleared] ${table}`);
  } catch (err) {
    console.warn(`[Skip] ${table}:`, err.message);
  }
}

// Reset SQLite sequence if exists
try {
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('media_file', 'cloudinary_sync_log', 'playlist_tracks')").run();
} catch (e) {}

console.log('All default songs, albums, and artists have been purged successfully.');
console.log('Database is clean and ready for Cloudinary synchronization.');
