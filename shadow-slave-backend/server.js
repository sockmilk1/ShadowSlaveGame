const express = require('express');
const cors = require('cors');

const app = express();

// Allow cross-origin requests (frontend runs on different port)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Simple in-memory storage for player data (replace with DB later)
let players = {};

// Save player data endpoint
app.post('/api/save', (req, res) => {
  const { playerId, data } = req.body;

  if (!playerId || !data) {
    return res.status(400).json({ error: 'Missing playerId or data' });
  }

  players[playerId] = data;
  console.log(`Saved player ${playerId}`);
  res.json({ status: 'success' });
});

// Load player data endpoint
app.get('/api/load/:playerId', (req, res) => {
  const playerId = req.params.playerId;

  if (!players[playerId]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  res.json(players[playerId]);
});

// Start the server on port 4000
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
