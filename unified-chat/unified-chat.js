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

        this.initializeEventListeners();
        this.initializePlatformConnections();
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
        // Initialize Twitch connection
        this.initializeTwitchConnection();
        
        // Initialize YouTube connection
        this.initializeYouTubeConnection();
        
        // Initialize TikTok connection
        this.initializeTikTokConnection();
    }

    initializeTwitchConnection() {
        // TODO: Implement Twitch chat connection using tmi.js
        // This will require your Twitch OAuth token and channel name
    }

    initializeYouTubeConnection() {
        // TODO: Implement YouTube chat connection using YouTube API
        // This will require your YouTube API key and channel ID
    }

    initializeTikTokConnection() {
        // TODO: Implement TikTok chat connection using TikTok API
        // This will require your TikTok API credentials
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

        // TODO: Implement message sending to all active platforms
        // This will require proper authentication and API implementations
        
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