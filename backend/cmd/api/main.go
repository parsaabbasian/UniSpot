package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strconv"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/handlers"
	"github.com/parsaabbasian/unispot/backend/internal/models"
	"github.com/parsaabbasian/unispot/backend/internal/ws"
)

func main() {
	// Connect to database
	database.Connect()

	// Start WebSocket hub
	go ws.GlobalHub.Run()

	// Start Database Listener for real-time deletions
	go startDBListener()

	// Start Event Expiry Worker
	go startEventExpiryWorker()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API routes
	api := r.Group("/api")
	{
		api.GET("/events", handlers.GetEvents)
		api.POST("/events", handlers.CreateEvent)
		api.POST("/events/:id/verify", handlers.VerifyEvent)
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "version": "1.0.1"})
		})
	}

	r.GET("/ws", func(c *gin.Context) {
		ws.HandleConnections(c.Writer, c.Request)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}

func startDBListener() {
	_ = godotenv.Load()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Printf("DB Listener: DATABASE_URL not set, skipping real-time sync")
		return
	}

	conn, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		log.Printf("Failed to connect for listening: %v", err)
		return
	}
	defer conn.Close(context.Background())

	// LISTEN to both delete and update channels
	_, err = conn.Exec(context.Background(), "LISTEN event_deleted; LISTEN event_updated")
	if err != nil {
		log.Printf("Failed to listen: %v", err)
		return
	}

	log.Printf("DB Listener active: watching event_deleted and event_updated channels")

	for {
		notification, err := conn.WaitForNotification(context.Background())
		if err != nil {
			log.Printf("Error waiting for notification: %v", err)
			continue
		}

		switch notification.Channel {
		case "event_deleted":
			id, _ := strconv.Atoi(notification.Payload)
			ws.GlobalHub.BroadcastEvent("delete_event", map[string]interface{}{
				"id": id,
			})
			log.Printf("Broadcasted delete_event for ID: %d", id)

		case "event_updated":
			// Payload is the full row JSON from row_to_json(NEW)
			var updatedEvent map[string]interface{}
			if err := json.Unmarshal([]byte(notification.Payload), &updatedEvent); err != nil {
				log.Printf("Failed to parse updated event: %v", err)
				continue
			}
			ws.GlobalHub.BroadcastEvent("update_event", updatedEvent)
			log.Printf("Broadcasted update_event: %v", updatedEvent["id"])
		}
	}
}

func startEventExpiryWorker() {
	ticker := time.NewTicker(1 * time.Minute)
	log.Printf("Event Expiry Worker started...")

	for range ticker.C {
		now := time.Now().UTC()
		// Delete events where end_time < now
		result := database.DB.Where("end_time < ?", now).Delete(&models.Event{})
		if result.RowsAffected > 0 {
			log.Printf("Expired %d events", result.RowsAffected)
		}
	}
}
