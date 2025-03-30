<!DOCTYPE html>
<html lang="en">

<head>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Moderation Demo</title>
  <style>
    /* General Styles */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #e0f7fa; /* Light Teal */
      margin: 0;
      padding: 0;
      transition: background-color 0.5s ease-in-out;
    }

    #app-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    #chat-container {
      width: 450px;
      height: 400px;
      border: 1px solid #b2ebf2;
      overflow-y: auto;
      margin-bottom: 15px;
      padding: 15px;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column-reverse; /* Newest messages at the bottom */
    }

    .message {
      padding: 12px;
      margin-bottom: 12px;
      background-color: #f0f8ff; /* Light Alice Blue */
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      position: relative;
      animation: slideIn 0.4s ease-out forwards;
      transform-origin: top;
      line-height: 1.6; /* Added line spacing */
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px) scaleY(0.95);
      }

      to {
        opacity: 1;
        transform: translateY(0) scaleY(1);
      }
    }

    .message:last-child {
      margin-bottom: 0;
    }

    .message .sender {
      font-weight: bold;
      margin-right: 10px;
      color: #29b6f6; /* Light Blue Accent */
    }

    .head-of-conversation {
      font-style: italic;
      color: #4caf50; /* Green Accent */
    }

    /* Moderator Controls */
    .moderator-controls {
      display: flex;
      gap: 10px;
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    .message:hover .moderator-controls {
      opacity: 1;
    }

    .moderator-controls button {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      transition: background-color 0.3s ease, transform 0.2s ease-in-out;
    }

    .moderator-controls button:hover {
      transform: scale(1.08);
    }

    .delete-button {
      background-color: #e57373; /* Light Red */
      color: white;
    }

    .edit-button {
      background-color: #ffb74d; /* Light Orange */
      color: #333;
    }

    .edit-input {
      width: calc(100% - 80px);
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 5px;
      margin-right: 8px;
    }

    .edit-actions {
      display: flex;
      gap: 8px;
    }

    /* Input Area */
    #input-area {
      display: flex;
      gap: 15px;
      padding: 15px;
      background-color: #b2ebf2; /* Light Teal Accent */
      border-radius: 12px;
      box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
    }

    #message-input {
      flex-grow: 1;
      padding: 10px;
      border: 1px solid #80deea;
      border-radius: 8px;
      transition: border-color 0.3s ease-in-out;
      font-size: 1em;
    }

    #message-input:focus {
      border-color: #29b6f6;
      outline: none;
    }

    #send-button {
      padding: 10px 20px;
      background-color: #29b6f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.3s ease, transform 0.2s ease-in-out;
    }

    #send-button:hover {
      background-color: #03a9f4;
      transform: scale(1.05);
    }

    /* Graphics (Styled Emoji) */
    .message::before {
      content: "🗨️"; /* More modern chat bubble */
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 1em;
      color: #64b5f6; /* Slightly darker blue */
      margin-right: 5px; /* Space after emoji */
    }

    .sender::before {
      content: "👤";
      margin-right: 5px; /* Space after emoji */
      color: #7cb342; /* Greenish user icon */
    }

    /* File Input Area */
    #file-input-container {
      display: flex;
      align-items: center;
    }

    #file-label {
      background-color: #4db6ac; /* Teal */
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      transition: background-color 0.3s ease, transform 0.2s ease-in-out;
    }

    #file-label:hover {
      background-color: #26a69a;
      transform: scale(1.05);
    }

    #file-input {
      display: none; /* Hide the actual file input */
    }

    #selected-files {
      margin-left: 10px;
      font-size: 0.9em;
      color: #777;
    }

    .file-icon {
      margin-right: 3px;
    }
  </style>
</head>

<body>

  <div id="app-container">
    <div id="chat-container"></div>
  </div>

  <div id="input-area">
    <div id="file-input-container">
      <label for="file-input" id="file-label">
        <span class="file-icon">📎</span> Attach Files
      </label>
      <input type="file" id="file-input" multiple>
      <span id="selected-files">No files selected</span>
    </div>
    <input type="text" id="message-input" placeholder="Type your message">
    <button id="send-button">Send</button>
  </div>

  <script>
    const chatContainer = document.getElementById("chat-container");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const selectedFilesSpan = document.getElementById("selected-files");

    let messages = [];
    let messageIdCounter = 1;
    let userCounter = 1;
    let currentUserId = 1; // Simulate logged-in user
    let isModerator = true; // For demonstration, hardcoded moderator
    let editingMessageId = null; // Track currently edited message
    let headOfConversationId = null; // Track the user who started the conversation

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        const fileNames = Array.from(fileInput.files).map(file => file.name).join(", ");
        selectedFilesSpan.textContent = `Selected files: ${fileNames}`;
      } else {
        selectedFilesSpan.textContent = "No files selected";
      }
    });

    function displayMessage(message) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.setAttribute("data-message-id", message.id);

      let senderSpan = document.createElement("span");
      senderSpan.classList.add("sender");
      senderSpan.innerHTML = `<span class="sender-icon"></span>User ${message.userId}: `; // Using innerHTML for the icon
      if (message.userId === headOfConversationId && messages.length > 0 && messages[0].userId === headOfConversationId) {
        const headSpan = document.createElement("span");
        headSpan.classList.add("head-of-conversation");
        headSpan.textContent = "(Head)";
        senderSpan.appendChild(headSpan);
      }
      messageDiv.appendChild(senderSpan);

      let messageContent = document.createElement("span");
      messageContent.classList.add("message-content");
      if (message.type === 'text') {
        // Add extra space around the initial emoji
        messageContent.innerHTML = `&#x1F4AC;&nbsp;${message.content}`;
      } else if (message.type === 'file' && message.files && message.files.length > 0) {
        const fileList = document.createElement('ul');
        message.files.forEach(file => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<span class="file-icon">📄</span> ${file.name} (${formatFileSize(file.size)})`;
          fileList.appendChild(listItem);
        });
        messageContent.appendChild(fileList);
      } else {
        messageContent.textContent = message.content;
      }
      messageDiv.appendChild(messageContent);

      const moderatorControls = document.createElement("div");
      moderatorControls.classList.add("moderator-controls");

      // Only the message owner or moderator can edit/delete
      if (isModerator || currentUserId === message.userId) {
        if (isModerator || currentUserId === message.userId) {
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.classList.add("delete-button");
          deleteButton.addEventListener("click", () => deleteMessage(message.id));
          moderatorControls.appendChild(deleteButton);
        }

        // Only the message owner can edit text messages
        if (currentUserId === message.userId && message.type === 'text') {
          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.classList.add("edit-button");
          editButton.addEventListener("click", () => editMessage(message.id, messageContent)); // Pass content span
          moderatorControls.appendChild(editButton);
        }
      }

      messageDiv.appendChild(moderatorControls);

      chatContainer.prepend(messageDiv); // Add new messages to the top to maintain scroll
      // No need to manually scroll anymore with flex-direction-reverse
    }

    function sendMessage() {
      const content = messageInput.value.trim();
      const files = fileInput.files;

      if ((content || files.length > 0)) {
        const sender = "User " + userCounter;
        const message = {
          id: messageIdCounter++,
          sender: sender,
          userId: currentUserId,
          timestamp: new Date(),
        };

        if (content) {
          message.type = 'text';
          message.content = content;
          messages.push(message);
        }

        if (files.length > 0) {
          const fileMessage = { ...message, type: 'file', files: Array.from(files) };
          messages.push(fileMessage);
          // For simplicity in this demo, we don't actually upload files.
          console.log("Files to be sent:", files);
        }

        // Set the head of conversation if it's the first message
        if (messages.length === 1) {
          headOfConversationId = currentUserId;
        }

        updateChatDisplay();
        messageInput.value = "";
        fileInput.value = ""; // Clear selected files
        selectedFilesSpan.textContent = "No files selected";
        userCounter++;
        currentUserId++;
      }
    }

    function deleteMessage(id) {
      messages = messages.filter((message) => message.id !== id);
      updateChatDisplay();
    }

    function editMessage(id, messageContentSpan) {
      // Prevent multiple edits
      if (editingMessageId) {
        return;
      }
      editingMessageId = id;

      const currentText = messageContentSpan.textContent;
      messageContentSpan.innerHTML = ''; // Clear the text content

      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.classList.add("edit-input");
      editInput.value = currentText;

      const saveButton = document.createElement("button");
      saveButton.textContent = "Save";
      saveButton.classList.add("edit-button");

      const cancelButton = document.createElement("button");
      cancelButton.textContent = "Cancel";
      cancelButton.classList.add("delete-button");

      const editActions = document.createElement("div");
      editActions.classList.add("edit-actions");
      editActions.appendChild(saveButton);
      editActions.appendChild(cancelButton);

      const messageDiv = messageContentSpan.parentElement;
      const moderatorControls = messageDiv.querySelector(".moderator-controls");
      if (moderatorControls) {
        moderatorControls.style.display = 'none'; // Hide original buttons
      }

      messageContentSpan.appendChild(editInput);
      messageContentSpan.appendChild(editActions);

      editInput.focus();

      saveButton.addEventListener("click", () => {
        const newText = editInput.value.trim();
        if (newText) {
          const messageIndex = messages.findIndex(message => message.id === id);
          if (messageIndex !== -1) {
            messages[messageIndex].content = newText;
            updateChatDisplay(); // Re-render to show the edited message
          }
        }
        finishEditing(messageDiv);
      });

      cancelButton.addEventListener("click", () => {
        updateChatDisplay(); // Re-render to revert
        finishEditing(messageDiv);
      });

      editInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveButton.click();
        } else if (event.key === "Escape") {
          cancelButton.click();
        }
      });
    }

    function finishEditing(messageDiv) {
      const messageContentSpan = messageDiv.querySelector(".message-content");
      if (messageContentSpan) {
        const editInput = messageContentSpan.querySelector(".edit-input");
        const editActions = messageContentSpan.querySelector(".edit-actions");
        const moderatorControls = messageDiv.querySelector(".moderator-controls");

        if (editInput) messageContentSpan.removeChild(editInput);
        if (editActions) messageContentSpan.removeChild(editActions);
        if (moderatorControls) moderatorControls.style.display = 'flex'; // Show original buttons
        editingMessageId = null;
      }
    }

    function updateChatDisplay() {
      chatContainer.innerHTML = "";
      messages.forEach(displayMessage);
    }

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((
              bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    });

    // Initial display (if any messages exist)
    updateChatDisplay();
  </script>

</body>

</html>
