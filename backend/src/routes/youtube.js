const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');

// POST /api/youtube/search
router.post('/search', async (req, res) => {
  try {
    const { query, options } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing search query' });
    const results = await youtubeService.searchVideos(query, options);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to search YouTube' });
  }
});

// GET /api/youtube/video/:id
router.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await youtubeService.getVideoDetails(id);
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get video details' });
  }
});

// GET /api/youtube/channel/:id
router.get('/channel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await youtubeService.getChannelInfo(id);
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get channel info' });
  }
});

module.exports = router; 