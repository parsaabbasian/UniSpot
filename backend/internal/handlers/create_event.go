package handlers

import (
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
	"github.com/parsaabbasian/unispot/backend/internal/ws"
)

type CreateEventRequest struct {
	Title        string  `json:"title" binding:"required"`
	Description  string  `json:"description"`
	Category     string  `json:"category" binding:"required"`
	Latitude     float64 `json:"lat" binding:"required"`
	Longitude    float64 `json:"lng" binding:"required"`
	Duration     float64 `json:"duration_hours" binding:"required"` // hours from now
	CreatorName  string  `json:"creator_name"`
	CreatorEmail string  `json:"creator_email"`
}

const (
	YorkULat      = 43.7735
	YorkULng      = -79.5019
	MaxDistanceKm = 2.5
)

func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0 // Earth radius in km
	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*(math.Pi/180.0))*math.Cos(lat2*(math.Pi/180.0))*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func CreateEvent(c *gin.Context) {
	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Geofencing Check
	dist := calculateDistance(req.Latitude, req.Longitude, YorkULat, YorkULng)
	if dist > MaxDistanceKm {
		c.JSON(http.StatusForbidden, gin.H{"error": fmt.Sprintf("Deployment failed: Signal origin is too far from campus (%.2f km)", dist)})
		return
	}

	// Create PostGIS Point string
	locationStr := fmt.Sprintf("POINT(%f %f)", req.Longitude, req.Latitude)

	event := models.Event{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Location:    locationStr, // Note: Location is a string in the model, but gorm will use the geography type
		StartTime:   time.Now().UTC().Add(-1 * time.Minute),
		EndTime:     time.Now().UTC().Add(time.Duration(req.Duration * float64(time.Hour))),
	}

	// Use raw SQL for the insertion to handle the ST_GeogFromText conversion
	query := `
		INSERT INTO events (title, description, category, location, start_time, end_time, creator_name, creator_email)
		VALUES (?, ?, ?, ST_GeogFromText(?), ?, ?, ?, ?)
		RETURNING id
	`

	var id uint
	if err := database.DB.Raw(query, req.Title, req.Description, req.Category, locationStr, event.StartTime, event.EndTime, req.CreatorName, req.CreatorEmail).Scan(&id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	event.ID = id
	event.Latitude = req.Latitude
	event.Longitude = req.Longitude

	// Broadcast the new event to all connected clients
	ws.GlobalHub.BroadcastEvent("new_event", event)

	c.JSON(http.StatusCreated, event)
}
