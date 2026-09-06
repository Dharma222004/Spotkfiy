const crypto = require('node:crypto');
const path = require('node:path');
const db = require('../db/database');
const cloudinaryService = require('./cloudinary');
const { normalizeStr, slugify, parseMetadataLine, loadAllMetadata } = require('./metadataParser');
const { resolveArtistImage, resolveSongCover } = require('./mediaArtwork');

/**
 * Generate stable IDs
 */
function makeId(prefix = 'song') {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

function getArtistImage(artistName, sampleCover = null) {
  return resolveArtistImage(artistName, sampleCover);
}

/**
 * Fallback parser for Cloudinary assets when not found in .txt metadata files
 */
function parseFromPublicId(publicId) {
  const parts = publicId.split('/');
  let filename = parts[parts.length - 1];
  filename = filename.replace(/\.[a-zA-Z0-9]+$/, ''); // remove extension

  // Protect duo names
  filename = filename.replace(/Vivek_-_Mervin/g, 'Vivek-Mervin');

  let artistPart = 'Various Artists';
  let titlePart = filename.replace(/_/g, ' ');
  let movie = null;

  if (filename.includes('_-_')) {
    const split = filename.split('_-_');
    artistPart = split[0].replace(/_/g, ' ').replace('Vivek-Mervin', 'Vivek - Mervin').trim();
    titlePart = split.slice(1).join(' - ').replace(/_/g, ' ').trim();
  } else if (filename.includes(' - ')) {
    const split = filename.split(' - ');
    artistPart = split[0].trim();
    titlePart = split.slice(1).join(' - ').trim();
  }

  // Check for movie in title e.g. "Railin Oligal - From Blue Star" or "Kanimaa From Retro"
  const fromMatch = titlePart.match(/[-_\s]*From\s+([A-Za-z0-9\s&]+)/i);
  if (fromMatch) {
    movie = fromMatch[1].trim();
    titlePart = titlePart.replace(fromMatch[0], '').trim();
  }

  let artists = [];
  if (artistPart.includes(',')) {
    artists = artistPart.split(',').map(a => a.trim()).filter(Boolean);
  } else {
    artists = [artistPart];
  }

  return {
    title: titlePart,
    artists,
    artistString: artists.join(', '),
    movie: movie,
    album: movie || 'Tamil Hits',
    language: 'Tamil'
  };
}

/**
 * Main synchronization engine
 */
async function syncCloudinaryCatalog(customFolder = 'Songs') {
  const folder = typeof customFolder === 'string' ? customFolder : (customFolder?.folder || 'Songs');

  console.log(`[Sync] Starting Cloudinary catalog sync for folder "${folder}"...`);
  const logId = db.prepare(`
    INSERT INTO cloudinary_sync_log (status, discovered, added, updated, duplicates, errors, details)
    VALUES ('RUNNING', 0, 0, 0, 0, 0, 'Sync in progress...')
  `).run().lastInsertRowid;

  let discovered = 0;
  let added = 0;
  let updated = 0;
  let duplicates = 0;
  let errors = 0;
  const errorDetails = [];

  try {
    if (!cloudinaryService.isConfigured()) {
      throw new Error('Cloudinary credentials are not configured in environment variables.');
    }

    // 1. Load all structured metadata from Meta Data directory
    console.log('[Sync] Loading metadata from Meta Data directory...');
    const metadataSongs = loadAllMetadata();

    // 2. Scan all audio files from Cloudinary
    console.log(`[Sync] Scanning Cloudinary audio resources in folder "${folder}"...`);
    const resources = await cloudinaryService.scanAllAudioResources(folder);
    discovered = resources.length;
    console.log(`[Sync] Discovered ${discovered} audio files in Cloudinary.`);

    // 3. Prepare Database Statements
    const findByPublicId = db.prepare('SELECT id, title, artist, album FROM media_file WHERE cloudinary_public_id = ?');

    const findArtistByName = db.prepare('SELECT id, name FROM artist WHERE LOWER(name) = LOWER(?)');
    const findArtistBySlug = db.prepare('SELECT id, name FROM artist WHERE slug = ?');
    const insertArtist = db.prepare(`
      INSERT INTO artist (id, name, slug, full_text, created_at, updated_at, large_image_url)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
    `);
    const updateArtistSlug = db.prepare('UPDATE artist SET slug = ?, large_image_url = ? WHERE id = ?');

    const findAlbum = db.prepare('SELECT id FROM album WHERE LOWER(name) = LOWER(?)');
    const insertAlbum = db.prepare(`
      INSERT INTO album (id, name, album_artist, album_artist_id, genre, song_count, duration, created_at, updated_at, large_image_url)
      VALUES (?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
    `);

    const insertSong = db.prepare(`
      INSERT INTO media_file (
        id, path, title, artist, artist_id, artists_json, album, album_id, album_artist, album_artist_id,
        duration, size, suffix, genre, language, year, has_cover_art,
        cloudinary_public_id, audio_url, cover_image_url, is_active,
        movie, slug, search_keywords, full_text, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, 1,
        ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    const updateSong = db.prepare(`
      UPDATE media_file SET
        title = ?, artist = ?, artist_id = ?, artists_json = ?, album = ?, album_id = ?,
        duration = ?, size = ?, genre = ?, language = ?, audio_url = ?, cover_image_url = ?,
        movie = ?, slug = ?, search_keywords = ?, full_text = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const deleteMediaArtists = db.prepare('DELETE FROM media_file_artists WHERE media_file_id = ?');
    const insertMediaArtist = db.prepare(`
      INSERT INTO media_file_artists (media_file_id, artist_id, role, sub_role)
      VALUES (?, ?, 'artist', '')
    `);

    const insertFts = db.prepare(`
      INSERT OR REPLACE INTO spotkify_fts (song_id, title, artist, album, genre, language, search_keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Helper to get or create artist
    function getOrCreateArtist(artistName, sampleCover = null) {
      const cleanName = artistName.trim();
      const slug = slugify(cleanName);
      let existing = findArtistByName.get(cleanName);
      if (!existing && slug) {
        existing = findArtistBySlug.get(slug);
      }

      const avatarUrl = getArtistImage(cleanName, sampleCover);

      if (existing) {
        updateArtistSlug.run(slug, avatarUrl, existing.id);
        return existing.id;
      }

      const artistId = makeId('art');
      insertArtist.run(artistId, cleanName, slug, cleanName.toLowerCase(), avatarUrl);
      return artistId;
    }

    // Helper to get or create album
    function getOrCreateAlbum(albumName, primaryArtistName, primaryArtistId, coverUrl) {
      if (!albumName) return null;
      const existing = findAlbum.get(albumName);
      if (existing) return existing.id;

      const albumId = makeId('alb');
      insertAlbum.run(
        albumId,
        albumName,
        primaryArtistName,
        primaryArtistId,
        'Soundtrack',
        210,
        coverUrl || getArtistImage(primaryArtistName)
      );
      return albumId;
    }

    // 4. Process each Cloudinary resource
    for (const res of resources) {
      try {
        const pubId = res.public_id;
        const normPubId = normalizeStr(pubId);

        // Extract title portion if formatted as Artists_-_Title
        let rawTitlePart = pubId;
        let rawArtistPart = '';
        if (pubId.includes('_-_')) {
          const parts = pubId.split('_-_');
          rawArtistPart = parts[0];
          rawTitlePart = parts.slice(1).join('_-_');
        } else if (pubId.includes(' - ')) {
          const parts = pubId.split(' - ');
          rawArtistPart = parts[0];
          rawTitlePart = parts.slice(1).join(' - ');
        }

        const cleanTitlePart = rawTitlePart.replace(/_from_.*$/i, '').replace(/ - from .*$/i, '');
        const normTitlePart = normalizeStr(cleanTitlePart);
        const normArtistPart = normalizeStr(rawArtistPart);

        // A. Match against parsed metadata with artist verification
        let matchedMeta = null;

        for (const meta of metadataSongs) {
          const normTitle = normalizeStr(meta.title);
          if (!normTitle || normTitle.length < 2) continue;

          // Check if title matches
          const titleMatches = (normTitlePart === normTitle) ||
            (normTitle.length >= 3 && new RegExp('(?:^|\\s|_)' + normTitle.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(?:$|\\s|_)', 'i').test(normTitlePart));

          if (titleMatches) {
            if (rawArtistPart) {
              const hasArtistMatch = meta.artists.some(a => {
                const normA = normalizeStr(a);
                return normA.length >= 3 && normArtistPart.includes(normA);
              });
              if (hasArtistMatch) {
                matchedMeta = meta;
                break;
              }
            } else {
              matchedMeta = meta;
              break;
            }
          }
        }

        // Secondary match: Check if public ID contains normalized title (min 4 chars) and an artist matches
        if (!matchedMeta && rawArtistPart) {
          for (const meta of metadataSongs) {
            const normTitle = normalizeStr(meta.title);
            if (!normTitle || normTitle.length < 4) continue;
            if (normPubId.includes(normTitle)) {
              const hasArtistMatch = meta.artists.some(a => {
                const normA = normalizeStr(a);
                return normA.length >= 3 && normArtistPart.includes(normA);
              });
              if (hasArtistMatch) {
                matchedMeta = meta;
                break;
              }
            }
          }
        }

        // B. Fallback to parsing publicId directly
        if (!matchedMeta) {
          matchedMeta = parseFromPublicId(pubId);
        }

        // Final structured metadata
        const title = matchedMeta.title;
        const artists = matchedMeta.artists && matchedMeta.artists.length > 0
          ? matchedMeta.artists
          : ['Various Artists'];
        const artistString = artists.join(', ');
        const movie = matchedMeta.movie || null;
        const album = matchedMeta.album || movie || 'Tamil Hits';
        const language = matchedMeta.language || 'Tamil';
        const slug = slugify(title);

        // Playback details
        const audioUrl = res.secure_url || cloudinaryService.getAudioStreamUrl(pubId);
        const duration = Math.round(Number(res.duration) || 210);
        const size = Number(res.bytes) || 5000000;
        const format = res.format || 'mp3';
        const coverImageUrl = resolveSongCover(title, movie, artists[0]);

        // Manage Artists
        const artistIds = artists.map(a => getOrCreateArtist(a, coverImageUrl));
        const primaryArtistId = artistIds[0];

        // Manage Album
        const albumId = getOrCreateAlbum(album, artists[0], primaryArtistId, coverImageUrl);

        const keywords = `${title} ${artists.join(' ')} ${album} ${movie || ''} ${language}`.toLowerCase();
        const artistsJson = JSON.stringify(artists);

        // Check if existing record exists strictly by public_id
        const existingByPub = findByPublicId.get(pubId);
        const targetSongId = existingByPub ? existingByPub.id : null;

        if (targetSongId) {
          // UPDATE
          updateSong.run(
            title,
            artistString,
            primaryArtistId,
            artistsJson,
            album,
            albumId,
            duration,
            size,
            'Soundtrack',
            language,
            audioUrl,
            coverImageUrl,
            movie,
            slug,
            keywords,
            keywords,
            targetSongId
          );

          // Update junction table
          deleteMediaArtists.run(targetSongId);
          for (const aId of artistIds) {
            insertMediaArtist.run(targetSongId, aId);
          }

          insertFts.run(targetSongId, title, artistString, album, 'Soundtrack', language, keywords);
          updated++;
        } else {
          // INSERT NEW
          const newSongId = makeId('track');
          insertSong.run(
            newSongId,
            pubId,
            title,
            artistString,
            primaryArtistId,
            artistsJson,
            album,
            albumId,
            artists[0],
            primaryArtistId,
            duration,
            size,
            format,
            'Soundtrack',
            language,
            new Date(res.created_at || Date.now()).getFullYear(),
            1,
            pubId,
            audioUrl,
            coverImageUrl,
            movie,
            slug,
            keywords,
            keywords
          );

          // Insert into junction table for each credited artist
          for (const aId of artistIds) {
            insertMediaArtist.run(newSongId, aId);
          }

          insertFts.run(newSongId, title, artistString, album, 'Soundtrack', language, keywords);
          added++;
        }
      } catch (itemErr) {
        errors++;
        errorDetails.push(`Error on ${res.public_id}: ${itemErr.message}`);
        console.error(`[Sync] Error processing resource ${res.public_id}:`, itemErr.message);
      }
    }

    const summary = `Completed: Discovered ${discovered}, Added ${added}, Updated ${updated}, Duplicates ${duplicates}, Errors ${errors}.`;
    db.prepare(`
      UPDATE cloudinary_sync_log SET
        completed_at = CURRENT_TIMESTAMP,
        status = 'SUCCESS',
        discovered = ?,
        added = ?,
        updated = ?,
        duplicates = ?,
        errors = ?,
        details = ?
      WHERE id = ?
    `).run(discovered, added, updated, duplicates, errors, summary, logId);

    console.log(`[Sync] Finished successfully: ${summary}`);
    return {
      discovered,
      added,
      updated,
      duplicates,
      errors,
      details: summary
    };
  } catch (err) {
    console.error('[Sync] Fatal error during sync:', err);
    db.prepare(`
      UPDATE cloudinary_sync_log SET
        completed_at = CURRENT_TIMESTAMP,
        status = 'FAILED',
        details = ?
      WHERE id = ?
    `).run(`Fatal Error: ${err.message}`, logId);
    throw err;
  }
}

/**
 * Auto-Sync Engine:
 * Ensures catalog is fresh. Automatically runs on cold start or if cache is older than 2 minutes.
 */
let lastSyncTime = 0;
let isSyncing = false;
const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

async function ensureFreshCatalog(force = false) {
  try {
    const countRow = db.prepare('SELECT COUNT(*) as c FROM media_file WHERE is_active = 1').get();
    const count = countRow ? countRow.c : 0;

    if (count === 0) {
      console.log('[AutoSync] Database has 0 songs. Running initial sync synchronously...');
      const res = await syncCloudinaryCatalog('Songs');
      lastSyncTime = Date.now();
      return res;
    }

    const now = Date.now();
    if ((now - lastSyncTime > AUTO_SYNC_INTERVAL_MS || force) && !isSyncing) {
      isSyncing = true;
      console.log('[AutoSync] Revalidating Cloudinary catalog in background...');
      syncCloudinaryCatalog('Songs')
        .then(res => {
          lastSyncTime = Date.now();
          console.log(`[AutoSync] Background sync complete: ${res.discovered} discovered (${res.added} added, ${res.updated} updated).`);
        })
        .catch(err => {
          console.warn('[AutoSync] Background sync error:', err.message);
        })
        .finally(() => {
          isSyncing = false;
        });
    }
  } catch (e) {
    console.warn('[AutoSync] Check error:', e.message);
  }
}

module.exports = {
  syncCloudinaryCatalog,
  ensureFreshCatalog,
  getArtistImage,
  parseFromPublicId
};
