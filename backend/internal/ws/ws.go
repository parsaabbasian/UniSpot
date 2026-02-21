package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the client.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the client.
	pongWait = 60 * time.Second

	// Send pings to the client at this interval. Must be less than pongWait.
	pingPeriod = 45 * time.Second

	// Maximum message size allowed from client.
	maxMessageSize = 512

	// Broadcast channel buffer — prevents blocking on slow clients.
	broadcastBuffer = 256
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

// client holds a WebSocket connection and a buffered send channel.
type client struct {
	conn *websocket.Conn
	send chan []byte
}

// Hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	clients    map[*client]bool
	broadcast  chan []byte
	register   chan *client
	unregister chan *client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*client]bool),
		broadcast:  make(chan []byte, broadcastBuffer),
		register:   make(chan *client),
		unregister: make(chan *client),
	}
}

func (h *Hub) Run() {
	log.Printf("WebSocket Hub starting...")
	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			h.clients[c] = true
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("Client connected. Active: %d", count)
			h.broadcastUserCount()

		case c := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
			}
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("Client disconnected. Active: %d", count)
			h.broadcastUserCount()

		case message := <-h.broadcast:
			h.mu.RLock()
			clients := make([]*client, 0, len(h.clients))
			for c := range h.clients {
				clients = append(clients, c)
			}
			h.mu.RUnlock()

			for _, c := range clients {
				select {
				case c.send <- message:
				default:
					// Client send buffer full — drop and disconnect
					h.mu.Lock()
					if _, ok := h.clients[c]; ok {
						delete(h.clients, c)
						close(c.send)
					}
					h.mu.Unlock()
					log.Printf("Client send buffer full, dropping connection")
				}
			}
		}
	}
}

func (h *Hub) broadcastUserCount() {
	h.mu.RLock()
	count := len(h.clients)
	h.mu.RUnlock()
	h.BroadcastEvent("user_count", map[string]interface{}{"count": count})
}

// BroadcastEvent sends a typed action+data message to all connected clients.
func (h *Hub) BroadcastEvent(action string, data interface{}) {
	payload, err := json.Marshal(map[string]interface{}{
		"action": action,
		"data":   data,
	})
	if err != nil {
		log.Printf("BroadcastEvent marshal error: %v", err)
		return
	}

	select {
	case h.broadcast <- payload:
	default:
		log.Printf("WARNING: broadcast channel full, message dropped")
	}
}

var GlobalHub = NewHub()

// HandleConnections upgrades HTTP to WebSocket and registers the client.
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	c := &client{
		conn: conn,
		send: make(chan []byte, 64),
	}

	GlobalHub.register <- c

	// Start writer and reader goroutines
	go c.writePump()
	c.readPump()
}

// readPump reads from the WebSocket and handles pong messages.
// It also detects dead connections via read deadline.
func (c *client) readPump() {
	defer func() {
		GlobalHub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket unexpected close: %v", err)
			}
			break
		}
	}
}

// writePump pumps messages from the send channel to the WebSocket.
// It also sends periodic pings to keep the connection alive.
func (c *client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}

		case <-ticker.C:
			// Send ping to keep connection alive
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("WebSocket ping error: %v", err)
				return
			}
		}
	}
}
