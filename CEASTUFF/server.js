const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');
const tmi = require('tmi.js');
const path = require('path');

// Initialize Express app
const app = express();
const port = 3000; // Choose a port number

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// TikTok Username
let tiktokUsername = "jayfox_99";

// Twitch configuration
const twitchClient = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'namlamron',
        password: 'oauth:s0g3k7olhg0r8vqkrt835n9lfq592j'
    },
    channels: ['namlamron'] 
});

// Connect to vnayn WebSocket server
let vnaynSocket = new WebSocket('ws://localhost:21213/vnayn');

// Create a TikTok Live connection
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// ... (rest of your existing Node.js code)

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
