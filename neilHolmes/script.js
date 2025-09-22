document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');

    // Function to add a message to the chat
    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        // Replace newlines with <br> tags and preserve other HTML
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Function to send message to the server
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';

        try {
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.id = 'typing-indicator';
            typingIndicator.className = 'message bot-message';
            typingIndicator.innerHTML = 'Detective Oracle is thinking...';
            chatContainer.appendChild(typingIndicator);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // Send message to server
            const response = await fetch('http://localhost:3000/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: message })
            });

            // Remove typing indicator
            chatContainer.removeChild(typingIndicator);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Remove double asterisks from the response
            const cleanResponse = data.response.replace(/\*\*/g, '');
            addMessage(cleanResponse, false);
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again later.', false);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus the input field on page load
    userInput.focus();
});
