// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

let playerCache = null;
let lastFetch = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

app.get("/api/players", async (req, res) => {
  const now = Date.now();

  if (playerCache && now - lastFetch < CACHE_DURATION) {
    return res.json(playerCache);
  }

  try {
    const response = await fetch("https://api.sleeper.app/v1/players/nfl");
    const data = await response.json();
    playerCache = data;
    lastFetch = now;
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch player data", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

module.exports = app;
