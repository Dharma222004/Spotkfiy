const crypto = require('node:crypto');
const path = require('node:path');
const db = require('../db/database');
const cloudinaryService = require('./cloudinary');
const { normalizeStr, slugify, parseMetadataLine, loadAllMetadata } = require('./metadataParser');

/**
 * Generate stable IDs
 */
function makeId(prefix = 'song') {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Artist curated profile artwork dictionary
 */
const ARTIST_IMAGES = {
  'anirudh ravichander': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'a.r. rahman': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'yuvan shankar raja': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'santhosh narayanan': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'sid sriram': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'pradeep kumar': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  'dhee': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'harris jayaraj': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
  'g. v. prakash': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'shakthisree gopalan': 'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=600&auto=format&fit=crop&q=80',
  'sam c.s.': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  'sai abhyankkar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  'shreya ghoshal': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
  'chinmayi': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  'vivek': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
  'dhanush': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
  'dhibu ninan thomas': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
  'govind vasantha': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80'
};

function getArtistImage(artistName) {
  const norm = (artistName || '').toLowerCase().trim();
  if (ARTIST_IMAGES[norm]) return ARTIST_IMAGES[norm];

  // Hash-based aesthetic artist avatars
  const fallbacks = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80'
  ];
  const hash = Math.abs(norm.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  return fallbacks[hash % fallbacks.length];
}

/**
 * Fallback parser for Cloudinary assets when not found in .txt metadata files
 * Handles patterns like:
 * "Santhosh_Narayanan_Pradeep_Kumar_Priya_Hemesh_Vivek_-_Aval"
 * "Govind_Vasantha_Pradeep_Kumar_Shakthisree_Gopalan_-_Railin_Oligal_-_From_Blue_Star"
 * "Justin_Prabhakaran_-_Adiyae_Azhagae_-_From_Oru_Naal_Koothu"
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

  // Parse artists into individual items
  // If artistPart has no commas but multiple capital-cased words or underscores
  let artists = [];
  if (artistPart.includes(',')) {
    artists = artistPart.split(',').map(a => a.trim()).filter(Boolean);
  } else {
    // Single artist or space-joined list
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
  const folder = customFolder || 'Songs';

  const syncLogStmt = db.prepare(`
    INSERT INTO cloudinary_sync_log (started_at, status, details)
    VALUES (CURRENT_TIMESTAMP, 'RUNNING', ?)
  `);
  const logResult = syncLogStmt.run(`Starting scan on Cloudinary folder: "${folder}" with Meta Data integration`);
  const logId = logResult.lastInsertRowid;

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
    const findByTitle = db.prepare('SELECT id FROM media_file WHERE LOWER(title) = LOWER(?)');

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
    function getOrCreateArtist(artistName) {
      const cleanName = artistName.trim();
      const slug = slugify(cleanName);
      let existing = findArtistByName.get(cleanName);
      if (!existing && slug) {
        existing = findArtistBySlug.get(slug);
      }

      if (existing) {
        // Update slug and avatar if missing
        updateArtistSlug.run(slug, getArtistImage(cleanName), existing.id);
        return existing.id;
      }

      const artistId = makeId('art');
      const avatarUrl = getArtistImage(cleanName);
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

        // A. Match against parsed metadata
        let matchedMeta = null;

        for (const meta of metadataSongs) {
          const normTitle = normalizeStr(meta.title);
          if (!normTitle || normTitle.length < 3) continue;

          // Check if publicId contains normalized title
          if (normPubId.includes(normTitle)) {
            matchedMeta = meta;
            break;
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
        const coverImageUrl = getArtistImage(artists[0]);

        // Manage Artists
        const artistIds = artists.map(a => getOrCreateArtist(a));
        const primaryArtistId = artistIds[0];

        // Manage Album
        const albumId = getOrCreateAlbum(album, artists[0], primaryArtistId, coverImageUrl);

        const keywords = `${title} ${artists.join(' ')} ${album} ${movie || ''} ${language}`.toLowerCase();
        const artistsJson = JSON.stringify(artists);

        // Check if existing record exists by public_id or title
        const existingByPub = findByPublicId.get(pubId);
        const existingByTitle = !existingByPub ? findByTitle.get(title) : null;
        const targetSongId = existingByPub ? existingByPub.id : (existingByTitle ? existingByTitle.id : null);

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

module.exports = {
  syncCloudinaryCatalog,
  getArtistImage
};
