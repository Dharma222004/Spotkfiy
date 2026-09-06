// ==========================================================================
// SPOTKIFY – AUTHENTIC SPOTIFY WEB PLAYER ENGINE
// ==========================================================================
(function () {
  'use strict';

  // State
  let allSongs = [];
  let homeData = null;
  let currentPlaylist = [];
  let currentTrackIndex = -1;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;
  let currentRoute = 'home';
  let queue = [];
  let isRightPanelOpen = true;

  // Audio Engine
  const audio = document.getElementById('spotifyAudioEngine');

  // DOM Navigation & Views
  const viewHome = document.getElementById('viewHome');
  const viewPlaylist = document.getElementById('viewPlaylist');
  const viewSearch = document.getElementById('viewSearch');
  const viewArtist = document.getElementById('viewArtist');
  const mainScrollView = document.getElementById('mainScrollView');
  const topbar = document.getElementById('topbar');
  const ambientMesh = document.getElementById('ambientMesh');

  // Artist View DOM
  const artistHeroBackdrop = document.getElementById('artistHeroBackdrop');
  const artistViewName = document.getElementById('artistViewName');
  const artistViewStats = document.getElementById('artistViewStats');
  const btnArtistPlayAll = document.getElementById('btnArtistPlayAll');
  const btnArtistFollow = document.getElementById('btnArtistFollow');
  const artistTrackRows = document.getElementById('artistTrackRows');
  let currentArtistSongs = [];
  let currentArtist = null;

  // Sidebar & Shelves
  const greetingTitle = document.getElementById('greetingTitle');
  const quickPicksGrid = document.getElementById('quickPicksGrid');
  const trendingShelf = document.getElementById('trendingShelf');
  const artistsShelf = document.getElementById('artistsShelf');
  const albumsShelf = document.getElementById('albumsShelf');
  const libraryShelf = document.getElementById('libraryShelf');
  const dynamicLibraryList = document.getElementById('dynamicLibraryList');
  const libLikedCount = document.getElementById('libLikedCount');
  const libAllTracksCount = document.getElementById('libAllTracksCount');

  // Mobile Spotify DOM
  const btnMobileUserAvatar = document.getElementById('btnMobileUserAvatar');
  const mobileHeaderChips = document.getElementById('mobileHeaderChips');
  const startListeningList = document.getElementById('startListeningList');
  const favouriteArtistsShelf = document.getElementById('favouriteArtistsShelf');
  const spotifyPlayerBar = document.getElementById('spotifyPlayerBar');
  const mobilePlayerTopLabel = document.getElementById('mobilePlayerTopLabel');
  const mobilePlayerTopText = document.getElementById('mobilePlayerTopText');
  const mobileMiniPlayBtn = document.getElementById('mobileMiniPlayBtn');
  const mobileBarPlaySvg = document.getElementById('mobileBarPlaySvg');
  const mobileBarPauseSvg = document.getElementById('mobileBarPauseSvg');
  const mobileMiniProgressFill = document.getElementById('mobileMiniProgressFill');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  const mobileAddBtn = document.getElementById('mobileAddBtn');
  const mobileAddSvgPlus = document.getElementById('mobileAddSvgPlus');
  const mobileAddSvgCheck = document.getElementById('mobileAddSvgCheck');
  const mobileDeviceBadge = document.getElementById('mobileDeviceBadge');
  const mobileDeviceName = document.getElementById('mobileDeviceName');

  // Mobile Bottom Sheets & Modals
  const devicePickerSheet = document.getElementById('devicePickerSheet');
  const btnCloseDeviceSheet = document.getElementById('btnCloseDeviceSheet');
  const deviceSheetBackdrop = document.getElementById('deviceSheetBackdrop');
  const deviceListGroup = document.getElementById('deviceListGroup');

  const premiumSheet = document.getElementById('premiumSheet');
  const btnClosePremiumSheet = document.getElementById('btnClosePremiumSheet');
  const premiumSheetBackdrop = document.getElementById('premiumSheetBackdrop');
  const btnGetPremium = document.getElementById('btnGetPremium');

  const createSheet = document.getElementById('createSheet');
  const btnCloseCreateSheet = document.getElementById('btnCloseCreateSheet');
  const createSheetBackdrop = document.getElementById('createSheetBackdrop');
  const btnCreateNewPlaylist = document.getElementById('btnCreateNewPlaylist');
  const btnCreateBlend = document.getElementById('btnCreateBlend');

  const trackContextSheet = document.getElementById('trackContextSheet');
  const contextSheetBackdrop = document.getElementById('contextSheetBackdrop');
  const contextTrackCover = document.getElementById('contextTrackCover');
  const contextTrackTitle = document.getElementById('contextTrackTitle');
  const contextTrackArtist = document.getElementById('contextTrackArtist');
  const btnContextLike = document.getElementById('btnContextLike');
  const btnContextLikeText = document.getElementById('btnContextLikeText');
  const btnContextAddToPlaylist = document.getElementById('btnContextAddToPlaylist');
  const btnContextViewArtist = document.getElementById('btnContextViewArtist');
  const btnContextShare = document.getElementById('btnContextShare');
  let currentContextSong = null;

  // Playlist View DOM
  const playlistTitle = document.getElementById('playlistTitle');
  const playlistDesc = document.getElementById('playlistDesc');
  const playlistCoverImg = document.getElementById('playlistCoverImg');
  const playlistTrackCount = document.getElementById('playlistTrackCount');
  const playlistTotalDuration = document.getElementById('playlistTotalDuration');
  const playlistTrackRows = document.getElementById('playlistTrackRows');
  const btnBigPlay = document.getElementById('btnBigPlay');
  const btnPlaylistHeart = document.getElementById('btnPlaylistHeart');
  const btnShufflePlaylist = document.getElementById('btnShufflePlaylist');

  // Search DOM
  const mainSearchWrap = document.getElementById('mainSearchWrap');
  const searchInput = document.getElementById('spotifySearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const searchBrowseTiles = document.getElementById('searchBrowseTiles');
  const searchResultsSection = document.getElementById('searchResultsSection');
  const topResultCard = document.getElementById('topResultCard');
  const searchMiniRows = document.getElementById('searchMiniRows');
  const searchTableRows = document.getElementById('searchTableRows');

  // Right Panel DOM
  const rightSidebar = document.getElementById('rightSidebar');
  const spotifyApp = document.querySelector('.spotify-app');
  const btnCloseRightPanel = document.getElementById('btnCloseRightPanel');
  const nowPlayingView = document.getElementById('nowPlayingView');
  const queueView = document.getElementById('queueView');
  const rightCoverImg = document.getElementById('rightCoverImg');
  const rightTrackName = document.getElementById('rightTrackName');
  const rightArtistName = document.getElementById('rightArtistName');
  const rightArtistCardName = document.getElementById('rightArtistCardName');
  const rightArtistBio = document.getElementById('rightArtistBio');
  const nextQueueRow = document.getElementById('nextQueueRow');
  const queueNowPlayingRow = document.getElementById('queueNowPlayingRow');
  const queueUpcomingRows = document.getElementById('queueUpcomingRows');
  const btnOpenFullQueue = document.getElementById('btnOpenFullQueue');

  // Bottom Player Bar DOM
  const barThumb = document.getElementById('barThumb');
  const barTitle = document.getElementById('barTitle');
  const barArtist = document.getElementById('barArtist');
  const barHeartBtn = document.getElementById('barHeartBtn');
  const soundwaveIndicator = document.getElementById('soundwaveIndicator');

  const barBtnPlayPause = document.getElementById('barBtnPlayPause');
  const barPlaySvg = document.getElementById('barPlaySvg');
  const barPauseSvg = document.getElementById('barPauseSvg');
  const barBtnPrev = document.getElementById('barBtnPrev');
  const barBtnNext = document.getElementById('barBtnNext');
  const barBtnShuffle = document.getElementById('barBtnShuffle');
  const barBtnRepeat = document.getElementById('barBtnRepeat');

  const barCurrentTime = document.getElementById('barCurrentTime');
  const barTotalTime = document.getElementById('barTotalTime');
  const seekBar = document.getElementById('seekBar');
  const progressFillBar = document.getElementById('progressFillBar');
  const progressHandle = document.getElementById('progressHandle');

  const barBtnMute = document.getElementById('barBtnMute');
  const volSvgHigh = document.getElementById('volSvgHigh');
  const volSvgMute = document.getElementById('volSvgMute');
  const volBar = document.getElementById('volBar');
  const volumeFillBar = document.getElementById('volumeFillBar');
  const volumeHandle = document.getElementById('volumeHandle');
  let currentVolume = 0.8;
  let currentSong = null;
  let currentRightPanelTab = null;
  let isSeeking = false;
  let isVolDragging = false;

  const btnToggleNowPlaying = document.getElementById('btnToggleNowPlaying');
  const btnToggleQueue = document.getElementById('btnToggleQueue');
  const btnFullscreen = document.getElementById('btnFullscreen');

  // Fullscreen Modal DOM
  const fullscreenModal = document.getElementById('fullscreenModal');
  const fsBackdrop = document.getElementById('fsBackdrop');
  const fsCoverImg = document.getElementById('fsCoverImg');
  const fsTrackTitle = document.getElementById('fsTrackTitle');
  const fsArtistName = document.getElementById('fsArtistName');
  const fsAlbumName = document.getElementById('fsAlbumName');
  const btnCloseFullscreen = document.getElementById('btnCloseFullscreen');

  // Library & Sync Buttons
  const btnSyncCloudinary = document.getElementById('btnSyncCloudinary');
  const toastContainer = document.getElementById('toastContainer');

  // Format seconds to mm:ss
  function formatDuration(sec) {
    if (isNaN(sec) || sec === null || sec === undefined || sec <= 0) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Toast Notification
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'spotify-toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // Dynamic Time Greeting
  function updateGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      greetingTitle.textContent = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greetingTitle.textContent = 'Good afternoon';
    } else {
      greetingTitle.textContent = 'Good evening';
    }
  }

  // Ambient mesh color palettes based on songs
  const ambientGradients = [
    'linear-gradient(180deg, #1b4d2e 0%, rgba(18, 18, 18, 0) 100%)',
    'linear-gradient(180deg, #4c1d68 0%, rgba(18, 18, 18, 0) 100%)',
    'linear-gradient(180deg, #1e3a68 0%, rgba(18, 18, 18, 0) 100%)',
    'linear-gradient(180deg, #6b2d18 0%, rgba(18, 18, 18, 0) 100%)',
    'linear-gradient(180deg, #1a4f5c 0%, rgba(18, 18, 18, 0) 100%)',
    'linear-gradient(180deg, #594d1b 0%, rgba(18, 18, 18, 0) 100%)'
  ];

  function setAmbientColor(seed) {
    const idx = Math.abs((seed || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % ambientGradients.length;
    ambientMesh.style.background = ambientGradients[idx];
  }

  // Multi-artist parsing and clickable links
  function getSongArtists(song) {
    if (Array.isArray(song.artists) && song.artists.length > 0) return song.artists;
    if (typeof song.artists === 'string') {
      try {
        const parsed = JSON.parse(song.artists);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (song.artist) {
      return song.artist.split(',').map(a => a.trim()).filter(Boolean);
    }
    return ['Artist'];
  }

  function renderArtistLinksHtml(song) {
    const artists = getSongArtists(song);
    return artists.map(art => {
      const safe = art.replace(/"/g, '&quot;');
      return `<span class="artist-link-item" data-artist="${safe}">${art}</span>`;
    }).join(', ');
  }

  function attachArtistLinkListeners(container) {
    if (!container) return;
    container.querySelectorAll('.artist-link-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const art = el.getAttribute('data-artist');
        if (art) openArtistView(art);
      });
    });
  }

  // ==========================================================================
  // API LOADERS
  // ==========================================================================
  let isAppInitialized = false;

  async function initAppData() {
    if (isAppInitialized) return;
    isAppInitialized = true;
    updateGreeting();
    try {
      // 1. Fetch Home Feed
      const homeRes = await fetch('/api/home');
      const homeJson = await homeRes.json();
      homeData = (homeJson && homeJson.data) || {};

      // 2. Fetch All Songs (Dynamically derived from Cloudinary & Metadata)
      const songsRes = await fetch('/api/songs?limit=500');
      const songsJson = await songsRes.json();
      allSongs = (songsJson && songsJson.data) || [];
      if (libAllTracksCount) libAllTracksCount.textContent = allSongs.length;

      currentPlaylist = [...allSongs];

      if (allSongs.length > 0) {
        currentTrackIndex = 0;
        loadTrackIntoPlayerBar(allSongs[0]);
      }
      updateVolumeUI(currentVolume);

      renderHomeView();
      renderSidebarPlaylists();
    } catch (err) {
      console.error('Failed to load initial Spotify data:', err);
      showToast('Error loading songs from server');
    }
  }

  // ==========================================================================
  // RENDER HOME VIEW
  // ==========================================================================
  function renderHomeView() {
    const quickPicks = (homeData && homeData.quickPicks && homeData.quickPicks.length > 0)
      ? homeData.quickPicks.slice(0, 6)
      : allSongs.slice(0, 6);

    // 0. Render Mobile "Start listening" Section (Matching Spotify mobile layout!)
    if (startListeningList) {
      const featuredKeywords = ['othaiyadi', 'oorum blood', 'thangamey', 'bae', 'kannamma', 'usuru', 'yennai maatrum', 'railin', 'pottala', 'mogathirai', 'maya nadhi', 'aval'];
      const featured = [];
      for (const kw of featuredKeywords) {
        const found = allSongs.find(s => (s.title || '').toLowerCase().includes(kw));
        if (found && !featured.some(f => f.id === found.id)) featured.push(found);
      }
      for (const s of allSongs) {
        if (featured.length >= 12) break;
        if (!featured.some(f => f.id === s.id)) featured.push(s);
      }

      const activeSongId = (currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].id) || (allSongs[0] && allSongs[0].id);

      startListeningList.innerHTML = featured.map(song => {
        const isCurrent = song.id === activeSongId;
        const prefix = isCurrent && isPlaying ? '<span class="playing-dot-prefix" style="color:#1ed760; font-weight:800; margin-right:4px;">...</span>' : '';
        return `
          <div class="mobile-track-row" data-song-id="${song.id}">
            <img class="mobile-track-cover" src="${song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'}" alt="${song.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'">
            <div class="mobile-track-info">
              <span class="mobile-track-title ${isCurrent ? 'active' : ''}">${prefix}${song.title}</span>
              <span class="mobile-track-artist">${song.artist}</span>
            </div>
            <button class="mobile-track-more-btn" title="Options" data-song-id="${song.id}">⋮</button>
          </div>
        `;
      }).join('');

      startListeningList.querySelectorAll('.mobile-track-row').forEach(row => {
        row.addEventListener('click', (e) => {
          const id = row.getAttribute('data-song-id');
          const song = allSongs.find(s => s.id === id);
          if (e.target.closest('.mobile-track-more-btn')) {
            e.stopPropagation();
            if (song) openTrackContextSheet(song);
            return;
          }
          playTrackById(id, featured.concat(allSongs.filter(s => !featured.some(f => f.id === s.id))));
        });
      });
    }

    // 0.1 Render Mobile "Your favourite artists" Circular Shelf (Matching Spotify mobile layout!)
    if (favouriteArtistsShelf) {
      const allArtists = (homeData && homeData.popularArtists && homeData.popularArtists.length > 0)
        ? homeData.popularArtists
        : [];
      
      const priorityOrder = ['Vivek', 'Anirudh Ravichander', 'Sid Sriram', 'Santhosh Narayanan', 'Yuvan Shankar Raja', 'Pradeep Kumar', 'A.R. Rahman', 'Dhanush', 'Shreya Ghoshal', 'G. V. Prakash', 'Harris Jayaraj', 'Ilaiyaraaja'];
      const favList = [];
      for (const p of priorityOrder) {
        const found = allArtists.find(a => a.name.toLowerCase() === p.toLowerCase() || a.name.toLowerCase().includes(p.toLowerCase()));
        if (found && !favList.some(fa => fa.name === found.name)) {
          favList.push(found);
        }
      }
      for (const a of allArtists) {
        if (!favList.some(fa => fa.name === a.name)) favList.push(a);
      }

      favouriteArtistsShelf.innerHTML = favList.slice(0, 12).map(art => `
        <div class="favourite-artist-card" data-slug="${art.slug || art.name}" data-artist="${art.name}">
          <img class="favourite-artist-img" src="${art.large_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}" alt="${art.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'">
          <span class="favourite-artist-name">${art.name}</span>
        </div>
      `).join('');

      favouriteArtistsShelf.querySelectorAll('.favourite-artist-card').forEach(card => {
        card.addEventListener('click', () => {
          const slug = card.getAttribute('data-slug') || card.getAttribute('data-artist');
          openArtistView(slug);
        });
      });
    }

    // 1. Quick Picks Grid (6 items)
    quickPicksGrid.innerHTML = quickPicks.map((song, idx) => `
      <div class="quick-pick-card" data-song-id="${song.id}">
        <img class="qp-cover" src="${song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'}" alt="${song.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'">
        <span class="qp-title">${song.title}</span>
        <button class="qp-play-btn" title="Play ${song.title}">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
    `).join('');

    quickPicksGrid.querySelectorAll('.quick-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-song-id');
        playTrackById(id, quickPicks);
      });
    });

    // 2. Trending Shelf
    const trending = (homeData && homeData.trending && homeData.trending.length > 0)
      ? homeData.trending
      : allSongs.slice(0, 8);

    trendingShelf.innerHTML = trending.map(song => createSpotifyCardHtml(song)).join('');
    attachCardListeners(trendingShelf, trending);

    // 3. Popular Artists Shelf (Dynamically derived from Metadata & Cloudinary)
    const artists = (homeData && homeData.popularArtists && homeData.popularArtists.length > 0)
      ? homeData.popularArtists
      : [];

    artistsShelf.innerHTML = artists.map(art => `
      <div class="spotify-card artist-card" data-slug="${art.slug || art.name}" data-artist="${art.name}">
        <div class="card-img-wrap">
          <img class="card-img" src="${art.large_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}" alt="${art.name}">
          <button class="card-play-btn" title="Play ${art.name}">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <span class="card-title">${art.name}</span>
        <span class="card-desc">Artist • ${art.song_count ? `${art.song_count} songs` : 'Artist'}</span>
      </div>
    `).join('');

    artistsShelf.querySelectorAll('.artist-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.getAttribute('data-slug') || card.getAttribute('data-artist');
        openArtistView(slug);
      });
    });

    // 4. Featured Soundtracks & Albums Shelf
    const albums = (homeData && homeData.popularAlbums && homeData.popularAlbums.length > 0)
      ? homeData.popularAlbums
      : [
          { name: 'VadaChennai', album_artist: 'Santhosh Narayanan', large_image_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300' },
          { name: 'Blue Star', album_artist: 'Govind Vasantha', large_image_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
          { name: 'Retro Soundtrack', album_artist: 'Santhosh Narayanan', large_image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300' },
          { name: 'Bachelor', album_artist: 'Dhibu Ninan Thomas', large_image_url: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=300' }
        ];

    albumsShelf.innerHTML = albums.map(alb => `
      <div class="spotify-card album-card" data-album="${alb.name}">
        <div class="card-img-wrap">
          <img class="card-img" src="${alb.large_image_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300'}" alt="${alb.name}">
          <button class="card-play-btn" title="Play ${alb.name}">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <span class="card-title">${alb.name}</span>
        <span class="card-desc">${alb.album_artist || 'Soundtrack'}</span>
      </div>
    `).join('');

    albumsShelf.querySelectorAll('.album-card').forEach(card => {
      card.addEventListener('click', () => {
        const albumName = card.getAttribute('data-album');
        filterByAlbumAndOpenPlaylist(albumName);
      });
    });

    // 5. Library Shelf
    libraryShelf.innerHTML = allSongs.slice(8, 16).map(s => createSpotifyCardHtml(s)).join('');
    attachCardListeners(libraryShelf, allSongs);
  }

  function createSpotifyCardHtml(song) {
    return `
      <div class="spotify-card" data-song-id="${song.id}">
        <div class="card-img-wrap">
          <img class="card-img" src="${song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'}" alt="${song.title}" loading="lazy">
          <button class="card-play-btn" title="Play ${song.title}">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <span class="card-title" title="${song.title}">${song.title}</span>
        <span class="card-desc" title="${song.artist}">${song.artist}</span>
      </div>
    `;
  }

  function attachCardListeners(container, playlistContext) {
    container.querySelectorAll('.spotify-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-song-id');
        playTrackById(id, playlistContext);
      });
    });
  }

  // ==========================================================================
  // SIDEBAR PLAYLISTS & ARTISTS
  // ==========================================================================
  async function renderSidebarPlaylists() {
    const likedSongs = allSongs.filter(s => s.is_liked);
    if (libLikedCount) libLikedCount.textContent = likedSongs.length;
    if (libAllTracksCount) libAllTracksCount.textContent = allSongs.length;

    let artistsList = [];
    if (homeData && homeData.popularArtists && homeData.popularArtists.length > 0) {
      artistsList = homeData.popularArtists.slice(0, 10);
    } else {
      try {
        const res = await fetch('/api/artists?limit=10');
        const json = await res.json();
        artistsList = (json && json.data) || [];
      } catch (e) {}
    }

    dynamicLibraryList.innerHTML = artistsList.map(art => `
      <div class="library-item" data-type="artist" data-slug="${art.slug || art.name}" data-name="${art.name}">
        <img class="library-item-img circle" src="${art.large_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}" alt="${art.name}" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'">
        <div class="library-item-meta">
          <span class="library-item-title">${art.name}</span>
          <span class="library-item-sub">Artist • ${art.song_count ? `${art.song_count} songs` : 'Artist'}</span>
        </div>
      </div>
    `).join('');

    dynamicLibraryList.querySelectorAll('.library-item').forEach(item => {
      item.addEventListener('click', () => {
        const slug = item.getAttribute('data-slug') || item.getAttribute('data-name');
        openArtistView(slug);
      });
    });
  }

  // ==========================================================================
  // PLAYLIST / TRACK TABLE VIEW
  // ==========================================================================
  function openPlaylistView(title, desc, coverUrl, trackList) {
    currentPlaylist = trackList;
    currentRoute = 'playlist';

    playlistTitle.textContent = title;
    playlistDesc.textContent = desc;
    playlistCoverImg.src = coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600';
    playlistTrackCount.textContent = `${trackList.length} songs`;

    const totalSeconds = trackList.reduce((acc, s) => acc + (s.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    playlistTotalDuration.textContent = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

    setAmbientColor(title);
    renderTrackTableRows(trackList);

    // Switch view
    viewHome.classList.remove('active');
    viewSearch.classList.remove('active');
    viewArtist.classList.remove('active');
    viewPlaylist.classList.add('active');

    mainScrollView.scrollTop = 0;
  }

  function renderTrackTableRows(tracks) {
    playlistTrackRows.innerHTML = tracks.map((song, idx) => {
      const isCurrent = currentTrackIndex >= 0 && currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].id === song.id;
      const rowClass = `table-row ${isCurrent ? 'playing' : ''}`;
      const cover = song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80';
      const albumOrMovie = song.movie ? `From "${song.movie}"` : (song.album || 'Single');

      return `
        <div class="${rowClass}" data-song-id="${song.id}" data-index="${idx}">
          <div class="row-num">
            <span class="row-index-num">${idx + 1}</span>
            <span class="row-play-icon">
              ${isCurrent && isPlaying ? `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ` : `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              `}
            </span>
          </div>
          <div class="row-title-col">
            <img class="row-thumb" src="${cover}" alt="${song.title}" loading="lazy">
            <div class="row-text">
              <span class="row-song-title" title="${song.title}">${song.title}</span>
              <span class="row-artist-name">${renderArtistLinksHtml(song)}</span>
            </div>
          </div>
          <div class="row-album-col" title="${albumOrMovie}">${albumOrMovie}</div>
          <div class="row-date-col">${song.language || 'Master'}</div>
          <div class="row-time-col">
            <button class="row-heart-btn ${song.is_liked ? 'liked' : ''}" data-id="${song.id}" title="${song.is_liked ? 'Unlike' : 'Like'}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="${song.is_liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <span class="row-dur-span" data-song-id="${song.id}">${formatDuration(song.duration)}</span>
          </div>
        </div>
      `;
    }).join('');

    playlistTrackRows.querySelectorAll('.table-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-heart-btn') || e.target.closest('.artist-link-item')) return;
        const index = parseInt(row.getAttribute('data-index'), 10);
        if (currentTrackIndex === index) {
          togglePlayPause();
        } else {
          playTrackAtIndex(index);
        }
      });
    });

    playlistTrackRows.querySelectorAll('.row-heart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await toggleLikeSong(id);
      });
    });

    attachArtistLinkListeners(playlistTrackRows);
  }

  function filterByArtistAndOpenPlaylist(artistName) {
    openArtistView(artistName);
  }

  function filterByAlbumAndOpenPlaylist(albumName) {
    const matched = allSongs.filter(s => (s.album || '').toLowerCase().includes(albumName.toLowerCase()));
    openPlaylistView(
      albumName,
      `Soundtrack album streamed from Cloudinary`,
      matched[0] ? matched[0].cover_image_url : null,
      matched.length > 0 ? matched : allSongs
    );
  }

  // ==========================================================================
  // DYNAMIC ARTIST PAGE & TRACKS
  // ==========================================================================
  async function openArtistView(artistNameOrSlug) {
    if (!artistNameOrSlug) return;
    currentRoute = 'artist';

    // Switch view to Artist
    viewHome.classList.remove('active');
    viewPlaylist.classList.remove('active');
    viewSearch.classList.remove('active');
    viewArtist.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    mainScrollView.scrollTop = 0;

    // Loading state
    artistViewName.textContent = artistNameOrSlug;
    artistViewStats.textContent = 'Loading songs...';
    artistTrackRows.innerHTML = '<div style="padding: 24px; color: #b3b3b3;">Loading artist discography...</div>';

    try {
      const res = await fetch(`/api/artists/${encodeURIComponent(artistNameOrSlug)}`);
      const json = await res.json();

      const artist = (json && json.data && (json.data.artist || json.data));
      const songs = (json && json.data && json.data.songs) || [];

      if (!artist || !artist.name) {
        showToast(`Artist not found`);
        return;
      }

      currentArtist = artist;
      currentArtistSongs = songs;

      artistViewName.textContent = artist.name;
      const count = songs.length;
      artistViewStats.textContent = `${count} ${count === 1 ? 'song' : 'songs'} credited in Spotkify library`;

      const heroImg = artist.large_image_url || (songs[0] && songs[0].cover_image_url) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200';
      artistHeroBackdrop.style.backgroundImage = `url("${heroImg}")`;
      setAmbientColor(artist.name);

      renderArtistTrackRows(songs);
    } catch (err) {
      console.error('Failed to open artist view:', err);
      showToast('Error loading artist details');
    }
  }

  function renderArtistTrackRows(tracks) {
    artistTrackRows.innerHTML = tracks.map((song, idx) => {
      const isCurrent = currentTrackIndex >= 0 && currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].id === song.id;
      const rowClass = `table-row ${isCurrent ? 'playing' : ''}`;
      const cover = song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80';
      const albumOrMovie = song.movie ? `From "${song.movie}"` : (song.album || 'Single');

      return `
        <div class="${rowClass}" data-song-id="${song.id}" data-index="${idx}">
          <div class="row-num">
            <span class="row-index-num">${idx + 1}</span>
            <span class="row-play-icon">
              ${isCurrent && isPlaying ? `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ` : `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              `}
            </span>
          </div>
          <div class="row-title-col">
            <img class="row-thumb" src="${cover}" alt="${song.title}" loading="lazy">
            <div class="row-text">
              <span class="row-song-title" title="${song.title}">${song.title}</span>
              <span class="row-artist-name">${renderArtistLinksHtml(song)}</span>
            </div>
          </div>
          <div class="row-album-col" title="${albumOrMovie}">${albumOrMovie}</div>
          <div class="row-date-col">${song.language || 'Master'}</div>
          <div class="row-time-col">
            <button class="row-heart-btn ${song.is_liked ? 'liked' : ''}" data-id="${song.id}" title="${song.is_liked ? 'Unlike' : 'Like'}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="${song.is_liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <span class="row-dur-span" data-song-id="${song.id}">${formatDuration(song.duration)}</span>
          </div>
        </div>
      `;
    }).join('');

    artistTrackRows.querySelectorAll('.table-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-heart-btn') || e.target.closest('.artist-link-item')) return;
        const index = parseInt(row.getAttribute('data-index'), 10);
        playTrackById(tracks[index].id, tracks);
      });
    });

    artistTrackRows.querySelectorAll('.row-heart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await toggleLikeSong(id);
      });
    });

    attachArtistLinkListeners(artistTrackRows);
  }

  btnArtistPlayAll.addEventListener('click', () => {
    if (currentArtistSongs && currentArtistSongs.length > 0) {
      playTrackById(currentArtistSongs[0].id, currentArtistSongs);
    }
  });

  btnArtistFollow.addEventListener('click', () => {
    const isFollowing = btnArtistFollow.textContent === 'Following';
    btnArtistFollow.textContent = isFollowing ? 'Follow' : 'Following';
    showToast(isFollowing ? 'Unfollowed artist' : 'Following artist');
  });

  // ==========================================================================
  // SEARCH LOGIC
  // ==========================================================================
  function openSearchView() {
    currentRoute = 'search';
    viewHome.classList.remove('active');
    viewPlaylist.classList.remove('active');
    viewArtist.classList.remove('active');
    viewSearch.classList.add('active');

    if (mainSearchWrap) mainSearchWrap.classList.add('search-route-active');
    if (mobileHeaderChips) mobileHeaderChips.style.display = 'none';

    searchInput.focus();
    mainScrollView.scrollTop = 0;
  }

  let searchDebounce = null;
  searchInput.addEventListener('input', () => {
    const rawQuery = (searchInput.value || '').trim();
    btnClearSearch.classList.toggle('hidden', !rawQuery);

    if (!rawQuery) {
      searchBrowseTiles.classList.remove('hidden');
      searchResultsSection.classList.add('hidden');
      return;
    }

    searchBrowseTiles.classList.add('hidden');
    searchResultsSection.classList.remove('hidden');

    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(rawQuery)}`);
        const json = await res.json();
        const results = (json && json.data) || { songs: [], artists: [] };
        const songs = results.songs || [];
        const artists = results.artists || [];

        if (songs.length === 0 && artists.length === 0) {
          topResultCard.innerHTML = `<p style="color: #b3b3b3; padding: 24px;">No results found for "${rawQuery}"</p>`;
          searchMiniRows.innerHTML = '';
          searchTableRows.innerHTML = '';
          return;
        }

        // Top Result determination
        const queryLower = rawQuery.toLowerCase();
        const matchedArtist = artists.find(a => a.name.toLowerCase() === queryLower) || artists[0];
        const isArtistTop = matchedArtist && (!songs[0] || songs[0].title.toLowerCase() !== queryLower);

        if (isArtistTop && matchedArtist) {
          topResultCard.innerHTML = `
            <img class="top-result-img" style="border-radius: 50%;" src="${matchedArtist.large_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}" alt="${matchedArtist.name}">
            <h2 class="top-result-title">${matchedArtist.name}</h2>
            <p class="top-result-sub">Artist • ${matchedArtist.song_count || songs.length} songs</p>
            <span class="top-result-badge">Artist</span>
            <button class="card-play-btn" style="opacity: 1; transform: none; right: 20px; bottom: 20px;" title="View ${matchedArtist.name}">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          `;
          topResultCard.onclick = () => openArtistView(matchedArtist.slug || matchedArtist.name);
        } else if (songs.length > 0) {
          const top = songs[0];
          topResultCard.innerHTML = `
            <img class="top-result-img" src="${top.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}" alt="${top.title}">
            <h2 class="top-result-title">${top.title}</h2>
            <p class="top-result-sub">${top.artist} • <span style="color:#fff;">${top.movie ? `From "${top.movie}"` : (top.album || 'Single')}</span></p>
            <span class="top-result-badge">Song</span>
            <button class="card-play-btn" style="opacity: 1; transform: none; right: 20px; bottom: 20px;" title="Play ${top.title}">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          `;
          topResultCard.onclick = () => playTrackById(top.id, songs);
        }

        // Mini rows (top 4)
        searchMiniRows.innerHTML = songs.slice(0, 4).map((s, idx) => `
          <div class="table-row" data-song-id="${s.id}" data-index="${idx}">
            <div class="row-title-col">
              <img class="row-thumb" src="${s.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80'}" alt="${s.title}">
              <div class="row-text">
                <span class="row-song-title">${s.title}</span>
                <span class="row-artist-name">${renderArtistLinksHtml(s)}</span>
              </div>
            </div>
            <div class="row-time-col">
              <span class="row-dur-span" data-song-id="${s.id}">${formatDuration(s.duration)}</span>
            </div>
          </div>
        `).join('');

        searchMiniRows.querySelectorAll('.table-row').forEach(r => {
          r.addEventListener('click', (e) => {
            if (e.target.closest('.artist-link-item')) return;
            const id = r.getAttribute('data-song-id');
            playTrackById(id, songs);
          });
        });
        attachArtistLinkListeners(searchMiniRows);

        // Full table
        searchTableRows.innerHTML = songs.map((song, idx) => `
          <div class="table-row" data-song-id="${song.id}">
            <div class="row-num"><span class="row-index-num">${idx + 1}</span></div>
            <div class="row-title-col">
              <img class="row-thumb" src="${song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80'}" alt="${song.title}">
              <div class="row-text">
                <span class="row-song-title">${song.title}</span>
                <span class="row-artist-name">${renderArtistLinksHtml(song)}</span>
              </div>
            </div>
            <div class="row-album-col">${song.movie ? `From "${song.movie}"` : (song.album || 'Single')}</div>
            <div class="row-date-col">${song.language || 'Master'}</div>
            <div class="row-time-col"><span class="row-dur-span" data-song-id="${song.id}">${formatDuration(song.duration)}</span></div>
          </div>
        `).join('');

        searchTableRows.querySelectorAll('.table-row').forEach(r => {
          r.addEventListener('click', (e) => {
            if (e.target.closest('.artist-link-item')) return;
            const id = r.getAttribute('data-song-id');
            playTrackById(id, songs);
          });
        });
        attachArtistLinkListeners(searchTableRows);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 150);
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    btnClearSearch.classList.add('hidden');
    searchBrowseTiles.classList.remove('hidden');
    searchResultsSection.classList.add('hidden');
    searchInput.focus();
  });

  // Browse tile clicks
  document.querySelectorAll('.genre-card').forEach(tile => {
    tile.addEventListener('click', () => {
      const term = tile.getAttribute('data-search');
      searchInput.value = term;
      searchInput.dispatchEvent(new Event('input'));
    });
  });

  // ==========================================================================
  // PLAYBACK LOGIC & AUDIO STREAMING
  // ==========================================================================
  function loadTrackIntoPlayerBar(song) {
    if (!song) return;
    currentSong = song;

    // Update Bottom Player UI
    barTitle.textContent = song.title;
    barArtist.innerHTML = renderArtistLinksHtml(song);
    attachArtistLinkListeners(barArtist);
    barThumb.src = song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100';
    barHeartBtn.classList.toggle('liked', Boolean(song.is_liked));
    barTotalTime.textContent = formatDuration(song.duration);

    // If audio element is empty or points to page, pre-assign song's direct audio stream
    const directUrl = song.audio_url || song.audioUrl;
    if (directUrl && (!audio.src || audio.src === '' || audio.src === window.location.href)) {
      audio.src = directUrl;
    }

    // Update Right Panel UI
    rightTrackName.textContent = song.title;
    rightArtistName.innerHTML = renderArtistLinksHtml(song);
    attachArtistLinkListeners(rightArtistName);
    rightCoverImg.src = song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600';
    const firstArtist = song.artist ? song.artist.split(',')[0].trim() : 'Artist';
    rightArtistCardName.textContent = firstArtist;
    rightArtistCardName.style.cursor = 'pointer';
    rightArtistCardName.onclick = () => openArtistView(firstArtist);

    // Update Fullscreen UI
    fsTrackTitle.textContent = song.title;
    fsArtistName.textContent = song.artist;
    fsAlbumName.textContent = song.movie ? `From "${song.movie}"` : (song.album || 'Single');
    fsCoverImg.src = song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600';

    // Update Mobile Mini Player UI
    if (mobilePlayerTopText) {
      mobilePlayerTopText.textContent = `Similar to ${song.movie || song.album || 'the album you chose'}`;
    } else if (mobilePlayerTopLabel) {
      mobilePlayerTopLabel.textContent = `Similar to ${song.movie || song.album || 'the album you chose'}`;
    }
    if (mobileAddSvgPlus && mobileAddSvgCheck) {
      mobileAddSvgPlus.classList.toggle('hidden', Boolean(song.is_liked));
      mobileAddSvgCheck.classList.toggle('hidden', !Boolean(song.is_liked));
    }
    document.querySelectorAll('.mobile-track-row').forEach(row => {
      const isCurrent = row.getAttribute('data-song-id') === song.id;
      const titleEl = row.querySelector('.mobile-track-title');
      if (titleEl) {
        titleEl.classList.toggle('active', isCurrent);
        const existingPrefix = titleEl.querySelector('.playing-dot-prefix');
        if (existingPrefix) existingPrefix.remove();
        if (isCurrent && isPlaying) {
          titleEl.insertAdjacentHTML('afterbegin', '<span class="playing-dot-prefix" style="color:#1ed760; font-weight:800; margin-right:4px;">...</span>');
        }
      }
    });

    setAmbientColor(song.title);
  }

  function playTrackById(songId, playlistContext) {
    if (playlistContext && playlistContext.length > 0) {
      currentPlaylist = playlistContext;
    }
    const idx = currentPlaylist.findIndex(s => s.id === songId);
    if (idx !== -1) {
      playTrackAtIndex(idx);
    } else {
      const fallback = allSongs.find(s => s.id === songId);
      if (fallback) {
        currentPlaylist = [fallback, ...allSongs.filter(s => s.id !== songId)];
        playTrackAtIndex(0);
      }
    }
  }

  async function playTrackAtIndex(index) {
    if (index < 0 || index >= currentPlaylist.length) return;

    currentTrackIndex = index;
    const song = currentPlaylist[index];
    currentSong = song;

    loadTrackIntoPlayerBar(song);

    // Update Queue Next
    const nextIdx = (index + 1) % currentPlaylist.length;
    const nextSong = currentPlaylist[nextIdx];
    if (nextSong) {
      nextQueueRow.innerHTML = `
        <img class="row-thumb" src="${nextSong.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80'}" alt="${nextSong.title}">
        <div class="row-text">
          <span class="row-song-title">${nextSong.title}</span>
          <span class="row-artist-name">${renderArtistLinksHtml(nextSong)}</span>
        </div>
      `;
      attachArtistLinkListeners(nextQueueRow);
    }

    setAmbientColor(song.title);

    const streamUrl = song.audio_url || song.audioUrl;

    if (streamUrl) {
      if (audio.src !== streamUrl) {
        audio.src = streamUrl;
        audio.load();
      }
      try {
        await audio.play();
        setPlayingState(true);
      } catch (err) {
        console.warn('Initial direct play failed, trying /play endpoint:', err);
        try {
          const res = await fetch(`/api/songs/${song.id}/play`);
          const json = await res.json();
          const freshUrl = (json && json.data && json.data.streamUrl) || streamUrl;
          if (audio.src !== freshUrl) {
            audio.src = freshUrl;
            audio.load();
          }
          await audio.play();
          setPlayingState(true);
        } catch (fallbackErr) {
          console.error('Audio playback error:', fallbackErr);
          showToast(`Playback error: ${fallbackErr.message || 'Check connection'}`);
          setPlayingState(false);
        }
      }
    } else {
      try {
        const res = await fetch(`/api/songs/${song.id}/play`);
        const json = await res.json();
        const freshUrl = json && json.data && json.data.streamUrl;
        if (!freshUrl) throw new Error('No streaming URL returned');
        audio.src = freshUrl;
        audio.load();
        await audio.play();
        setPlayingState(true);
      } catch (err) {
        console.error('Audio playback error:', err);
        showToast(`Playback: ${err.message || 'Connecting to Cloudinary...'}`);
        setPlayingState(false);
      }
    }

    // Refresh row highlighting in playlist or artist view if active
    if (currentRoute === 'playlist') {
      renderTrackTableRows(currentPlaylist);
    } else if (currentRoute === 'artist' && currentArtistSongs.length > 0) {
      renderArtistTrackRows(currentArtistSongs);
    }

    // Background scrobble analytics (non-blocking)
    try {
      fetch('/api/playback/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id, durationPlayed: 32, completed: false })
      }).catch(() => {});
    } catch (_) {}
  }

  function setPlayingState(playing) {
    isPlaying = playing;
    barBtnPlayPause.title = playing ? 'Pause' : 'Play';
    if (playing) {
      barPlaySvg.classList.add('hidden');
      barPauseSvg.classList.remove('hidden');
      soundwaveIndicator.classList.remove('hidden');
      if (mobileBarPlaySvg) mobileBarPlaySvg.classList.add('hidden');
      if (mobileBarPauseSvg) mobileBarPauseSvg.classList.remove('hidden');
    } else {
      barPlaySvg.classList.remove('hidden');
      barPauseSvg.classList.add('hidden');
      soundwaveIndicator.classList.add('hidden');
      if (mobileBarPlaySvg) mobileBarPlaySvg.classList.remove('hidden');
      if (mobileBarPauseSvg) mobileBarPauseSvg.classList.add('hidden');
    }

    // Synchronize play icons across table rows
    if (currentSong) {
      document.querySelectorAll('.table-row').forEach(row => {
        const id = row.getAttribute('data-song-id');
        if (id === currentSong.id) {
          row.classList.toggle('playing', playing);
          const iconSpan = row.querySelector('.row-play-icon');
          if (iconSpan) {
            iconSpan.innerHTML = playing ? `
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ` : `
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            `;
          }
        } else {
          row.classList.remove('playing');
        }
      });

      // Synchronize playing indicator on mobile track rows
      document.querySelectorAll('.mobile-track-row').forEach(row => {
        const id = row.getAttribute('data-song-id');
        const isCurrent = id === currentSong.id;
        const titleEl = row.querySelector('.mobile-track-title');
        if (titleEl) {
          titleEl.classList.toggle('active', isCurrent);
          const dot = titleEl.querySelector('.playing-dot-prefix');
          if (isCurrent && playing) {
            if (!dot) {
              titleEl.insertAdjacentHTML('afterbegin', '<span class="playing-dot-prefix" style="color:#1ed760; font-weight:800; margin-right:4px;">...</span>');
            }
          } else {
            if (dot) dot.remove();
          }
        }
      });
    }
  }

  function togglePlayPause() {
    if (currentPlaylist.length === 0 && allSongs.length > 0) {
      currentPlaylist = [...allSongs];
    }
    if (currentTrackIndex < 0 || !currentPlaylist[currentTrackIndex]) {
      if (currentPlaylist.length > 0) {
        playTrackAtIndex(0);
      }
      return;
    }

    const song = currentPlaylist[currentTrackIndex];
    const targetUrl = song ? (song.audio_url || song.audioUrl) : null;

    const hasValidSrc = audio.src && audio.src !== '' && audio.src !== window.location.href;
    const matchesCurrent = targetUrl ? audio.src.includes(targetUrl.split('?')[0]) : true;

    if (!hasValidSrc || !matchesCurrent) {
      playTrackAtIndex(currentTrackIndex);
      return;
    }

    if (audio.paused) {
      audio.play()
        .then(() => setPlayingState(true))
        .catch(err => {
          console.warn('Resume failed, reloading track:', err);
          playTrackAtIndex(currentTrackIndex);
        });
    } else {
      audio.pause();
      setPlayingState(false);
    }

    if (currentRoute === 'playlist') {
      renderTrackTableRows(currentPlaylist);
    } else if (currentRoute === 'artist' && currentArtistSongs.length > 0) {
      renderArtistTrackRows(currentArtistSongs);
    }
  }

  function playNextTrack() {
    if (currentPlaylist.length === 0) {
      if (allSongs.length > 0) currentPlaylist = [...allSongs];
      else return;
    }
    if (isShuffle) {
      let randIdx = Math.floor(Math.random() * currentPlaylist.length);
      if (currentPlaylist.length > 1 && randIdx === currentTrackIndex) {
        randIdx = (randIdx + 1) % currentPlaylist.length;
      }
      playTrackAtIndex(randIdx);
    } else {
      const nextIdx = (currentTrackIndex + 1) % currentPlaylist.length;
      playTrackAtIndex(nextIdx);
    }
  }

  function playPrevTrack() {
    if (currentPlaylist.length === 0) {
      if (allSongs.length > 0) currentPlaylist = [...allSongs];
      else return;
    }
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      if (audio.paused) {
        audio.play().catch(console.error);
      }
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playTrackAtIndex(prevIdx);
  }

  // Audio Event Listeners
  audio.addEventListener('play', () => setPlayingState(true));
  audio.addEventListener('playing', () => setPlayingState(true));
  audio.addEventListener('pause', () => setPlayingState(false));
  audio.addEventListener('error', () => {
    console.error('Audio engine error event:', audio.error);
    setPlayingState(false);
  });

  audio.addEventListener('loadedmetadata', () => {
    const total = audio.duration;
    if (total && !isNaN(total) && total > 0) {
      const rounded = Math.round(total);
      barTotalTime.textContent = formatDuration(rounded);
      if (currentSong) {
        currentSong.duration = rounded;
        document.querySelectorAll(`.row-dur-span[data-song-id="${currentSong.id}"]`).forEach(el => {
          el.textContent = formatDuration(rounded);
        });
      }
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    const current = audio.currentTime || 0;
    const total = (audio.duration && !isNaN(audio.duration) && audio.duration > 0)
      ? audio.duration
      : (currentSong && currentSong.duration ? currentSong.duration : 0);

    barCurrentTime.textContent = formatDuration(current);
    if (total > 0) {
      barTotalTime.textContent = formatDuration(total);
      const pct = (current / total) * 100;
      progressFillBar.style.width = `${pct}%`;
      progressHandle.style.left = `${pct}%`;
      if (mobileMiniProgressFill) {
        mobileMiniProgressFill.style.width = `${pct}%`;
      }
    }
  });

  audio.addEventListener('ended', () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    } else {
      playNextTrack();
    }
  });

  // Seekbar Click & Drag
  function handleSeek(e) {
    const rect = seekBar.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const total = (audio.duration && !isNaN(audio.duration) && audio.duration > 0)
      ? audio.duration
      : (currentSong && currentSong.duration ? currentSong.duration : 0);
    const targetTime = pos * total;

    progressFillBar.style.width = `${pos * 100}%`;
    progressHandle.style.left = `${pos * 100}%`;
    if (mobileMiniProgressFill) {
      mobileMiniProgressFill.style.width = `${pos * 100}%`;
    }
    barCurrentTime.textContent = formatDuration(targetTime);
    return targetTime;
  }

  seekBar.addEventListener('mousedown', (e) => {
    isSeeking = true;
    const targetTime = handleSeek(e);
    if (audio.duration && !isNaN(audio.duration) && isFinite(targetTime)) {
      audio.currentTime = targetTime;
    }
  });

  seekBar.addEventListener('touchstart', (e) => {
    isSeeking = true;
    const targetTime = handleSeek(e);
    if (audio.duration && !isNaN(audio.duration) && isFinite(targetTime)) {
      audio.currentTime = targetTime;
    }
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (!isSeeking) return;
    handleSeek(e);
  });

  window.addEventListener('touchmove', (e) => {
    if (!isSeeking) return;
    handleSeek(e);
  }, { passive: true });

  window.addEventListener('mouseup', (e) => {
    if (!isSeeking) return;
    isSeeking = false;
    const targetTime = handleSeek(e);
    if (audio.duration && !isNaN(audio.duration) && isFinite(targetTime)) {
      audio.currentTime = targetTime;
    }
  });

  window.addEventListener('touchend', () => {
    if (!isSeeking) return;
    isSeeking = false;
  });

  // Volume Bar Click & Drag
  function updateVolumeUI(val) {
    const pct = val * 100;
    volumeFillBar.style.width = `${pct}%`;
    volumeHandle.style.left = `${pct}%`;

    if (val === 0) {
      volSvgHigh.classList.add('hidden');
      volSvgMute.classList.remove('hidden');
      barBtnMute.title = 'Unmute';
    } else {
      volSvgHigh.classList.remove('hidden');
      volSvgMute.classList.add('hidden');
      barBtnMute.title = 'Mute';
    }
  }

  function handleVolume(e) {
    const rect = volBar.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const val = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    currentVolume = val;
    audio.volume = val;
    updateVolumeUI(val);
  }

  volBar.addEventListener('mousedown', (e) => {
    isVolDragging = true;
    handleVolume(e);
  });

  volBar.addEventListener('touchstart', (e) => {
    isVolDragging = true;
    handleVolume(e);
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (!isVolDragging) return;
    handleVolume(e);
  });

  window.addEventListener('touchmove', (e) => {
    if (!isVolDragging) return;
    handleVolume(e);
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    isVolDragging = false;
  });

  window.addEventListener('touchend', () => {
    isVolDragging = false;
  });

  barBtnMute.addEventListener('click', () => {
    if (audio.volume > 0) {
      audio.volume = 0;
      updateVolumeUI(0);
    } else {
      audio.volume = currentVolume > 0 ? currentVolume : 0.8;
      updateVolumeUI(audio.volume);
    }
  });

  // Heart / Like Toggling
  async function toggleLikeSong(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;

    const nextState = !song.is_liked;
    song.is_liked = nextState;

    if (currentSong && currentSong.id === songId) {
      barHeartBtn.classList.toggle('liked', nextState);
      if (mobileAddSvgPlus && mobileAddSvgCheck) {
        mobileAddSvgPlus.classList.toggle('hidden', nextState);
        mobileAddSvgCheck.classList.toggle('hidden', !nextState);
      }
    }

    renderSidebarPlaylists();
    if (currentRoute === 'playlist') {
      renderTrackTableRows(currentPlaylist);
    }

    try {
      const method = nextState ? 'POST' : 'DELETE';
      await fetch(`/api/library/liked/${songId}`, { method });
      showToast(nextState ? 'Added to Liked Songs' : 'Removed from Liked Songs');
    } catch (err) {
      console.warn('Like toggle err:', err);
    }
  }

  barHeartBtn.addEventListener('click', () => {
    if (currentSong) {
      toggleLikeSong(currentSong.id);
    } else if (currentTrackIndex >= 0 && currentPlaylist[currentTrackIndex]) {
      toggleLikeSong(currentPlaylist[currentTrackIndex].id);
    }
  });

  if (mobileAddBtn) {
    mobileAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentSong) {
        toggleLikeSong(currentSong.id);
      } else if (currentTrackIndex >= 0 && currentPlaylist[currentTrackIndex]) {
        toggleLikeSong(currentPlaylist[currentTrackIndex].id);
      }
    });
  }

  // ==========================================================================
  // BUTTONS & CONTROLS EVENT WIRING
  // ==========================================================================
  barBtnPlayPause.addEventListener('click', togglePlayPause);
  barBtnNext.addEventListener('click', playNextTrack);
  barBtnPrev.addEventListener('click', playPrevTrack);

  barBtnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    barBtnShuffle.classList.toggle('active', isShuffle);
    barBtnShuffle.title = isShuffle ? 'Disable shuffle' : 'Enable shuffle';
    showToast(isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF');
  });

  barBtnRepeat.addEventListener('click', () => {
    isRepeat = !isRepeat;
    barBtnRepeat.classList.toggle('active', isRepeat);
    barBtnRepeat.title = isRepeat ? 'Disable repeat' : 'Enable repeat';
    showToast(isRepeat ? 'Repeat Track is ON' : 'Repeat is OFF');
  });

  btnBigPlay.addEventListener('click', () => {
    if (currentPlaylist.length > 0) {
      playTrackAtIndex(0);
    }
  });

  btnShufflePlaylist.addEventListener('click', () => {
    if (currentPlaylist.length > 0) {
      isShuffle = true;
      barBtnShuffle.classList.add('active');
      const r = Math.floor(Math.random() * currentPlaylist.length);
      playTrackAtIndex(r);
    }
  });

  // Spacebar Play/Pause Shortcut
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // Topbar Navigation Buttons
  document.getElementById('btnNavHome').addEventListener('click', () => {
    currentRoute = 'home';
    if (mainSearchWrap) mainSearchWrap.classList.remove('search-route-active');
    if (mobileHeaderChips) mobileHeaderChips.style.display = '';
    viewPlaylist.classList.remove('active');
    viewSearch.classList.remove('active');
    viewArtist.classList.remove('active');
    viewHome.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btnNavHome').classList.add('active');
  });

  document.getElementById('btnNavSearch').addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btnNavSearch').classList.add('active');
    openSearchView();
  });

  document.getElementById('btnNavLibrary').addEventListener('click', () => {
    openPlaylistView(
      'Your Library: All Master Recordings',
      `All ${allSongs.length} songs imported from Cloudinary apkdo69e`,
      allSongs[0] ? allSongs[0].cover_image_url : null,
      allSongs
    );
  });

  document.getElementById('itemLikedSongs').addEventListener('click', () => {
    const liked = allSongs.filter(s => s.is_liked);
    openPlaylistView(
      'Liked Songs',
      `${liked.length} favorite songs stored in your library`,
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600',
      liked.length > 0 ? liked : allSongs
    );
  });

  document.getElementById('itemAllTracks').addEventListener('click', () => {
    openPlaylistView(
      'Cloudinary Master Collection',
      `Original master audio recordings (${allSongs.length} tracks) synced directly from Cloudinary`,
      allSongs[0] ? allSongs[0].cover_image_url : null,
      allSongs
    );
  });

  // "Show All" / Category Pills
  document.querySelectorAll('.show-all-link').forEach(link => {
    link.addEventListener('click', () => {
      openPlaylistView(
        'Cloudinary Audio Tracks',
        `High-bitrate master tracks (${allSongs.length} songs) streamed via Cloudinary CDN`,
        allSongs[0] ? allSongs[0].cover_image_url : null,
        allSongs
      );
    });
  });

  document.querySelectorAll('.category-pills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-cat');
      if (cat === 'tamil') {
        const tamil = allSongs.filter(s => (s.language || '').toLowerCase() === 'tamil');
        openPlaylistView('Tamil Cinema Hits', 'Authentic Tamil movie soundtracks and singles', null, tamil.length > 0 ? tamil : allSongs);
      } else if (cat === 'soundtrack') {
        const ost = allSongs.filter(s => s.movie || (s.album && s.album !== 'Tamil Hits' && s.album !== 'Singles'));
        openPlaylistView('Movie Soundtracks', 'Original film compositions and soundtracks', null, ost.length > 0 ? ost : allSongs);
      } else if (cat === 'artists') {
        const firstArtist = (homeData && homeData.popularArtists && homeData.popularArtists[0]) || null;
        if (firstArtist) {
          openArtistView(firstArtist.slug || firstArtist.name);
        } else {
          document.getElementById('artistsShelf').scrollIntoView({ behavior: 'smooth' });
        }
      } else if (cat === 'all') {
        openPlaylistView('All Master Recordings', `Complete library with ${allSongs.length} songs`, null, allSongs);
      }
    });
  });

  // Right Panel Toggle
  function toggleRightPanel(viewName = 'now_playing') {
    if (isRightPanelOpen && currentRightPanelTab === viewName) {
      spotifyApp.classList.add('hide-right');
      isRightPanelOpen = false;
      currentRightPanelTab = null;
      btnToggleNowPlaying.classList.remove('active');
      btnToggleQueue.classList.remove('active');
      return;
    }

    spotifyApp.classList.remove('hide-right');
    isRightPanelOpen = true;
    currentRightPanelTab = viewName;

    if (viewName === 'queue') {
      nowPlayingView.classList.add('hidden');
      queueView.classList.remove('hidden');
      document.getElementById('rightPanelTitle').textContent = 'Queue';
      btnToggleQueue.classList.add('active');
      btnToggleNowPlaying.classList.remove('active');
      renderQueueView();
    } else {
      queueView.classList.add('hidden');
      nowPlayingView.classList.remove('hidden');
      document.getElementById('rightPanelTitle').textContent = 'Now playing';
      btnToggleNowPlaying.classList.add('active');
      btnToggleQueue.classList.remove('active');
    }
  }

  function renderQueueView() {
    if (currentTrackIndex >= 0 && currentPlaylist[currentTrackIndex]) {
      const cur = currentPlaylist[currentTrackIndex];
      queueNowPlayingRow.innerHTML = `
        <div class="next-track-row" style="margin-bottom: 16px;">
          <img class="row-thumb" src="${cur.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80'}" alt="${cur.title}">
          <div class="row-text">
            <span class="row-song-title" style="color: #1db954;">${cur.title}</span>
            <span class="row-artist-name">${cur.artist}</span>
          </div>
        </div>
      `;
    }

    const upcoming = currentPlaylist.slice(currentTrackIndex + 1);
    queueUpcomingRows.innerHTML = upcoming.map((s, i) => `
      <div class="next-track-row" style="margin-bottom: 10px; cursor: pointer;" data-offset="${i + 1}">
        <img class="row-thumb" src="${s.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80'}" alt="${s.title}">
        <div class="row-text">
          <span class="row-song-title">${s.title}</span>
          <span class="row-artist-name">${s.artist}</span>
        </div>
      </div>
    `).join('');

    queueUpcomingRows.querySelectorAll('.next-track-row').forEach(r => {
      r.addEventListener('click', () => {
        const offset = parseInt(r.getAttribute('data-offset'), 10);
        playTrackAtIndex(currentTrackIndex + offset);
      });
    });
  }

  btnToggleNowPlaying.addEventListener('click', () => toggleRightPanel('now_playing'));
  btnToggleQueue.addEventListener('click', () => toggleRightPanel('queue'));
  btnOpenFullQueue.addEventListener('click', () => toggleRightPanel('queue'));

  btnCloseRightPanel.addEventListener('click', () => {
    spotifyApp.classList.add('hide-right');
    isRightPanelOpen = false;
    currentRightPanelTab = null;
    btnToggleNowPlaying.classList.remove('active');
    btnToggleQueue.classList.remove('active');
  });

  // Fullscreen Mode
  function openFullscreen() {
    fullscreenModal.classList.remove('hidden');
    btnFullscreen.classList.add('active');
  }

  function closeFullscreen() {
    fullscreenModal.classList.add('hidden');
    btnFullscreen.classList.remove('active');
  }

  btnFullscreen.addEventListener('click', () => {
    if (fullscreenModal.classList.contains('hidden')) {
      openFullscreen();
    } else {
      closeFullscreen();
    }
  });

  btnCloseFullscreen.addEventListener('click', closeFullscreen);
  if (fsBackdrop) {
    fsBackdrop.addEventListener('click', closeFullscreen);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!fullscreenModal.classList.contains('hidden')) {
        closeFullscreen();
      }
    }
  });

  // Cloudinary Catalog Sync Trigger (works on both local and Vercel)
  btnSyncCloudinary.addEventListener('click', async () => {
    btnSyncCloudinary.classList.add('spinning');
    showToast('Scanning Cloudinary "Songs" folder...');

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'Songs' })
      });
      const data = await res.json();
      const r = data.data;

      showToast(`Cloudinary Synced: ${r.discovered} discovered (${r.added} added, ${r.updated} updated).`);
      await initAppData();
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Sync error occurred');
    } finally {
      btnSyncCloudinary.classList.remove('spinning');
    }
  });

  // Automatic Background Library Updates (discovers newly uploaded songs automatically)
  setInterval(async () => {
    if (document.hidden || !isAuthenticated()) return;
    try {
      const res = await fetch('/api/songs?limit=500');
      const json = await res.json();
      const newSongs = (json && json.data) || [];
      if (newSongs.length > 0 && newSongs.length !== allSongs.length) {
        console.log(`[Spotkify AutoUpdate] Discovered new songs: ${allSongs.length} -> ${newSongs.length}`);
        allSongs = newSongs;
        const homeRes = await fetch('/api/home');
        const homeJson = await homeRes.json();
        homeData = (homeJson && homeJson.data) || {};
        renderHomeView();
        renderSidebarPlaylists();
        showToast(`Library updated: ${newSongs.length} songs available`);
      }
    } catch (e) {}
  }, 30000);

  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && isAuthenticated()) {
      try {
        const res = await fetch('/api/songs?limit=500');
        const json = await res.json();
        const newSongs = (json && json.data) || [];
        if (newSongs.length > 0 && newSongs.length !== allSongs.length) {
          allSongs = newSongs;
          const homeRes = await fetch('/api/home');
          const homeJson = await homeRes.json();
          homeData = (homeJson && homeJson.data) || {};
          renderHomeView();
          renderSidebarPlaylists();
        }
      } catch (e) {}
    }
  });

  // Topbar scroll background effect
  mainScrollView.addEventListener('scroll', () => {
    if (mainScrollView.scrollTop > 30) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault();
      playNextTrack();
    } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault();
      playPrevTrack();
    } else if (e.key.toLowerCase() === 'm') {
      barBtnMute.click();
    } else if (e.key.toLowerCase() === 'f') {
      if (fullscreenModal.classList.contains('hidden')) {
        fullscreenModal.classList.remove('hidden');
      } else {
        fullscreenModal.classList.add('hidden');
      }
    }
  });

  // Bottom Sheet Helpers
  function openDevicePickerSheet() {
    if (devicePickerSheet) devicePickerSheet.classList.remove('hidden');
  }

  function closeDevicePickerSheet() {
    if (devicePickerSheet) devicePickerSheet.classList.add('hidden');
  }

  function openPremiumSheet() {
    if (premiumSheet) premiumSheet.classList.remove('hidden');
  }

  function closePremiumSheet() {
    if (premiumSheet) premiumSheet.classList.add('hidden');
  }

  function openCreateSheet() {
    if (createSheet) createSheet.classList.remove('hidden');
  }

  function closeCreateSheet() {
    if (createSheet) createSheet.classList.add('hidden');
  }

  function openTrackContextSheet(song) {
    if (!trackContextSheet || !song) return;
    currentContextSong = song;
    if (contextTrackCover) contextTrackCover.src = song.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100';
    if (contextTrackTitle) contextTrackTitle.textContent = song.title;
    if (contextTrackArtist) contextTrackArtist.textContent = song.artist;
    if (btnContextLikeText) {
      btnContextLikeText.textContent = song.is_liked ? 'Remove from Liked Songs' : 'Add to Liked Songs';
    }
    trackContextSheet.classList.remove('hidden');
  }

  function closeTrackContextSheet() {
    if (trackContextSheet) trackContextSheet.classList.add('hidden');
    currentContextSong = null;
  }

  // Mobile Bottom Nav Switching (5 Items matching Spotify)
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.getAttribute('data-route');
      if (route === 'premium') {
        openPremiumSheet();
        return;
      }
      if (route === 'create') {
        openCreateSheet();
        return;
      }
      document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      if (route === 'home') document.getElementById('btnNavHome').click();
      else if (route === 'search') document.getElementById('btnNavSearch').click();
      else if (route === 'library') document.getElementById('btnNavLibrary').click();
    });
  });

  // Mobile Mini Player Play/Pause Button
  if (mobileMiniPlayBtn) {
    mobileMiniPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  // Floating Mini Player Click: Open Fullscreen Modal on Mobile
  if (spotifyPlayerBar) {
    spotifyPlayerBar.addEventListener('click', (e) => {
      if (e.target.closest('#barHeartBtn') || 
          e.target.closest('#mobileMiniPlayBtn') || 
          e.target.closest('#mobileConnectBtn') || 
          e.target.closest('#mobileAddBtn') || 
          e.target.closest('#mobileDeviceBadge') || 
          e.target.closest('.player-center') || 
          e.target.closest('.player-right')) {
        return;
      }
      if (window.innerWidth <= 768 && btnFullscreen) {
        btnFullscreen.click();
      }
    });
  }

  // Mobile Device Picker Wiring
  if (mobileConnectBtn) {
    mobileConnectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDevicePickerSheet();
    });
  }
  if (mobileDeviceBadge) {
    mobileDeviceBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      openDevicePickerSheet();
    });
  }
  if (btnCloseDeviceSheet) btnCloseDeviceSheet.addEventListener('click', closeDevicePickerSheet);
  if (deviceSheetBackdrop) deviceSheetBackdrop.addEventListener('click', closeDevicePickerSheet);

  if (deviceListGroup) {
    deviceListGroup.querySelectorAll('.device-item').forEach(item => {
      item.addEventListener('click', () => {
        deviceListGroup.querySelectorAll('.device-item').forEach(d => {
          d.classList.remove('active');
          const chk = d.querySelector('.device-check');
          if (chk) chk.classList.add('hidden');
        });
        item.classList.add('active');
        const chk = item.querySelector('.device-check');
        if (chk) chk.classList.remove('hidden');

        const devName = item.getAttribute('data-device');
        if (mobileDeviceName) mobileDeviceName.textContent = devName;
        closeDevicePickerSheet();
        showToast(`Connected to ${devName}`);
      });
    });
  }

  // Premium Sheet Wiring
  if (btnClosePremiumSheet) btnClosePremiumSheet.addEventListener('click', closePremiumSheet);
  if (premiumSheetBackdrop) premiumSheetBackdrop.addEventListener('click', closePremiumSheet);
  if (btnGetPremium) {
    btnGetPremium.addEventListener('click', () => {
      closePremiumSheet();
      showToast('🎉 Spotkify Premium Individual Activated! High-fidelity master streaming enabled.');
    });
  }

  // Create Sheet Wiring
  if (btnCloseCreateSheet) btnCloseCreateSheet.addEventListener('click', closeCreateSheet);
  if (createSheetBackdrop) createSheetBackdrop.addEventListener('click', closeCreateSheet);
  if (btnCreateNewPlaylist) {
    btnCreateNewPlaylist.addEventListener('click', () => {
      closeCreateSheet();
      const pName = prompt('Enter playlist name:', 'My Playlist #1') || 'My Playlist #1';
      openPlaylistView(pName, `Created by sharu • 0 songs`, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', []);
      showToast(`Created playlist "${pName}"`);
    });
  }
  if (btnCreateBlend) {
    btnCreateBlend.addEventListener('click', () => {
      closeCreateSheet();
      showToast('Blend invitation link copied to clipboard!');
    });
  }

  // Track Context Sheet Wiring
  if (contextSheetBackdrop) contextSheetBackdrop.addEventListener('click', closeTrackContextSheet);
  if (btnContextLike) {
    btnContextLike.addEventListener('click', async () => {
      if (currentContextSong) {
        await toggleLikeSong(currentContextSong.id);
        closeTrackContextSheet();
      }
    });
  }
  if (btnContextAddToPlaylist) {
    btnContextAddToPlaylist.addEventListener('click', () => {
      if (currentContextSong) {
        showToast(`Added "${currentContextSong.title}" to Your Library`);
      }
      closeTrackContextSheet();
    });
  }
  if (btnContextViewArtist) {
    btnContextViewArtist.addEventListener('click', () => {
      if (currentContextSong) {
        const first = currentContextSong.artist ? currentContextSong.artist.split(',')[0].trim() : '';
        closeTrackContextSheet();
        if (first) openArtistView(first);
      }
    });
  }
  if (btnContextShare) {
    btnContextShare.addEventListener('click', () => {
      closeTrackContextSheet();
      showToast('Track link copied to clipboard!');
    });
  }

  // Mobile Topbar User Avatar Bubble Click
  if (btnMobileUserAvatar) {
    btnMobileUserAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (profileDropdown) {
        profileDropdown.classList.toggle('hidden');
      }
    });
  }

  // Mobile Topbar Filter Chips Interaction
  if (mobileHeaderChips) {
    mobileHeaderChips.querySelectorAll('.m-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        mobileHeaderChips.querySelectorAll('.m-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-cat');
        if (cat === 'music') {
          const el = document.getElementById('sectionStartListening');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (cat === 'podcasts') {
          showToast('Podcasts coming soon to Spotkify!');
        } else {
          mainScrollView.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ==========================================================================
  // SPOTKIFY AUTHENTICATION & LOGIN GATE (sharu / sharu@123)
  // ==========================================================================
  const loginGate = document.getElementById('spotkifyLoginGate');
  const loginForm = document.getElementById('spotkifyLoginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginAlertBox = document.getElementById('loginAlertBox');
  const loginAlertText = document.getElementById('loginAlertText');
  const btnTogglePw = document.getElementById('btnTogglePw');
  const chkRememberMe = document.getElementById('chkRememberMe');
  const btnProfileMenu = document.getElementById('btnProfileMenu');
  const profileDropdown = document.getElementById('profileDropdown');
  const profileMenuContainer = document.getElementById('profileMenuContainer');
  const btnLogout = document.getElementById('btnLogout');

  function isAuthenticated() {
    return localStorage.getItem('spotkify_auth') === 'true' || sessionStorage.getItem('spotkify_auth') === 'true';
  }

  function setupAuthentication() {
    if (isAuthenticated()) {
      document.body.classList.remove('locked');
      if (loginGate) {
        loginGate.style.display = 'none';
      }
      initAppData();
    } else {
      document.body.classList.add('locked');
      if (loginGate) {
        loginGate.classList.remove('fade-out');
        loginGate.style.display = 'flex';
      }
      if (loginUsername) {
        setTimeout(() => loginUsername.focus(), 150);
      }
    }

    // Input highlight & error reset
    [loginUsername, loginPassword].forEach(input => {
      if (!input) return;
      input.addEventListener('focus', () => {
        const wrap = input.closest('.input-container');
        if (wrap) {
          wrap.classList.add('focused');
          wrap.classList.remove('error');
        }
        if (loginAlertBox) loginAlertBox.classList.add('hidden');
      });
      input.addEventListener('blur', () => {
        const wrap = input.closest('.input-container');
        if (wrap) wrap.classList.remove('focused');
      });
    });

    // Password visibility toggle
    if (btnTogglePw && loginPassword) {
      btnTogglePw.addEventListener('click', () => {
        const isPw = loginPassword.getAttribute('type') === 'password';
        loginPassword.setAttribute('type', isPw ? 'text' : 'password');
        btnTogglePw.innerHTML = isPw
          ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`
          : `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
      });
    }

    // Login Form Submit (username: sharu, password: sharu@123)
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredUser = (loginUsername.value || '').trim();
        const enteredPass = loginPassword.value || '';

        // Strict verification
        if (enteredUser.toLowerCase() === 'sharu' && enteredPass === 'sharu@123') {
          // Success!
          if (loginAlertBox) loginAlertBox.classList.add('hidden');
          const remember = chkRememberMe ? chkRememberMe.checked : true;
          if (remember) {
            localStorage.setItem('spotkify_auth', 'true');
            localStorage.setItem('spotkify_user', 'sharu');
          } else {
            sessionStorage.setItem('spotkify_auth', 'true');
            sessionStorage.setItem('spotkify_user', 'sharu');
          }

          // Smooth reveal
          loginGate.classList.add('fade-out');
          setTimeout(() => {
            loginGate.style.display = 'none';
            document.body.classList.remove('locked');
          }, 350);

          showToast('Welcome to Spotkify, sharu!');
          initAppData();
        } else {
          // Invalid credentials
          if (loginAlertText) {
            loginAlertText.textContent = 'Incorrect username or password. Please try again.';
          }
          if (loginAlertBox) {
            loginAlertBox.classList.remove('hidden');
          }

          const card = loginGate.querySelector('.login-card');
          if (card) {
            card.classList.remove('shake');
            void card.offsetWidth; // Force reflow
            card.classList.add('shake');
          }

          const passWrap = loginPassword.closest('.input-container');
          if (passWrap) passWrap.classList.add('error');
          loginPassword.value = '';
          loginPassword.focus();
        }
      });
    }

    // Profile Dropdown Toggle
    if (btnProfileMenu && profileDropdown) {
      btnProfileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
        if (profileMenuContainer) {
          profileMenuContainer.classList.toggle('open');
        }
      });

      document.addEventListener('click', (e) => {
        if (profileMenuContainer && !profileMenuContainer.contains(e.target)) {
          profileDropdown.classList.add('hidden');
          profileMenuContainer.classList.remove('open');
        }
      });
    }

    // Logout Button Action
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('spotkify_auth');
        localStorage.removeItem('spotkify_user');
        sessionStorage.removeItem('spotkify_auth');
        sessionStorage.removeItem('spotkify_user');

        if (profileDropdown) profileDropdown.classList.add('hidden');
        if (profileMenuContainer) profileMenuContainer.classList.remove('open');

        // Stop audio immediately
        if (audio && !audio.paused) {
          audio.pause();
          isPlaying = false;
          updatePlayPauseIcons();
        }

        // Lock screen and display login gate
        document.body.classList.add('locked');
        if (loginGate) {
          loginGate.classList.remove('fade-out');
          loginGate.style.display = 'flex';
        }
        if (loginPassword) loginPassword.value = '';
        if (loginAlertBox) loginAlertBox.classList.add('hidden');
        if (loginUsername) {
          loginUsername.value = '';
          loginUsername.focus();
        }
        showToast('Logged out of Spotkify');
      });
    }
  }

  // Initialize Auth Gate
  setupAuthentication();
})();
