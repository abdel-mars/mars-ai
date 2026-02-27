const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");
const recordBtn = document.getElementById("record-btn");

let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
} else {
    alert("Speech recognition not supported in this browser.");
}

recognition.lang = 'en-US';
recognition.interimResults = true; // show live transcript
recognition.continuous = false;    // stops automatically after user pauses

let currentEventSource = null;

// Record button click
recordBtn.addEventListener("click", () => {
    if (!recognition) return;

    // Disable button to prevent multiple clicks
    recordBtn.disabled = true;

    // Create a new temporary div for live transcript each time
    const liveDiv = document.createElement("div");
    liveDiv.style.fontStyle = "italic";
    liveDiv.style.color = "#555";
    liveDiv.innerHTML = "<i>Listening...</i>";
    chatBox.appendChild(liveDiv);

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    recognition.liveDiv = liveDiv; // attach for use in onresult
    recognition.start();
    recordBtn.textContent = "Listening...";
});

// Mic onresult — update live transcript
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (recognition.liveDiv) {
        recognition.liveDiv.innerHTML = "<i>Listening:</i> " + transcript;
    }

    // Only set input.value if this is the final result
    if (event.results[0].isFinal) {
        input.value = transcript;
    }
};

// When mic stops, send final transcript
recognition.onend = () => {
    const finalTranscript = input.value.trim();

    // Remove liveDiv after stopping
    if (recognition.liveDiv) {
        chatBox.removeChild(recognition.liveDiv);
        recognition.liveDiv = null;
    }

    if (finalTranscript) {
        sendMessage(finalTranscript);
    }

    recordBtn.disabled = false;
    recordBtn.textContent = "🎤 Speak";
};

// Mic errors
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (recognition.liveDiv) {
        recognition.liveDiv.innerHTML += ` <b>(Error: ${event.error})</b>`;
        setTimeout(() => {
            chatBox.removeChild(recognition.liveDiv);
            recognition.liveDiv = null;
        }, 3000);
    }
    recordBtn.disabled = false;
    recordBtn.textContent = "🎤 Speak";
};

// Send button click
button.addEventListener("click", () => {
    const message = input.value.trim();
    if (!message) return;
    sendMessage(message);
});

// Send message function — handles SSE
function sendMessage(message) {
    // Close previous SSE if still open
    if (currentEventSource) currentEventSource.close();

    // Append user's final message
    const userDiv = document.createElement("div");
    userDiv.innerHTML = `<b>You:</b> ${message}`;
    chatBox.appendChild(userDiv);

    input.value = "";

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // Create AI message div
    const aiDiv = document.createElement("div");
    aiDiv.innerHTML = "<b>Mars AI:</b> <i>typing...</i>";
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    currentEventSource = new EventSource(`http://localhost:8081/sse-chat?message=${encodeURIComponent(message)}`);

    let aiMessage = "";

    currentEventSource.onmessage = (e) => {
        aiMessage += e.data;
        aiDiv.innerHTML = "<b>Mars AI:</b> " + aiMessage;
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    currentEventSource.addEventListener("done", () => currentEventSource.close());

    currentEventSource.onerror = (err) => {
        console.error("SSE error:", err);
        aiDiv.innerHTML += " <b>(Connection error)</b>";
        currentEventSource.close();
    };
}