package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
)

func AdminGetEvents(c *gin.Context) {
	var results []struct {
		models.Event
		LocationText string         `gorm:"column:location_text"`
		Verifiers    pq.StringArray `gorm:"column:verifier_names"`
	}

	query := `
		SELECT 
			e.*, 
			ST_AsText(e.location) as location_text, 
			COALESCE(array_agg(v.user_name) FILTER (WHERE v.user_name IS NOT NULL), '{}') as verifier_names
		FROM events e
		LEFT JOIN verifications v ON e.id = v.event_id
		GROUP BY e.id, location_text
		ORDER BY e.id DESC
	`

	if err := database.DB.Raw(query).Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	events := make([]models.Event, len(results))
	for i, res := range results {
		events[i] = res.Event
		events[i].Verifiers = []string(res.Verifiers)

		// Parse POINT(lng lat)
		loc := strings.TrimPrefix(res.LocationText, "POINT(")
		loc = strings.TrimSuffix(loc, ")")
		parts := strings.Split(loc, " ")
		if len(parts) == 2 {
			fmt.Sscanf(parts[0], "%f", &events[i].Longitude)
			fmt.Sscanf(parts[1], "%f", &events[i].Latitude)
		}
	}

	c.JSON(http.StatusOK, events)
}

func AdminToggleApproval(c *gin.Context) {
	id := c.Param("id")
	var event models.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	event.IsApproved = !event.IsApproved
	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

func AdminDeleteEvent(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Event{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
