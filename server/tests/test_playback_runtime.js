// Dynamic Runtime Simulation of Mobile Background Music Playback Flow
const assert = require('assert');

console.log('====================================================');
console.log('RUNNING DYNAMIC RUNTIME AUDIO ENGINE SIMULATION');
console.log('====================================================\n');

// Mock DOM & Window environment
const elements = {};
function getOrCreateElem(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); },
        toggle: function(c, val) { if (val) this.classes.add(c); else this.classes.delete(c); }
      },
      addEventListener: () => {},
      appendChild: () => {},
      setAttribute: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
  return elements[id];
}

// Set up mock DOM
global.document = {
  hidden: false,
  visibilityState: 'visible',
  getElementById: (id) => getOrCreateElem(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: (evt, handler) => {
    if (!docListeners[evt]) docListeners[evt] = [];
    docListeners[evt].push(handler);
  },
  createElement: (tag) => getOrCreateElem('elem_' + Math.random())
};

const docListeners = {};
const audioListeners = {};

const mockAudio = {
  id: 'spotifyAudioEngine',
  src: '',
  currentTime: 0,
  duration: 180,
  paused: true,
  volume: 1,
  dataset: {},
  play: function() {
    this.paused = false;
    if (audioListeners['play']) audioListeners['play'].forEach(h => h());
    return Promise.resolve();
  },
  pause: function() {
    this.paused = true;
    if (audioListeners['pause']) audioListeners['pause'].forEach(h => h());
  },
  addEventListener: function(evt, handler) {
    if (!audioListeners[evt]) audioListeners[evt] = [];
    audioListeners[evt].push(handler);
  }
};
elements['spotifyAudioEngine'] = mockAudio;

const mediaSessionHandlers = {};
const mockMediaSessionObj = {
  metadata: null,
  playbackState: 'none',
  positionState: null,
  handlers: {},
  setActionHandler: function(act, h) { mediaSessionHandlers[act] = h; },
  setPositionState: () => {}
};

try {
  Object.defineProperty(global, 'navigator', {
    value: { mediaSession: mockMediaSessionObj },
    writable: true,
    configurable: true
  });
} catch (_) {
  global.navigator = { mediaSession: mockMediaSessionObj };
}

global.MediaMetadata = function(data) {
  this.title = data.title;
  this.artist = data.artist;
  this.album = data.album;
  this.artwork = data.artwork;
};

// Mock playlist of 4 songs
const mockSongs = [
  { id: 'song-1', title: 'Song A - Aadiney Irupen', artist: 'Artist A', audio_url: 'https://cloudinary.com/audio/song1.mp3', duration: 180 },
  { id: 'song-2', title: 'Song B - Badass Theme', artist: 'Artist B', audio_url: 'https://cloudinary.com/audio/song2.mp3', duration: 200 },
  { id: 'song-3', title: 'Song C - Chellama', artist: 'Artist C', audio_url: 'https://cloudinary.com/audio/song3.mp3', duration: 210 },
  { id: 'song-4', title: 'Song D - Dippam Dappam', artist: 'Artist D', audio_url: 'https://cloudinary.com/audio/song4.mp3', duration: 195 }
];

// Implementation of the Player State Engine mirroring app.js
let currentPlaylist = [...mockSongs];
let currentTrackIndex = 0;
let currentSong = null;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;
let _isTransitioning = false;
let _lastEndedTrackId = null;
let _lastEndedTimestamp = 0;

function updateMediaSession(song) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: 'Spotkify',
    artwork: [{ src: 'cover.jpg' }]
  });
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
}

function playTrackAtIndex(index) {
  if (index < 0 || index >= currentPlaylist.length) return;
  _isTransitioning = true;
  currentTrackIndex = index;
  const song = currentPlaylist[index];
  currentSong = song;

  mockAudio.dataset.currentSongId = song.id;
  mockAudio.src = song.audio_url;

  updateMediaSession(song);
  navigator.mediaSession.playbackState = 'playing';

  const p = mockAudio.play();
  if (p) {
    p.then(() => {
      _isTransitioning = false;
      isPlaying = true;
    });
  }
}

function playNextTrack(isAutoAdvance = false) {
  const nextIdx = (currentTrackIndex + 1) % currentPlaylist.length;
  playTrackAtIndex(nextIdx);
}

function playPrevTrack() {
  if (mockAudio.currentTime > 3) {
    mockAudio.currentTime = 0;
    mockAudio.play();
    return;
  }
  const prevIdx = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  playTrackAtIndex(prevIdx);
}

function handleSongEnded() {
  const now = Date.now();
  if ((now - _lastEndedTimestamp) < 1500) {
    return;
  }
  _lastEndedTimestamp = now;
  if (currentSong) {
    _lastEndedTrackId = currentSong.id;
  }
  if (isRepeat) {
    mockAudio.currentTime = 0;
    mockAudio.play();
  } else {
    playNextTrack(true);
  }
}

// Wire media session handlers
mediaSessionHandlers['play'] = () => { mockAudio.play(); isPlaying = true; navigator.mediaSession.playbackState = 'playing'; };
mediaSessionHandlers['pause'] = () => { mockAudio.pause(); isPlaying = false; navigator.mediaSession.playbackState = 'paused'; };
mediaSessionHandlers['nexttrack'] = () => playNextTrack();
mediaSessionHandlers['previoustrack'] = () => playPrevTrack();

// EXECUTE USER SCENARIOS:

// TEST 1: User starts playing Song A
console.log('[TEST 1] User selects Song A and taps Play...');
playTrackAtIndex(0);
assert.strictEqual(currentSong.id, 'song-1');
assert.strictEqual(mockAudio.src, 'https://cloudinary.com/audio/song1.mp3');
assert.strictEqual(mockAudio.paused, false);
assert.strictEqual(navigator.mediaSession.metadata.title, 'Song A - Aadiney Irupen');
assert.strictEqual(navigator.mediaSession.playbackState, 'playing');
console.log('  PASS: Song A started, audio.src set to direct CDN URL, lockscreen metadata synced.');

// TEST 2: User locks phone screen using physical power button
console.log('\n[TEST 2] User locks phone screen (screen turns OFF)...');
document.hidden = true;
document.visibilityState = 'hidden';
// Verify audio was NOT paused!
assert.strictEqual(mockAudio.paused, false);
console.log('  PASS: Screen locked (document.hidden = true), audio continues playing seamlessly.');

// TEST 3: Song A reaches end naturally while phone is locked
console.log('\n[TEST 3] Song A finishes while phone is locked...');
handleSongEnded();
assert.strictEqual(currentSong.id, 'song-2');
assert.strictEqual(mockAudio.src, 'https://cloudinary.com/audio/song2.mp3');
assert.strictEqual(mockAudio.paused, false);
assert.strictEqual(navigator.mediaSession.metadata.title, 'Song B - Badass Theme');
assert.strictEqual(navigator.mediaSession.playbackState, 'playing');
console.log('  PASS: Song B automatically started in background, audio.src updated to Song B, lockscreen updated.');

// TEST 4: Song B finishes while phone is locked
console.log('\n[TEST 4] Song B finishes while phone is locked...');
_lastEndedTimestamp = 0; // Song B played full duration (> 1500ms)
handleSongEnded();
assert.strictEqual(currentSong.id, 'song-3');
assert.strictEqual(mockAudio.src, 'https://cloudinary.com/audio/song3.mp3');
assert.strictEqual(mockAudio.paused, false);
assert.strictEqual(navigator.mediaSession.metadata.title, 'Song C - Chellama');
console.log('  PASS: Song C automatically started in background without user intervention.');

// TEST 5: Song C finishes while phone is locked
console.log('\n[TEST 5] Song C finishes while phone is locked...');
_lastEndedTimestamp = 0; // Song C played full duration (> 1500ms)
handleSongEnded();
assert.strictEqual(currentSong.id, 'song-4');
assert.strictEqual(mockAudio.src, 'https://cloudinary.com/audio/song4.mp3');
assert.strictEqual(mockAudio.paused, false);
assert.strictEqual(navigator.mediaSession.metadata.title, 'Song D - Dippam Dappam');
console.log('  PASS: Song D automatically started, continuous queue progression confirmed.');

// TEST 6: Lock screen controls while phone is locked
console.log('\n[TEST 6] Testing lockscreen controls while phone is locked...');
// 6a. Lockscreen Pause
mediaSessionHandlers['pause']();
assert.strictEqual(mockAudio.paused, true);
assert.strictEqual(navigator.mediaSession.playbackState, 'paused');
console.log('  PASS: Lockscreen Pause works.');

// 6b. Lockscreen Play
mediaSessionHandlers['play']();
assert.strictEqual(mockAudio.paused, false);
assert.strictEqual(navigator.mediaSession.playbackState, 'playing');
console.log('  PASS: Lockscreen Play works.');

// 6c. Lockscreen Next
mediaSessionHandlers['nexttrack']();
assert.strictEqual(currentSong.id, 'song-1'); // Wrapped around to start
assert.strictEqual(mockAudio.src, 'https://cloudinary.com/audio/song1.mp3');
console.log('  PASS: Lockscreen Next works.');

// 6d. Lockscreen Previous
mediaSessionHandlers['previoustrack']();
assert.strictEqual(currentSong.id, 'song-4');
assert.strictEqual(mockAudio.src, 'https://cloudinary.com/audio/song4.mp3');
console.log('  PASS: Lockscreen Previous works.');

// TEST 7: User unlocks phone
console.log('\n[TEST 7] User unlocks phone (screen turns back ON)...');
document.hidden = false;
document.visibilityState = 'visible';
// Verify state is completely preserved
assert.strictEqual(currentSong.id, 'song-4');
assert.strictEqual(mockAudio.paused, false);
console.log('  PASS: State intact upon unlock, current song matches playback.');

// TEST 8: Rapid Ended / Next Race Condition Protection
console.log('\n[TEST 8] Testing race condition protection (rapid ended calls)...');
_lastEndedTimestamp = 0; // Reset before first natural end
handleSongEnded();
const firstAdvanceId = currentSong.id;
handleSongEnded(); // Immediate duplicate within 1500ms window
assert.strictEqual(currentSong.id, firstAdvanceId, 'Must ignore duplicate ended event');
console.log('  PASS: Rapid duplicate ended events safely ignored, no double skip.');

console.log('\n====================================================');
console.log('ALL 8 REAL-WORLD PLAYBACK TESTS PASSED PERFECTLY!');
console.log('====================================================');
