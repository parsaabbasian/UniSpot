package main

import (
	"context"
	"log"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/handlers"
	"github.com/parsaabbasian/unispot/backend/internal/ws"
)

func main() {
	// Connect to database
	database.Connect()

	// Start WebSocket hub
	go ws.GlobalHub.Run()

	// Start Database Listener for real-time deletions
	go startDBListener()

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
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://postgres.krkhwckszzjjeycxapaq:APazrRPp6Re7r+Y@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
	}

	conn, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		log.Printf("Failed to connect for listening: %v", err)
		return
	}
	defer conn.Close(context.Background())

	_, err = conn.Exec(context.Background(), "LISTEN event_deleted")
	if err != nil {
		log.Printf("Failed to listen: %v", err)
		return
	}

	for {
		notification, err := conn.WaitForNotification(context.Background())
		if err != nil {
			log.Printf("Error waiting for notification: %v", err)
			continue
		}

		// Convert ID to int for consistency with frontend expectations if possible
		id, _ := strconv.Atoi(notification.Payload)

		ws.GlobalHub.BroadcastEvent("delete_event", map[string]interface{}{
			"id": id,
		})
	}
}
