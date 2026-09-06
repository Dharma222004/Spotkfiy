const assert = require('node:assert');

const BASE_URL = 'http://localhost:4534';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: json };
}

async function runTests() {
  console.log('==============================================');
  console.log('  SPOTKIFY AUTOMATED VERIFICATION SUITE');
  console.log('==============================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('API Health Check', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  // 2. Home Feed Discovery
  await test('Home Discovery Feed', async () => {
    const res = await request('/api/home');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.data.trending), 'Trending should be an array');
    assert(Array.isArray(res.data.data.popularArtists), 'Popular Artists should be an array');
    assert(Array.isArray(res.data.data.newAdditions), 'New Additions should be an array');
  });

  // 3. Songs catalog & pagination
  let sampleSong = null;
  await test('Songs Catalog & Pagination', async () => {
    const res = await request('/api/songs?page=1&limit=10');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.data), 'Catalog should return an array');
    if (res.data.data.length > 0) {
      sampleSong = res.data.data[0];
    }
  });

  // 4. Cloudinary Playback Authorization
  await test('Song Direct Playback Authorization', async () => {
    if (!sampleSong) {
      console.log('       (Skipping playback auth - library is clean, awaiting Cloudinary sync)');
      return;
    }
    const res = await request(`/api/songs/${sampleSong.id}/play`);
    assert.strictEqual(res.status, 200);
    assert(res.data.data.streamUrl, 'Should return streaming URL');
    assert.strictEqual(res.data.data.source, 'cloudinary_cdn');
  });

  // 5. Categorized Full-Text Search
  await test('FTS5 Categorized Search', async () => {
    const res = await request('/api/search?q=test');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.data.songs), 'Search songs should be an array');
    assert(Array.isArray(res.data.data.artists), 'Search artists should be an array');
    assert(Array.isArray(res.data.data.albums), 'Search albums should be an array');
  });

  // 6. Search Autocomplete Suggestions
  await test('Search Suggestions / Autocomplete', async () => {
    const res = await request('/api/search/suggestions?q=a');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.data), 'Suggestions should be an array');
  });

  // 7. Liked Songs (Like & Unlike)
  await test('Like and Unlike Song', async () => {
    if (!sampleSong) {
      console.log('       (Skipping like/unlike - library is clean, awaiting Cloudinary sync)');
      return;
    }
    // Like
    const likeRes = await request(`/api/library/liked/${sampleSong.id}`, { method: 'POST' });
    assert.strictEqual(likeRes.status, 200);
    assert.strictEqual(likeRes.data.status, 'liked');

    // Verify in liked list
    const listRes = await request('/api/library/liked');
    const found = listRes.data.data.some(s => s.id === sampleSong.id);
    assert(found, 'Liked song should appear in /api/library/liked');

    // Unlike
    const unlikeRes = await request(`/api/library/liked/${sampleSong.id}`, { method: 'DELETE' });
    assert.strictEqual(unlikeRes.status, 200);
  });

  // 8. Playback Analytics & Recently Played
  await test('Playback Analytics (30s Threshold) & Recently Played', async () => {
    if (!sampleSong) {
      console.log('       (Skipping playback analytics - library is clean, awaiting Cloudinary sync)');
      return;
    }
    // Send play under threshold (e.g. 10s without completed) -> should be ignored
    const ignoreRes = await request('/api/playback/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: sampleSong.id, durationPlayed: 10, completed: false })
    });
    assert.strictEqual(ignoreRes.data.status, 'ignored');

    // Send play over 30s threshold -> should record
    const recordRes = await request('/api/playback/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: sampleSong.id, durationPlayed: 32, completed: false })
    });
    assert.strictEqual(recordRes.data.status, 'recorded');

    // Check recently played
    const recRes = await request('/api/history/recently-played');
    assert(recRes.data.data.length > 0, 'Recently played should have items');
  });

  // 9. Playlist Management Lifecycle
  await test('Playlist Lifecycle (Create, Add Track, Remove Track, Delete)', async () => {
    // Create
    const createRes = await request('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Playlist 2026' })
    });
    assert.strictEqual(createRes.status, 201);
    const playlistId = createRes.data.data.id;

    if (sampleSong) {
      // Add track
      const addRes = await request(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: sampleSong.id })
      });
      assert.strictEqual(addRes.status, 200);

      // Verify track in playlist
      const getRes = await request(`/api/playlists/${playlistId}`);
      assert.strictEqual(getRes.data.data.tracks.length, 1);

      // Remove track
      const delTrackRes = await request(`/api/playlists/${playlistId}/songs/${sampleSong.id}`, { method: 'DELETE' });
      assert.strictEqual(delTrackRes.status, 200);
    }

    // Delete playlist
    const delRes = await request(`/api/playlists/${playlistId}`, { method: 'DELETE' });
    assert.strictEqual(delRes.status, 200);
  });

  // 10. Admin Metrics & Cloudinary Sync Logs
  await test('Admin Dashboard Metrics & Sync Logs', async () => {
    const dashRes = await request('/api/admin/dashboard');
    assert.strictEqual(dashRes.status, 200);
    assert(typeof dashRes.data.data.metrics.totalSongs === 'number');
    assert(typeof dashRes.data.data.metrics.totalArtists === 'number');

    const logsRes = await request('/api/admin/sync/logs');
    assert.strictEqual(logsRes.status, 200);
    assert(Array.isArray(logsRes.data.data), 'Sync logs should be an array');
  });

  console.log('\n==============================================');
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==============================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
