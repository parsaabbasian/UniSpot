package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
)

type CreateEventRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Category    string  `json:"category" binding:"required"`
	Latitude    float64 `json:"lat" binding:"required"`
	Longitude   float64 `json:"lng" binding:"required"`
	Duration    int     `json:"duration_hours" binding:"required"` // hours from now
}

func CreateEvent(c *gin.Context) {
	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create PostGIS Point string
	locationStr := fmt.Sprintf("POINT(%f %f)", req.Longitude, req.Latitude)

	event := models.Event{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Location:    locationStr, // Note: Location is a string in the model, but gorm will use the geography type
		StartTime:   time.Now(),
		EndTime:     time.Now().Add(time.Duration(req.Duration) * time.Hour),
	}

	// Use raw SQL for the insertion to handle the ST_GeogFromText conversion
	query := `
		INSERT INTO events (title, description, category, location, start_time, end_time)
		VALUES (?, ?, ?, ST_GeogFromText(?), ?, ?)
		RETURNING id
	`

	var id uint
	if err := database.DB.Raw(query, event.Title, event.Description, event.Category, event.Location, event.StartTime, event.EndTime).Scan(&id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	event.ID = id
	c.JSON(http.StatusCreated, event)
}
