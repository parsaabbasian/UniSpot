package handlers

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	activeUsers = make(map[string]time.Time)
	mu          sync.Mutex
)

func GetStats(c *gin.Context) {
	mu.Lock()
	defer mu.Unlock()

	// Clean up old sessions (> 5 mins)
	for ip, t := range activeUsers {
		if time.Since(t) > 5*time.Minute {
			delete(activeUsers, ip)
		}
	}

	// Update current user's timestamp
	activeUsers[c.ClientIP()] = time.Now()

	// Base number of 142 + actual active unique IPs
	// This ensures it never goes below 142 while still being "real" on top of that
	count := 142 + len(activeUsers)

	c.JSON(http.StatusOK, gin.H{
		"active_users": count,
	})
}
