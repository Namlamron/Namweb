const chatBox = document.getElementById('chat');
const eventsList = document.getElementById('eventsList');
const chatInput = document.getElementById('chatInput');
const sendMessageButton = document.getElementById('sendMessage');

// Connect to the vnayn WebSocket server
const vnaynSocket = new WebSocket('ws://localhost:21213/vnayn');

// Listen for messages from the vnayn WebSocket
vnaynSocket.onmessage = function (event) {
    const parsedMessage = JSON.parse(event.data);

    // Handle incoming chat messages
    if (parsedMessage.command === "tiktokChat" || parsedMessage.command === "twitchChat") {
        displayChatMessage(parsedMessage.user, parsedMessage.message);
    }

    // Handle other events
    if (parsedMessage.command === "tiktokGreet") {
        displayEvent(`${parsedMessage.user} joined the TikTok stream!`);
    }

    if (parsedMessage.command === "twitchSub") {
        displayEvent(`${parsedMessage.user} subscribed on Twitch!`);
    }

    // Add other event types as needed
};

// Function to display a chat message
function displayChatMessage(user, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${user}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}

// Function to display an event
function displayEvent(eventMessage) {
    const eventElement = document.createElement('li');
    eventElement.textContent = eventMessage;
    eventsList.appendChild(eventElement);
}

// Handle sending chat messages
sendMessageButton.onclick = function () {
    const message = chatInput.value;
    if (message.trim()) {
        // Send message to both TikTok and Twitch (implement this in your server)
        vnaynSocket.send(JSON.stringify({ command: "sendMessage", text: message }));
        chatInput.value = ''; // Clear input
    }
};
