package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func sseChatHandler(w http.ResponseWriter, r *http.Request) {
    // CORS headers
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    // Handle preflight
    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }

    // SSE requires GET
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Get user message from query param
    userMessage := r.URL.Query().Get("message")
    if userMessage == "" {
        userMessage = "..."
    }

    // Prepare response
    responseMessage := GenerateMarsResponse(userMessage)

    // SSE headers
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")

    flusher, ok := w.(http.Flusher)
    if !ok {
        http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
        return
    }

    // Send each character as a separate SSE message
    for _, c := range responseMessage {
        fmt.Fprintf(w, "data: %s\n\n", string(c))
        flusher.Flush()
        time.Sleep(60 * time.Millisecond) // typing simulation
    }

    // End message
    fmt.Fprintf(w, "event: done\ndata: \n\n")
    flusher.Flush()
}

func main() {
    http.HandleFunc("/sse-chat", sseChatHandler)

    port := ":8081"
    log.Println("Mars AI SSE server running on port", port)
    log.Fatal(http.ListenAndServe(port, nil))
}