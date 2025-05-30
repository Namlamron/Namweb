// Auto-reload functionality
class AutoReloader {
    constructor() {
        this.lastModified = new Date().getTime();
        this.checkInterval = 5000; // Check every 5 seconds
        this.startChecking();
    }

    startChecking() {
        setInterval(() => this.checkForUpdates(), this.checkInterval);
    }

    async checkForUpdates() {
        try {
            const response = await fetch(window.location.href, { method: 'HEAD' });
            const lastModified = new Date(response.headers.get('last-modified')).getTime();
            
            if (lastModified > this.lastModified) {
                console.log('Changes detected, reloading...');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }
}

class UnifiedChat {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.platformToggles = document.querySelectorAll('.platform-toggle');
        
        this.activePlatforms = {
            twitch: true,
            youtube: true,
            tiktok: true
        };

        // Platform clients
        this.twitchClient = null;
        this.youtubeClient = null;
        this.tiktokClient = null;

        // Configuration
        this.config = {
            twitch: {
                channel: 'namlamron', // Your Twitch channel name
                clientId: '', // Will be set from environment
                accessToken: '' // Will be set from environment
            },
            youtube: {
                channelId: '', // Will be set from environment
                apiKey: '' // Will be set from environment
            },
            tiktok: {
                username: 'namlamron', // Your TikTok username
                clientKey: '', // Will be set from environment
                clientSecret: '' // Will be set from environment
            }
        };

        this.initializeEventListeners();
        this.loadConfig();
    }

    async loadConfig() {
        try {
            // Load configuration from environment variables
            const response = await fetch('/api/config');
            const config = await response.json();
            
            // Update config with environment variables
            this.config.twitch.clientId = config.TWITCH_CLIENT_ID;
            this.config.twitch.accessToken = config.TWITCH_ACCESS_TOKEN;
            this.config.youtube.channelId = config.YOUTUBE_CHANNEL_ID;
            this.config.youtube.apiKey = config.YOUTUBE_API_KEY;
            this.config.tiktok.clientKey = config.TIKTOK_CLIENT_KEY;
            this.config.tiktok.clientSecret = config.TIKTOK_CLIENT_SECRET;

            // Initialize platform connections
            this.initializePlatformConnections();
        } catch (error) {
            console.error('Error loading configuration:', error);
            // Fallback to test messages if config loading fails
            this.addTestMessages();
        }
    }

    initializeEventListeners() {
        // Platform toggles
        this.platformToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const platform = toggle.dataset.platform;
                this.activePlatforms[platform] = !this.activePlatforms[platform];
                toggle.classList.toggle('active');
            });
        });

        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    initializePlatformConnections() {
        this.initializeTwitchConnection();
        this.initializeYouTubeConnection();
        this.initializeTikTokConnection();
    }

    initializeTwitchConnection() {
        if (!this.config.twitch.clientId || !this.config.twitch.accessToken) {
            console.warn('Twitch credentials not configured');
            return;
        }

        this.twitchClient = new tmi.Client({
            options: { debug: true },
            connection: {
                secure: true,
                reconnect: true
            },
            identity: {
                username: this.config.twitch.channel,
                password: `oauth:${this.config.twitch.accessToken}`
            },
            channels: [this.config.twitch.channel]
        });

        this.twitchClient.connect().catch(console.error);

        this.twitchClient.on('message', (channel, tags, message, self) => {
            if (self) return;
            this.addMessage('twitch', tags.username, message);
        });
    }

    initializeYouTubeConnection() {
        if (!this.config.youtube.apiKey || !this.config.youtube.channelId) {
            console.warn('YouTube credentials not configured');
            return;
        }

        // Load the YouTube API
        gapi.load('client', () => {
            gapi.client.init({
                apiKey: this.config.youtube.apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
            }).then(() => {
                // Set up polling for live chat messages
                this.pollYouTubeChat();
            }).catch(console.error);
        });
    }

    async pollYouTubeChat() {
        try {
            const response = await gapi.client.youtube.liveChatMessages.list({
                liveChatId: this.config.youtube.channelId,
                part: 'snippet'
            });

            const messages = response.result.items;
            messages.forEach(message => {
                const username = message.snippet.authorDisplayName;
                const text = message.snippet.displayMessage;
                this.addMessage('youtube', username, text);
            });

            // Poll again after the suggested polling interval
            setTimeout(() => this.pollYouTubeChat(), response.result.pollingIntervalMillis);
        } catch (error) {
            console.error('Error polling YouTube chat:', error);
        }
    }

    initializeTikTokConnection() {
        if (!this.config.tiktok.clientKey || !this.config.tiktok.clientSecret) {
            console.warn('TikTok credentials not configured');
            return;
        }

        // Initialize TikTok WebSocket connection
        this.tiktokClient = new WebSocket('wss://webcast.tiktok.com/ws');
        
        this.tiktokClient.onopen = () => {
            console.log('TikTok WebSocket connected');
            // Authenticate with TikTok
            this.tiktokClient.send(JSON.stringify({
                type: 'auth',
                client_key: this.config.tiktok.clientKey,
                client_secret: this.config.tiktok.clientSecret
            }));
        };

        this.tiktokClient.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'chat':
                    this.addMessage('tiktok', data.user.nickname, data.content);
                    break;
                case 'gift':
                    this.addMessage('tiktok', 'System', `${data.user.nickname} sent a gift: ${data.gift.name}`);
                    break;
                case 'like':
                    this.addMessage('tiktok', 'System', `${data.user.nickname} sent ${data.likeCount} likes`);
                    break;
                case 'member_join':
                    this.addMessage('tiktok', 'System', `${data.user.nickname} joined the stream`);
                    break;
                case 'error':
                    console.error('TikTok WebSocket error:', data.message);
                    break;
            }
        };

        this.tiktokClient.onerror = (error) => {
            console.error('TikTok WebSocket error:', error);
        };

        this.tiktokClient.onclose = () => {
            console.log('TikTok WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.initializeTikTokConnection(), 5000);
        };
    }

    addTestMessages() {
        // Add some test messages to demonstrate the UI
        setTimeout(() => {
            this.addMessage('twitch', 'TestUser1', 'Hello from Twitch!');
        }, 1000);

        setTimeout(() => {
            this.addMessage('youtube', 'TestUser2', 'Hello from YouTube!');
        }, 2000);

        setTimeout(() => {
            this.addMessage('tiktok', 'TestUser3', 'Hello from TikTok!');
        }, 3000);
    }

    addMessage(platform, username, message) {
        if (!this.activePlatforms[platform]) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${platform}`;
        
        const platformIcon = document.createElement('span');
        platformIcon.className = 'platform-icon';
        platformIcon.innerHTML = this.getPlatformIcon(platform);
        
        const usernameElement = document.createElement('span');
        usernameElement.className = 'username';
        usernameElement.textContent = username;
        
        const messageContent = document.createElement('span');
        messageContent.className = 'message';
        messageContent.textContent = message;
        
        messageElement.appendChild(platformIcon);
        messageElement.appendChild(usernameElement);
        messageElement.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    getPlatformIcon(platform) {
        switch (platform) {
            case 'twitch':
                return '<i class="fab fa-twitch"></i>';
            case 'youtube':
                return '<i class="fab fa-youtube"></i>';
            case 'tiktok':
                return '<i class="fab fa-tiktok"></i>';
            default:
                return '';
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Send message to all active platforms
        if (this.activePlatforms.twitch && this.twitchClient) {
            this.twitchClient.say(this.config.twitch.channel, message)
                .catch(error => console.error('Error sending Twitch message:', error));
        }

        if (this.activePlatforms.youtube) {
            // YouTube chat messages can only be sent by the channel owner
            // This would require additional authentication
            console.log('YouTube chat messages can only be sent by the channel owner');
        }

        if (this.activePlatforms.tiktok && this.tiktokClient) {
            // Send message to TikTok chat
            this.tiktokClient.send(JSON.stringify({
                type: 'chat',
                content: message
            }));
        }

        // Add the message to the chat UI
        this.addMessage('twitch', 'You', message);
        this.messageInput.value = '';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the chat and auto-reloader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new UnifiedChat();
    new AutoReloader();
}); 