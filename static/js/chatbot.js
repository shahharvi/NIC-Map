// Modern Chatbot Functionality
function fillExample(text) {
    const businessDesc = document.getElementById('businessDescription');
    if (businessDesc) {
        businessDesc.value = text;
    }
}

function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    const chatButton = document.querySelector('.chat-button');
    
    if (chatbot.classList.contains('show')) {
        chatbot.classList.remove('show');
        chatButton.innerHTML = '💬';
        chatButton.setAttribute('aria-label', 'Open chat');
    } else {
        chatbot.classList.add('show');
        chatButton.innerHTML = '✕';
        chatButton.setAttribute('aria-label', 'Close chat');
        
        // Focus on input when opening
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 300);
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendButton = document.querySelector('.send-button');
    const message = input.value.trim();
    
    if (!message) return;

    // Disable input and button while sending
    input.disabled = true;
    sendButton.disabled = true;
    sendButton.innerHTML = '⏳';

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Send to backend
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
    })
        .then(response => response.json())
        .then(data => {
            hideTypingIndicator();
            if (data.success) {
                setTimeout(() => {
                    addMessage(data.response, 'bot');
                }, 300);
            } else {
                addMessage(data.response || 'Sorry, I encountered an error. Please try again.', 'bot');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            hideTypingIndicator();
            setTimeout(() => {
                addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }, 300);
        })
        .finally(() => {
            // Re-enable input and button
            input.disabled = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '→';
            input.focus();
        });
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Check if it's a bot response with NIC codes
    if (sender === 'bot' && text.includes('Here are') && text.includes('NIC codes:')) {
        contentDiv.innerHTML = formatNICResponse(text);
    } else {
        contentDiv.textContent = text;
    }

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Smooth scroll to bottom
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

function formatNICResponse(text) {
    const lines = text.split('\n');
    let html = `<div class="nic-results">`;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('Here are') && line.includes('NIC codes:')) {
            html += `<h4>${line}</h4>`;
        } else if (line.startsWith('- ') && line.includes(':')) {
            const parts = line.substring(2).split(':');
            if (parts.length >= 2) {
                const code = parts[0].trim();
                const rest = parts.slice(1).join(':').trim();
                const matchIndex = rest.lastIndexOf('(');
                
                let description = rest;
                let confidence = '';
                
                if (matchIndex > 0) {
                    description = rest.substring(0, matchIndex).trim();
                    confidence = rest.substring(matchIndex);
                }
                
                html += `
                    <div class="nic-item">
                        <div class="nic-code">${code}</div>
                        <div class="nic-description">${description}</div>
                        ${confidence ? `<div class="nic-confidence">${confidence}</div>` : ''}
                    </div>
                `;
            }
        }
    }
    
    html += `</div>`;
    return html;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <span>Assistant is typing</span>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    const input = document.getElementById('chatInput');
    if (input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('chatInput');
    // Check if user is logged in (from a global JS variable set in template)
    var isLoggedIn = window.isLoggedIn !== undefined ? window.isLoggedIn : true;
    if (!isLoggedIn) {
        if (input) {
            input.disabled = true;
            input.placeholder = "Please log in to use the chatbot.";
        }
        const sendButton = document.querySelector('.send-button');
        if (sendButton) sendButton.disabled = true;
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            const msg = document.createElement('div');
            msg.className = 'welcome-message';
            msg.innerHTML = `<div class="welcome-text"><strong>🔒 Please log in to use the NIC Code Assistant.</strong></div>`;
            messagesContainer.appendChild(msg);
        }
        return;
    }
    if (input) {
        input.addEventListener('input', autoResizeTextarea);
        input.addEventListener('keypress', handleChatKeypress);
    }
    // Close chat when clicking outside
    document.addEventListener('click', function(event) {
        const chatbot = document.getElementById('chatbot');
        const chatButton = document.querySelector('.chat-button');
        if (chatbot && chatbot.classList.contains('show') && 
            !chatbot.contains(event.target) && 
            !chatButton.contains(event.target)) {
            toggleChat();
        }
    });
    // Add welcome message if chat is empty
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer && messagesContainer.children.length === 0) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <div class="welcome-text">
                <strong>👋 Welcome to NIC Code Assistant!</strong><br>
                I'm here to help you find the right NIC codes for your business. 
                Just describe what your business does and I'll provide relevant codes with confidence scores.
            </div>
        `;
        messagesContainer.appendChild(welcomeDiv);
    }
});