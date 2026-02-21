package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
)

func VerifyEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Increment verification count
	if err := database.DB.Model(&event).Update("verified_count", event.VerifiedCount+1).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Event verified successfully",
		"verified_count": event.VerifiedCount + 1,
	})
}
