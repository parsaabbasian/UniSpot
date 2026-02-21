package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now
	},
}

type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) Run() {
	log.Printf("WebSocket Hub starting...")
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("New client connected. Total active: %d", count)
			h.broadcastUserCount()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("Client disconnected. Total active: %d", count)
			h.broadcastUserCount()
		case message := <-h.broadcast:
			h.mu.Lock()
			clients := make([]*websocket.Conn, 0, len(h.clients))
			for client := range h.clients {
				clients = append(clients, client)
			}
			h.mu.Unlock()

			for _, client := range clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("error broadcasting to client: %v", err)
					client.Close()
					h.mu.Lock()
					delete(h.clients, client)
					h.mu.Unlock()
				}
			}
		}
	}
}

func (h *Hub) broadcastUserCount() {
	h.mu.Lock()
	count := len(h.clients)
	h.mu.Unlock()

	h.BroadcastEvent("user_count", map[string]interface{}{
		"count": count,
	})
}

func (h *Hub) BroadcastEvent(action string, data interface{}) {
	message := map[string]interface{}{
		"action": action,
		"data":   data,
	}
	payload, _ := json.Marshal(message)
	// Use a goroutine to prevent deadlock if BroadcastEvent is called
	// from within the Hub's own Run loop
	go func() {
		h.broadcast <- payload
	}()
}

var GlobalHub = NewHub()

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}

	GlobalHub.register <- conn

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			GlobalHub.unregister <- conn
			break
		}
	}
}
