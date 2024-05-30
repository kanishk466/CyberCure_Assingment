const socket = io();
        let name;
        let currentRecipient = '';
        let textarea = document.querySelector('#textarea');
        let recipientInput = document.querySelector('#recipient');
        let messageArea = document.querySelector('.message__area');
      
        let messageHistories = {}; // Store message histories for each recipient

        do {
            name = prompt('Please enter your name: ');
            
        } while (!name);

        socket.emit('register', name);
        document.getElementById('senderName').innerHTML=name;

        recipientInput.addEventListener('input', () => {
            currentRecipient = recipientInput.value.trim();
            displayMessagesForCurrentRecipient();
        });

        textarea.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                sendMessage(e.target.value);
            }
        });

        function sendMessage(message) {
            if (!currentRecipient) {
                alert('Please enter a recipient username.');
                return;
            }

            let msg = {
                to: currentRecipient,
                message: message.trim()
            };

            // Append
            appendMessage({ user: currentRecipient, message: msg.message }, 'outgoing');
            textarea.value = '';
            scrollToBottom();

            // Save to message history
            saveMessageToHistory(currentRecipient, { user: name, message: msg.message }, 'outgoing');

            // Send to server
            socket.emit('private_message', msg);
        }

        function appendMessage(msg, type) {
            let mainDiv = document.createElement('div');
            let className = type;
            mainDiv.classList.add(className, 'message');

            let markup = `
                <h4>${msg.user}</h4>
                <p>${msg.message}</p>
            `;
            mainDiv.innerHTML = markup;
            messageArea.appendChild(mainDiv);
        }

        function saveMessageToHistory(recipient, msg, type) {
            if (!messageHistories[recipient]) {
                messageHistories[recipient] = [];
            }
            messageHistories[recipient].push({ msg, type });
        }

        function displayMessagesForCurrentRecipient() {
            messageArea.innerHTML = '';
            const messages = messageHistories[currentRecipient] || [];
            messages.forEach(({ msg, type }) => {
                appendMessage(msg, type);
            });
        }

        // Receive private messages
        socket.on('private_message', (msg) => {
            // Only display the message if it's relevant to the current recipient
            if (msg.from === currentRecipient || msg.user === currentRecipient) {
                appendMessage(msg, 'incoming');
                scrollToBottom();
            }
            // Save to message history
            saveMessageToHistory(msg.from, msg, 'incoming');
        });

        function scrollToBottom() {
            messageArea.scrollTop = messageArea.scrollHeight;
        }
