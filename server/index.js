require('dotenv').config();
const path = require('node:path');
const express = require('express');
const cors = require('cors');

// Initialize database
require('./db/database');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const searchRoutes = require('./routes/search');
const songsRoutes = require('./routes/songs');
const playbackRoutes = require('./routes/playback');
const artistsRoutes = require('./routes/artists');
const albumsRoutes = require('./routes/albums');
const playlistsRoutes = require('./routes/playlists');
const libraryRoutes = require('./routes/library');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4534;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Structured Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/api/health')) {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Spotkify Music Streaming API',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/playback', playbackRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/history', libraryRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`[Server] Spotkify API server listening on http://localhost:${PORT}`);
});

module.exports = { app, server };
