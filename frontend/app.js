const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");

button.addEventListener("click", () => {
    const message = input.value.trim();
    if (!message) return;

    chatBox.innerHTML += `<div><b>You:</b> ${message}</div>`;
    input.value = "";

    const aiDiv = document.createElement("div");
    aiDiv.innerHTML = "<b>Mars AI:</b> ";
    chatBox.appendChild(aiDiv);

    // SSE connection
    const eventSource = new EventSource(`http://localhost:8081/sse-chat?message=${encodeURIComponent(message)}`);

    let aiMessage = "";

    eventSource.onmessage = (e) => {
        aiMessage += e.data;
        aiDiv.innerHTML = "<b>Mars AI:</b> " + aiMessage;
    };

    eventSource.addEventListener("done", () => {
        eventSource.close();
    });

    eventSource.onerror = () => {
        eventSource.close();
    };
});