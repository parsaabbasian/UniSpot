package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
	"github.com/parsaabbasian/unispot/backend/internal/ws"
)

type VerifyEventRequest struct {
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
}

func VerifyEvent(c *gin.Context) {
	id := c.Param("id")
	ipAddress := c.ClientIP()

	var req VerifyEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Fallback for older clients or simpler requests
		req.UserName = "Student"
	}

	var event models.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Check if this IP has already verified this event
	var existingVerification models.Verification
	err := database.DB.Where("event_id = ? AND ip_address = ?", event.ID, ipAddress).First(&existingVerification).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already verified this event"})
		return
	}

	// Double check to ensure we don't increment twice (race condition check via DB constraint)
	verification := models.Verification{
		EventID:   event.ID,
		IPAddress: ipAddress,
		UserName:  req.UserName,
		UserEmail: req.UserEmail,
	}

	if err := database.DB.Create(&verification).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Verification already recorded"})
		return
	}

	// Increment verification count
	if err := database.DB.Model(&event).Update("verified_count", event.VerifiedCount+1).Error; err != nil {
		// Rollback verification if count update fails (manual since not using transaction for simplicity here, but model constraint will prevent major issues)
		database.DB.Delete(&verification)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	newCount := event.VerifiedCount + 1

	// Broadcast the update
	ws.GlobalHub.BroadcastEvent("verify_event", gin.H{
		"id":             event.ID,
		"verified_count": newCount,
		"user_name":      req.UserName,
	})

	c.JSON(http.StatusOK, gin.H{
		"message":        "Event verified successfully",
		"verified_count": newCount,
	})
}
