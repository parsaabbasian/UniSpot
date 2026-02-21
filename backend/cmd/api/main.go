package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/handlers"
	"github.com/parsaabbasian/unispot/backend/internal/ws"
)

func main() {
	// Connect to database
	database.Connect()

	// Start WebSocket hub
	go ws.GlobalHub.Run()

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
